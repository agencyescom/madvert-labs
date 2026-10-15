import "server-only";
import { redirect } from "next/navigation";
import type { AuditLog, InternalNote, Onboarding } from "../types";
import { accessStatusOf, computeProgress, missingItems } from "../progress";
import { ACCESS_BY_KEY, GOOGLE_KEYS } from "../template/access";
import { ASSET_CATEGORY_BY_KEY } from "../template/assets";
import { SERVICES } from "../template/services";
import type { TeamRole } from "../types";
import { opsSession, roleAtLeast } from "./auth";
import { crmMode } from "./crm";
import { vaultConfigured } from "./crypto";
import { db, dbDriver } from "./db";
import { driveConfigured } from "./drive";
import { offerSummary, riskFlags } from "./insights";
import { currentLink, listEvents, loadContext, progressInput } from "./repo";
import { getSettings, missingSettings } from "./settings";
import { signedFileUrl, storageDriver } from "./storage";

export async function requireOpsPage(min: TeamRole = "member") {
  const u = await opsSession();
  if (!u) redirect("/ops/login");
  if (!roleAtLeast(u.role, min)) redirect("/ops/onboarding");
  return u;
}

/** Everything in Operations that still needs credentials or configuration. Shown as "Configuration Required". */
export async function configStatus() {
  const s = await getSettings();
  return [
    { label: "Database", ok: dbDriver() === "postgres", note: dbDriver() === "file" ? "Local JSON file (development only). Set DATABASE_URL." : dbDriver() === "postgres" ? "Postgres" : "Set DATABASE_URL" },
    { label: "File storage", ok: storageDriver() === "vercel-blob", note: storageDriver() === "local" ? "Local disk (development only). Set BLOB_READ_WRITE_TOKEN." : storageDriver() === "vercel-blob" ? "Vercel Blob (private)" : "Set BLOB_READ_WRITE_TOKEN" },
    { label: "Credential vault", ok: vaultConfigured(), note: vaultConfigured() ? "AES-256-GCM" : "Set ONBOARDING_ENCRYPTION_KEY (32 bytes)" },
    { label: "Email (Resend)", ok: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM), note: "Links, delegated tasks, reminders" },
    { label: "Google Drive workspace", ok: driveConfigured(), note: driveConfigured() ? "Folders created automatically" : "Service account not configured. Internal folders only." },
    { label: "Automation webhooks", ok: Boolean(process.env.ONBOARDING_WEBHOOK_URL || process.env.GOHIGHLEVEL_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL), note: "ONBOARDING_WEBHOOK_URL / GOHIGHLEVEL_WEBHOOK_URL / N8N_WEBHOOK_URL" },
    { label: "Booking webhook", ok: Boolean(process.env.ONBOARDING_BOOKING_WEBHOOK_SECRET), note: "ONBOARDING_BOOKING_WEBHOOK_SECRET for exact kickoff times" },
    { label: "CRM (Create client in CRM)", ok: crmMode() !== "none", note: crmMode() === "gohighlevel" ? "GoHighLevel API" : crmMode() === "webhook" ? "Automation webhook" : "Set GHL_ACCESS_TOKEN + GHL_LOCATION_ID" },
    { label: "Reminder cron", ok: Boolean(process.env.CRON_SECRET), note: "CRON_SECRET" },
    { label: "Company integrations", ok: missingSettings(s).length === 0, note: missingSettings(s).length ? `Missing: ${missingSettings(s).join(", ")}` : "Complete" },
  ];
}

const label = (st: string) => st.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase());

