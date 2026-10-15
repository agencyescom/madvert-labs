import "server-only";
import type { Onboarding } from "../types";
import { accessStatusOf, computeProgress } from "../progress";
import { ACCESS_BY_KEY } from "../template/access";
import { SERVICES } from "../template/services";
import { db } from "./db";
import { audit, emit } from "./events";
import { loadContext, progressInput } from "./repo";

/**
 * "Create client in CRM": one click in Operations.
 *
 * GoHighLevel (LeadConnector API v2) when GHL_ACCESS_TOKEN + GHL_LOCATION_ID are set:
 *   upsert contact → add tags → add an onboarding summary note → (optional) create an opportunity
 *   in ONBOARDING_GHL_PIPELINE_ID / ONBOARDING_GHL_STAGE_ID.
 * Otherwise the CLIENT_CREATED_IN_CRM event goes to the configured automation webhooks
 * (ONBOARDING_WEBHOOK_URL, GOHIGHLEVEL_WEBHOOK_URL, N8N_WEBHOOK_URL, …) for a workflow to create it.
 * Never sends credentials, tokens or file URLs. Re-running updates the same contact (upsert).
 */

const API = process.env.GHL_API_BASE || "https://services.leadconnectorhq.com";

async function ghl<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
      Version: "2021-07-28",
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GoHighLevel ${method} ${path.split("?")[0]} failed (${res.status}): ${text.slice(0, 200)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

export function crmMode(): "gohighlevel" | "webhook" | "none" {
  if (process.env.GHL_ACCESS_TOKEN && process.env.GHL_LOCATION_ID) return "gohighlevel";
  if (process.env.ONBOARDING_WEBHOOK_URL || process.env.GOHIGHLEVEL_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || process.env.ZAPIER_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL || process.env.GENERIC_WEBHOOK_URL)
    return "webhook";
  return "none";
}

export async function createClientInCrm(onboardingId: string, by: string) {
  const ctx = await loadContext(onboardingId);
  if (!ctx) return { ok: false as const, error: "Onboarding not found." };
  const mode = crmMode();
  if (mode === "none")
    return {
      ok: false as const,
      configurationRequired: true,
      error: "Configuration required: set GHL_ACCESS_TOKEN and GHL_LOCATION_ID (GoHighLevel private integration), or an automation webhook URL.",
    };

  const o = ctx.onboarding;
  const input = progressInput(ctx);
  const p = computeProgress(input);
  const company = ctx.answers["business.company"] ?? {};
  const str = (v: unknown) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v));
  const services = ctx.engagement.services.map((s) => SERVICES[s]?.label ?? s);
  const website = str(company.website);
  const tags = ["madvert-client", "onboarding", o.completedAt ? "onboarding-complete" : "onboarding-in-progress", ...ctx.engagement.services.map((s) => `service-${s.replace(/_/g, "-")}`)];
  const lines = [
    `Madvert onboarding · ${o.companyName}`,
    `Progress: ${p.overall}% · Business ${p.byKey.business.percent}% · Access ${p.byKey.access.percent}% · Assets ${p.byKey.assets.percent}%`,
    `Services: ${services.join(", ")}`,
    `Account manager: ${o.accountManager.name} · Strategist: ${o.strategist ?? "—"}`,
    ctx.booking?.startsAt ? `Kickoff: ${new Date(ctx.booking.startsAt).toUTCString()} (${ctx.booking.timezone ?? "UTC"})` : "Kickoff: not booked",
    `Industry: ${str(company.industry)} · Countries: ${str(company.countries)}`,
    `Primary goal: ${str(ctx.answers["business.growth"]?.primary_goal)}`,
    "Access:",
    ...ctx.template.access.map((a) => `  • ${ACCESS_BY_KEY[a.key]?.label ?? a.key}: ${accessStatusOf(input, a.key).replace("_", " ")}`),
  ];
  const now = new Date().toISOString();

  if (mode === "gohighlevel") {
    const loc = process.env.GHL_LOCATION_ID!;
    const up = await ghl<{ contact?: { id?: string } }>("POST", "/contacts/upsert", {
      locationId: loc,
      firstName: o.contact.firstName,
      lastName: o.contact.lastName ?? "",
      name: [o.contact.firstName, o.contact.lastName].filter(Boolean).join(" "),
      email: o.contact.email,
      phone: o.contact.phone || str(company.contact_phone) || undefined,
      companyName: str(company.legal_name) || o.companyName,
      website: website || undefined,
      timezone: str(company.timezone).split(" ")[0] || undefined,
      source: "Madvert Onboarding Portal",
    });
    const contactId = up.contact?.id;
    if (!contactId) throw new Error("GoHighLevel returned no contact id");
    await ghl("POST", `/contacts/${encodeURIComponent(contactId)}/tags`, { tags });
    await ghl("POST", `/contacts/${encodeURIComponent(contactId)}/notes`, { body: lines.join("\n") });
    let opportunityId = o.crm?.opportunityId;
    const pipelineId = process.env.ONBOARDING_GHL_PIPELINE_ID;
    const stageId = process.env.ONBOARDING_GHL_STAGE_ID;
    if (pipelineId && stageId && !opportunityId) {
      const opp = await ghl<{ opportunity?: { id?: string } }>("POST", "/opportunities/", {
        locationId: loc,
        pipelineId,
        pipelineStageId: stageId,
        contactId,
        name: `${o.companyName} · Madvert client`,
        status: "open",
        source: "Madvert Onboarding Portal",
      });
      opportunityId = opp.opportunity?.id;
    }
    const appBase = (process.env.GHL_APP_BASE || "https://app.gohighlevel.com").replace(/\/$/, "");
    const crm: NonNullable<Onboarding["crm"]> = { provider: "gohighlevel", contactId, opportunityId, url: `${appBase}/v2/location/${loc}/contacts/detail/${contactId}`, syncedAt: now, syncedBy: by };
    await db().put<Onboarding>("onboardings", { ...o, crm, updatedAt: now });
    await emit(o, "CLIENT_CREATED_IN_CRM", { provider: "gohighlevel", contact_id: contactId, opportunity_id: opportunityId ?? null });
    await audit({ onboardingId: o.id, actor: `team:${by}`, action: "crm.synced", target: `gohighlevel:${contactId}` });
    return { ok: true as const, crm };
  }

  // Webhook mode: the event payload carries everything a CRM workflow needs.
  await emit(o, "CLIENT_CREATED_IN_CRM", {
    provider: "webhook",
    last_name: o.contact.lastName ?? "",
    phone: o.contact.phone || str(company.contact_phone),
    company_legal_name: str(company.legal_name) || o.companyName,
    website,
    services: services.join(", "),
    tags: tags.join(","),
    progress: p.overall,
    kickoff_at: ctx.booking?.startsAt ?? null,
    account_manager: o.accountManager.name,
    summary: lines.join("\n"),
  });
  const crm: NonNullable<Onboarding["crm"]> = { provider: "webhook", syncedAt: now, syncedBy: by };
  await db().put<Onboarding>("onboardings", { ...o, crm, updatedAt: now });
  await audit({ onboardingId: o.id, actor: `team:${by}`, action: "crm.sent", target: "webhook" });
  return { ok: true as const, crm };
}
