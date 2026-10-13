import { NextResponse } from "next/server";
import { sanitizeAnswers, sanitizeDiscovery, validateAll, validateDiscovery } from "@/lib/application";
import { scoreApplication } from "@/lib/qualification";
import { deliverApplication, type ApplicationRecord } from "@/lib/server/destinations";

export const runtime = "nodejs";

/**
 * Local/server-mode endpoint. Production (www.madvertlabs.com/custom-patches) posts to the main
 * site's /api/custom-patches/leads instead — keep both in step.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot + minimum fill time: bots get a success-shaped reply and nothing is processed.
  const startedAt = Number(body.startedAt) || 0;
  if ((typeof body.website_confirm === "string" && body.website_confirm) || Date.now() - startedAt < 2500) {
    return NextResponse.json({ ok: true, qualified: false });
  }

  const form = body.form === "discovery" ? "discovery" : "application";
  const attribution =
    body.attribution && typeof body.attribution === "object" && JSON.stringify(body.attribution).length <= 4000
      ? (body.attribution as Record<string, unknown>)
      : {};
  const base = {
    id: crypto.randomUUID(),
    submitted_at: new Date().toISOString(),
    country: req.headers.get("x-vercel-ip-country") || "",
    attribution,
    page_url: typeof body.page_url === "string" ? body.page_url.slice(0, 500) : undefined,
    user_agent: req.headers.get("user-agent")?.slice(0, 300) || undefined,
  };

  let record: ApplicationRecord;
  let qualified: boolean | undefined;
  if (form === "discovery") {
    const d = sanitizeDiscovery(body.answers);
    if (Object.keys(validateDiscovery(d)).length) {
      return NextResponse.json({ ok: false, error: "Please complete all required fields." }, { status: 422 });
    }
    record = { ...base, form, name: d.fullName, company: d.businessName, website: d.website, email: d.email, phone: d.phone, answers: d };
  } else {
    const a = sanitizeAnswers(body.answers);
    if (Object.keys(validateAll(a)).length) {
      return NextResponse.json({ ok: false, error: "Please complete all required fields." }, { status: 422 });
    }
    // Score on the server — never trust a client-side score.
    const result = scoreApplication(a);
    qualified = result.qualified;
    record = {
      ...base,
      form,
      name: a.fullName,
      company: a.company,
      website: a.website,
      email: a.email,
      phone: a.phone,
      answers: a,
      qualification_score: result.score,
      qualified: result.qualified,
      qualification_flags: [...result.flags, ...result.hardStops.map((h) => `hard_stop:${h}`)],
    };
  }

  const delivery = await deliverApplication(record);
  if (delivery.configured === 0) {
    return NextResponse.json(
      { ok: false, error: "Submissions aren't connected yet, so your details weren't saved. Please book a call using the calendar instead." },
      { status: 503 },
    );
  }
  if (delivery.delivered.length === 0) {
    return NextResponse.json(
      { ok: false, error: "We couldn't save your details right now. Please try again in a moment." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, id: record.id, qualified });
}