export async function overview() {
  const all = (await db().find<Onboarding>("onboardings")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = [];
  for (const o of all) {
    const ctx = await loadContext(o.id);
    if (!ctx) continue;
    const input = progressInput(ctx);
    const p = computeProgress(input);
    const plan = ctx.template.access.map((a) => a.key);
    const google = plan.filter((k) => GOOGLE_KEYS.includes(k)).map((k) => accessStatusOf(input, k));
    rows.push({
      id: o.id,
      company: o.companyName,
      contact: `${o.contact.firstName} · ${o.contact.email}`,
      status: o.status,
      services: ctx.engagement.services.map((s) => SERVICES[s]?.label ?? s),
      overall: p.overall,
      business: p.byKey.business.status,
      meta: plan.includes("meta") ? accessStatusOf(input, "meta") : null,
      google: google.length ? (google.every((s) => s === "connected" || s === "not_required") ? "connected" : google.some((s) => s !== "not_started") ? "pending" : "not_started") : null,
      website: plan.includes("website") ? accessStatusOf(input, "website") : null,
      whatsapp: plan.includes("whatsapp") ? accessStatusOf(input, "whatsapp") : null,
      assets: p.byKey.assets.percent,
      offer: ctx.workshop?.status ?? (o.offerMode === "kickoff" ? "skipped" : "not_started"),
      kickoff: ctx.booking?.status === "booked" ? (ctx.booking.startsAt ?? "booked") : null,
      lastActivity: o.lastClientActivityAt ?? null,
      owner: o.assignedOwner ?? "",
      risks: riskFlags(ctx).filter((r) => r.level !== "low").length,
      crm: Boolean(o.crm),
    });
  }
  return rows;
}

export async function detail(id: string) {
  const ctx = await loadContext(id);
  if (!ctx) return null;
  const input = progressInput(ctx);
  const p = computeProgress(input);
  const missing = missingItems(input);
  const [notes, events, audits] = await Promise.all([
    db().find<InternalNote>("internal_notes", { onboardingId: id }),
    listEvents(id),
    db().find<AuditLog>("audit_logs", { onboardingId: id }),
  ]);
  const questions = [
    ...ctx.delegated.filter((d) => d.taskKey === "question").map((d) => ({ q: d.taskLabel, a: String(ctx.answers[`delegated.${d.id}`]?.answer ?? "Not answered yet"), by: d.name })),
    ...(ctx.answers["business.growth"]?.anything_else ? [{ q: "Anything Madvert should know before starting?", a: String(ctx.answers["business.growth"].anything_else), by: "Client" }] : []),
    ...Object.entries(ctx.access)
      .filter(([, a]) => a.clientNote)
      .map(([k, a]) => ({ q: `Note on ${ACCESS_BY_KEY[k]?.label ?? k}`, a: a.clientNote!, by: "Client" })),
  ];
  return {
    ctx,
    progress: p,
    missing,
    link: currentLink(ctx.onboarding),
    crm: { mode: crmMode(), synced: ctx.onboarding.crm ?? null, complete: Boolean(ctx.onboarding.completedAt) || missing.filter((m) => m.required).length === 0 },
    risks: riskFlags(ctx),
    offer: offerSummary(ctx),
    notes: notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    events,
    audits: audits.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 60),
    questions,
    access: ctx.template.access.map((a) => ({
      key: a.key,
      label: ACCESS_BY_KEY[a.key]?.label ?? a.key,
      required: a.required,
      status: accessStatusOf(input, a.key),
      statusLabel: label(accessStatusOf(input, a.key)),
      details: ctx.access[a.key]?.details ?? {},
      verifiedBy: ctx.access[a.key]?.verifiedBy,
    })),
    assets: ctx.assets.map((a) => ({
      id: a.id,
      name: a.name,
      kind: a.kind,
      category: ASSET_CATEGORY_BY_KEY[a.category]?.label ?? a.category,
      folder: a.folder,
      size: a.size ?? null,
      note: a.note ?? "",
      url: a.kind === "link" ? a.url : signedFileUrl(a.id, 3600),
      by: a.uploadedBy,
      createdAt: a.createdAt,
    })),
  };
}
export type OpsDetail = NonNullable<Awaited<ReturnType<typeof detail>>>;
