import { NextResponse } from "next/server";
import { z } from "zod";
import { processLead, requestContext } from "@/integrations/leads";
import { clientIp, rateLimit } from "@/integrations/rate-limit";
import type { LeadPayload } from "@/integrations/types";
import { dispatchLead } from "@/integrations/webhooks";

/**
 * Leads from the static /custom-patches landing page (partnership application + discovery-call
 * form). Unlike /api/leads, this route waits for CRM / webhook delivery before answering, so the
 * page only shows a success state when the lead actually reached a destination
 * (GOHIGHLEVEL_WEBHOOK_URL, Zapier, Make, n8n, generic webhook, HubSpot or Slack).
 */

const MIN_FILL_MS = 2500;
const str = (max: number) => z.string().trim().max(max);
const list = z.array(z.string().max(80)).max(20);

const contact = {
  fullName: str(120).min(2),
  email: z.email().max(200),
  phone: str(40).min(7),
  website: str(300).min(3),
};

const application = z.object({
  form: z.literal("application"),
  answers: z.object({
    ...contact,
    company: str(160).min(2),
    productionLocation: str(40).min(1),
    productionLocationOther: str(80).optional(),
    markets: list.min(1),
    patchTypes: list.min(1),
    quoteHandler: str(30).min(1),
    responseTime: str(30).min(1),
    usesCrm: str(5).min(1),
    runsAds: str(5).min(1),
    customerChannels: list.min(1),
    desiredVolume: str(20).min(1),
    canInvest: str(5).min(1),
    successNotes: str(2000).optional(),
    qualification_score: z.number().optional(),
    qualified: z.boolean().optional(),
    qualification_flags: list.optional(),
  }),
});

const discovery = z.object({
  form: z.literal("discovery"),
  answers: z.object({
    ...contact,
    businessName: str(160).min(2),
    monthlyRevenue: str(30).min(1),
    customerChannels: list.min(1),
    rfqsPerMonth: str(30).min(1),
    markets: list.min(1),
    manufacturing: str(40).min(1),
  }),
});

const envelope = z.object({
  attribution: z.record(z.string(), z.unknown()).optional(),
  startedAt: z.number().optional(),
  website_confirm: z.string().optional(),
});

const flat = (v: unknown) => (Array.isArray(v) ? v.join(", ") : v === undefined || v === null ? undefined : String(v));
const pick = (o: unknown, k: string) => (o && typeof o === "object" ? flat((o as Record<string, unknown>)[k]) : undefined);

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = await rateLimit(`custom-patches:${ip}`, 8, 600);
  if (!limit.ok) return NextResponse.json({ ok: false, error: "Too many submissions. Please try again in a few minutes." }, { status: 429 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const meta = envelope.safeParse(raw);
  // Honeypot + minimum fill time. Bots get a success-shaped reply and nothing is processed.
  if (!meta.success || meta.data.website_confirm || Date.now() - (meta.data.startedAt ?? 0) < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const parsed = z.discriminatedUnion("form", [application, discovery]).safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please complete all required fields and try again." }, { status: 422 });
  }
  const data = parsed.data;
  const a = data.answers;

  // The page sends { first, last, fbp, fbc }; the CRM gets the latest touch, falling back to the first.
  const attr = meta.data.attribution ?? {};
  const touch = (attr.last ?? attr.first ?? {}) as Record<string, unknown>;
  const first = (attr.first ?? {}) as Record<string, unknown>;

  const answers: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(a)
      .filter(([k]) => !["fullName", "email", "phone", "website"].includes(k))
      .map(([k, v]) => [k, flat(v)]),
  );
  answers.meta_campaign_id = pick(touch, "meta_campaign_id");
  answers.meta_adset_id = pick(touch, "meta_adset_id");
  answers.meta_ad_id = pick(touch, "meta_ad_id");

  const lead: LeadPayload = {
    kind: "growth_brief",
    eventId: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    contact: {
      name: a.fullName,
      email: a.email,
      phone: a.phone,
      business: data.form === "application" ? data.answers.company : data.answers.businessName,
      website: a.website,
    },
    answers,
    service: "custom-patches",
    intent: data.form === "application" ? "custom-patches-application" : "custom-patches-discovery-call",
    attribution: {
      utm_source: pick(touch, "utm_source"),
      utm_medium: pick(touch, "utm_medium"),
      utm_campaign: pick(touch, "utm_campaign"),
      utm_content: pick(touch, "utm_content"),
      utm_term: pick(touch, "utm_term"),
      fbclid: pick(touch, "fbclid"),
      gclid: pick(touch, "gclid"),
      landing_page: pick(touch, "landing_page"),
      first_page: pick(first, "landing_page"),
      referrer: pick(touch, "referrer"),
      first_seen: pick(first, "captured_at"),
      timestamp: new Date().toISOString(),
    },
    request: { ...requestContext(req), fbp: pick(attr, "fbp") ?? requestContext(req).fbp, fbc: pick(attr, "fbc") ?? requestContext(req).fbc },
  };

  const delivery = await dispatchLead(lead);
  if (delivery.attempted === 0) {
    console.error("[custom-patches] No CRM/webhook destination configured — lead NOT saved.");
    return NextResponse.json(
      { ok: false, error: "Our form isn't connected right now, so your details weren't saved. Please book a call using the calendar." },
      { status: 503 },
    );
  }
  if (delivery.delivered === 0) {
    return NextResponse.json({ ok: false, error: "We couldn't save your details right now. Please try again in a moment." }, { status: 502 });
  }

  // Conversions + internal notification run after the response.
  processLead(lead, { alreadyDispatched: true });
  return NextResponse.json({ ok: true });
}
