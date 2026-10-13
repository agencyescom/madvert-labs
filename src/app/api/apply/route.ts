import { NextResponse } from "next/server";
import { z } from "zod";
import {
  GhlError,
  PATCHES_GHL,
  addNote,
  addTags,
  createOpportunity,
  blankCustomFields,
  buildCustomFields,
  findOpenOpportunity,
  ghlConfig,
  upsertContact,
  type AnswerMapping,
  type GhlConfig,
} from "@/integrations/ghl";
import { processLead, requestContext } from "@/integrations/leads";
import { clientIp, rateLimit } from "@/integrations/rate-limit";
import type { LeadPayload } from "@/integrations/types";

/**
 * Patches Partnership application (www.madvertlabs.com/custom-patches).
 *
 * 1. validate + normalise   2. upsert the GHL contact with mapped custom fields
 * 3. add the application tag   4. create (or reuse) the open opportunity in New Application
 * 5. save every answer + attribution as a contact note   6. respond
 *
 * The page only reveals the booking calendar after this route returns ok: true.
 * Appointment booking, the call-booked tag, stage moves and reminders are handled by the
 * published GHL workflow "Patches Partnership Call Workflow", never here.
 */

const MIN_FILL_MS = 2500;
const FAIL_MESSAGE = "We couldn’t save your application just yet. Your information is still here — please try again.";

// ── Options shown on the current form (landing-source/src/lib/application.ts) ──
const REVENUE = ["Under $10k", "$10k–$25k", "$25k–$50k", "$50k–$100k", "$100k–$250k", "$250k+"] as const;
const CHANNELS = [
  "Referrals & repeat customers",
  "Google / SEO",
  "Paid ads (Meta, Google)",
  "Marketplaces (Etsy, Amazon, Alibaba)",
  "Cold email / LinkedIn outreach",
  "Sales reps & trade shows",
  "Organic social media",
  "Other",
] as const;
const RFQS = ["Under 50", "50–100", "100–250", "250–500", "500+"] as const;
const MARKETS = ["USA", "Canada", "UK", "Europe", "Australia", "Other"] as const;
const MANUFACTURING = ["We manufacture in-house", "We outsource manufacturing", "Both"] as const;
const MARKET_LABEL: Record<(typeof MARKETS)[number], string> = {
  USA: "United States",
  Canada: "Canada",
  UK: "United Kingdom",
  Europe: "Europe",
  Australia: "Australia",
  Other: "Other",
};

const MARKET_ALIASES: Record<(typeof MARKETS)[number], string[]> = {
  USA: ["United States", "USA", "US", "U.S.", "United States of America"],
  Canada: ["Canada"],
  UK: ["United Kingdom", "UK", "U.K."],
  Europe: ["Europe", "EU"],
  Australia: ["Australia"],
  Other: ["Other"],
};
const MANUFACTURING_ALIASES: Record<(typeof MANUFACTURING)[number], string[]> = {
  "We manufacture in-house": ["We manufacture in-house", "In-house", "In-house manufacturing", "Manufacture in-house"],
  "We outsource manufacturing": ["We outsource manufacturing", "Outsource", "Outsourced", "Outsourced manufacturing"],
  Both: ["Both", "Both in-house and outsourced"],
};

const attributionValue = z.string().max(500).optional().nullable();
const touch = z
  .object({
    utm_source: attributionValue,
    utm_medium: attributionValue,
    utm_campaign: attributionValue,
    utm_content: attributionValue,
    utm_term: attributionValue,
    fbclid: attributionValue,
    gclid: attributionValue,
    meta_campaign_id: attributionValue,
    meta_adset_id: attributionValue,
    meta_ad_id: attributionValue,
    landing_page: attributionValue,
    referrer: attributionValue,
    captured_at: attributionValue,
  })
  .partial()
  .nullable()
  .optional()
  .catch(null);

const schema = z.object({
  form: z.literal("discovery"),
  submissionId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
  startedAt: z.number().optional(),
  website_confirm: z.string().max(200).optional(),
  page_url: z.string().max(500).optional(),
  attribution: z
    .object({ first: touch, last: touch, fbp: z.string().max(200).optional(), fbc: z.string().max(300).optional() })
    .partial()
    .optional()
    .catch({}),
  answers: z.object({
    fullName: z.string().trim().min(2).max(120),
    businessName: z.string().trim().min(2).max(160),
    email: z.email().max(200),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine((v) => v.replace(/\D/g, "").length >= 7),
    website: z
      .string()
      .trim()
      .max(300)
      .regex(/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i),
    monthlyRevenue: z.enum(REVENUE),
    customerChannels: z.array(z.enum(CHANNELS)).min(1).max(CHANNELS.length),
    rfqsPerMonth: z.enum(RFQS),
    markets: z.array(z.enum(MARKETS)).min(1).max(MARKETS.length),
    manufacturing: z.enum(MANUFACTURING),
  }),
});

type Answers = z.infer<typeof schema>["answers"];
type Result = { status: number; body: { ok: boolean; error?: string } };

/** Same submissionId within 15 minutes returns the first result (double clicks, retries, replays). */
const recent = new Map<string, { at: number; result: Promise<Result> }>();
function remember(key: string, run: () => Promise<Result>) {
  const now = Date.now();
  for (const [k, v] of recent) if (now - v.at > 15 * 60_000) recent.delete(k);
  const hit = recent.get(key);
  if (hit) return hit.result;
  const result = run().then((r) => {
    if (!r.body.ok) recent.delete(key); // failed attempts may be retried with the same id
    return r;
  });
  recent.set(key, { at: now, result });
  return result;
}

const list = (v: readonly string[]) => v.join(", ");
const clean = (v?: string | null) => (v ?? "").trim();
const normaliseWebsite = (w: string) => (/^https?:\/\//i.test(w) ? w : `https://${w}`);
const normalisePhone = (p: string) => {
  const t = p.trim();
  return t.startsWith("+") ? `+${t.slice(1).replace(/\D/g, "")}` : t.replace(/[^\d]/g, "");
};

async function submit(cfg: GhlConfig, a: Answers, attr: z.infer<typeof schema>["attribution"], req: Request, pageUrl?: string): Promise<Result> {
  const [firstName, ...rest] = a.fullName.trim().split(/\s+/);
  const markets = a.markets.map((m) => MARKET_LABEL[m]);

  // Every questionnaire answer goes to its "Patches Partnership Application" custom field, shaped for
  // the field's type (dropdown / multi-select values must equal the field's option labels exactly).
  const mappings: AnswerMapping[] = [
    { answer: "Markets served", id: PATCHES_GHL.customFields.marketsServed, values: a.markets.map((m) => MARKET_ALIASES[m]) },
    {
      answer: "RFQs wanted per month",
      id: PATCHES_GHL.customFields.desiredRfqVolume,
      values: [[a.rfqsPerMonth, `${a.rfqsPerMonth} / Month`, `${a.rfqsPerMonth} per month`, `${a.rfqsPerMonth} RFQs`, `${a.rfqsPerMonth} RFQs / Month`]],
    },
    { answer: "Current monthly revenue", match: /revenue/i, values: [[a.monthlyRevenue]] },
    {
      answer: "How customers currently come to them",
      match: /channel|lead source|customer source|customers? .*(com|find)|acquisition/i,
      values: a.customerChannels.map((c) => [c]),
    },
    { answer: "Manufacturing", match: /manufactur|in-?house|outsourc/i, values: [MANUFACTURING_ALIASES[a.manufacturing]] },
  ];
  const { customFields, report } = await buildCustomFields(cfg, mappings);

  const contact = await upsertContact(cfg, {
    firstName,
    lastName: rest.join(" ") || undefined,
    name: a.fullName.trim(),
    email: a.email.trim().toLowerCase(),
    phone: normalisePhone(a.phone),
    companyName: a.businessName.trim(),
    website: normaliseWebsite(a.website.trim()),
    customFields,
  });

  await addTags(cfg, contact.id, [PATCHES_GHL.applicationTag]);

  // Read the contact back: GHL silently drops values it can't store, so check every field we sent.
  let blank: string[] = [];
  try {
    blank = await blankCustomFields(cfg, contact.id, customFields.map((f) => f.id));
  } catch (e) {
    console.warn("[apply] could not read the contact back to verify custom fields:", e instanceof GhlError ? `${e.step} HTTP ${e.status}` : e);
  }
  console.info("[apply] custom fields", JSON.stringify(report.map((r) => ({ ...r, savedBlank: r.fieldId ? blank.includes(r.fieldId) : undefined }))));
  for (const r of report) if (r.problem) console.warn(`[apply] custom field "${r.answer}": ${r.problem}`);
  if (blank.length) console.warn(`[apply] custom fields still blank after save on contact ${contact.id}: ${blank.join(", ")}`);

  // One open opportunity per contact in this pipeline: retries, double submits and re-applications
  // while a deal is still open reuse it. Once it is won or lost, a new application creates a new one.
  let opportunity = await findOpenOpportunity(cfg, contact.id);
  const reused = !!opportunity;
  if (!opportunity) {
    try {
      opportunity = await createOpportunity(cfg, contact.id, `${a.businessName.trim() || a.fullName.trim()} — Patches Partnership`);
    } catch (e) {
      // GHL rejects duplicates when "allow duplicate opportunities" is off; reuse the existing one.
      opportunity = await findOpenOpportunity(cfg, contact.id);
      if (!opportunity) throw e;
    }
  }

  const t = { ...(attr?.first ?? {}), ...(attr?.last ?? {}) };
  const note = [
    "Patches Partnership application (madvertlabs.com/custom-patches)",
    "",
    `Name: ${a.fullName.trim()}`,
    `Business: ${a.businessName.trim()}`,
    `Email: ${a.email.trim()}`,
    `Phone / WhatsApp: ${a.phone.trim()}`,
    `Website: ${a.website.trim()}`,
    `Current monthly revenue: ${a.monthlyRevenue}`,
    `How customers currently come to them: ${list(a.customerChannels)}`,
    `RFQs wanted per month: ${a.rfqsPerMonth}`,
    `Markets served: ${list(markets)}`,
    `Manufacturing: ${a.manufacturing}`,
    "",
    "Attribution",
    ...(
      [
        ["utm_source", t.utm_source],
        ["utm_medium", t.utm_medium],
        ["utm_campaign", t.utm_campaign],
        ["utm_content", t.utm_content],
        ["utm_term", t.utm_term],
        ["fbclid", t.fbclid],
        ["Meta campaign ID", t.meta_campaign_id],
        ["Meta ad set ID", t.meta_adset_id],
        ["Meta ad ID", t.meta_ad_id],
        ["Landing page", t.landing_page ?? pageUrl],
        ["First landing page", attr?.first?.landing_page],
        ["Referrer", t.referrer],
      ] as const
    )
      .filter(([, v]) => clean(v))
      .map(([k, v]) => `${k}: ${clean(v)}`),
  ].join("\n");
  await addNote(cfg, contact.id, note);

  console.info("[apply] saved", { contact: contact.id, newContact: contact.isNew, opportunity: opportunity.id, reusedOpportunity: reused });

  // Existing server-side conversions (Meta CAPI, GA4) and internal email; no webhook fan-out,
  // so a configured GHL inbound webhook can't create a second contact.
  const lead: LeadPayload = {
    kind: "growth_brief",
    eventId: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    contact: { name: a.fullName.trim(), email: a.email.trim(), phone: a.phone.trim(), business: a.businessName.trim(), website: a.website.trim() },
    answers: {
      monthly_revenue: a.monthlyRevenue,
      customer_channels: list(a.customerChannels),
      rfqs_per_month: a.rfqsPerMonth,
      markets: list(markets),
      manufacturing: a.manufacturing,
    },
    service: "custom-patches",
    intent: "custom-patches-application",
    attribution: {
      utm_source: clean(t.utm_source) || undefined,
      utm_medium: clean(t.utm_medium) || undefined,
      utm_campaign: clean(t.utm_campaign) || undefined,
      utm_content: clean(t.utm_content) || undefined,
      utm_term: clean(t.utm_term) || undefined,
      fbclid: clean(t.fbclid) || undefined,
      gclid: clean(t.gclid) || undefined,
      landing_page: clean(t.landing_page) || undefined,
      referrer: clean(t.referrer) || undefined,
    },
    request: { ...requestContext(req), fbp: attr?.fbp ?? requestContext(req).fbp, fbc: attr?.fbc ?? requestContext(req).fbc },
  };
  processLead(lead, { alreadyDispatched: true });

  return { status: 200, body: { ok: true } };
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = await rateLimit(`apply:${ip}`, 10, 600);
  if (!limit.ok) return NextResponse.json({ ok: false, error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields and try again." }, { status: 422 });
  }
  const data = parsed.data;

  // Honeypot + minimum fill time: bots get a success-shaped reply and nothing is saved.
  if (data.website_confirm || Date.now() - (data.startedAt ?? 0) < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const cfg = ghlConfig();
  if (!cfg.ok) {
    console.error("[apply] GHL is not configured; missing:", cfg.missing.join(", "));
    return NextResponse.json({ ok: false, error: FAIL_MESSAGE }, { status: 503 });
  }

  const key = `${data.submissionId}:${data.answers.email.toLowerCase()}`;
  const result = await remember(key, async () => {
    try {
      return await submit(cfg.config, data.answers, data.attribution, req, data.page_url);
    } catch (e) {
      if (e instanceof GhlError) console.error(`[apply] ${e.step} failed: HTTP ${e.status} ${e.detail}`);
      else console.error("[apply] unexpected error:", e instanceof Error ? e.message : e);
      return { status: 502, body: { ok: false, error: FAIL_MESSAGE } };
    }
  });
  return NextResponse.json(result.body, { status: result.status });
}
