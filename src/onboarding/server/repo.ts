import "server-only";
import type {
  AccessConnection,
  AccessStatus,
  AnswerValue,
  ClientAsset,
  Client,
  CloudFolder,
  Competitor,
  CustomQuestion,
  DelegatedTask,
  Engagement,
  InternalNote,
  KickoffBooking,
  Objection,
  OfferBonus,
  OfferGuarantee,
  OfferWorkshop,
  Onboarding,
  OnboardingAnswer,
  OnboardingEvent,
  SecretRecord,
  ServiceKey,
  SocialProfile,
  TemplateOverride,
} from "../types";
import { computeProgress, missingItems, type ProgressInput } from "../progress";
import { ACCESS_BY_KEY } from "../template/access";
import { ASSET_CATEGORY_BY_KEY, ASSET_SECTIONS, CLIENT_FOLDERS, linkProvider } from "../template/assets";
import { ALL_SECTIONS } from "../template/questions";
import { resolveTemplate } from "../template/resolve";
import { SERVICE_KEYS, estimateMinutes } from "../template/services";
import { encrypt, hashToken, newId, newToken, openToken, sealToken } from "./crypto";
import { db } from "./db";
import { createDriveWorkspace, driveConfigured } from "./drive";
import { audit, emit } from "./events";
import { getSettings } from "./settings";
import { keyPrefix } from "./storage";

const now = () => new Date().toISOString();
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "client";

export function portalUrl(token: string) {
  const base = (process.env.ONBOARDING_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://madvertlabs.com").replace(/\/$/, "");
  return `${base}/onboarding/${token}`;
}
export function currentLink(o: Onboarding) {
  const t = openToken(o.tokenSealed);
  return t ? portalUrl(t) : null;
}
export function delegateUrl(token: string) {
  const base = (process.env.ONBOARDING_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://madvertlabs.com").replace(/\/$/, "");
  return `${base}/onboarding/task/${token}`;
}

/* ───────── Create ───────── */

export interface CreateInput {
  companyName: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  services: ServiceKey[];
  ecommerce: boolean;
  localBusiness: boolean;
  accountManager?: string;
  accountManagerEmail?: string;
  strategist?: string;
  assignedOwner?: string;
}

export async function createOnboarding(input: CreateInput, createdBy: string) {
  const settings = await getSettings();
  const t = now();
  const services = input.services.filter((s) => SERVICE_KEYS.includes(s));
  const client: Client = { id: newId("cli_"), name: input.companyName.trim(), slug: slugify(input.companyName), createdAt: t, updatedAt: t };
  const engagement: Engagement = {
    id: newId("eng_"),
    clientId: client.id,
    services,
    ecommerce: input.ecommerce,
    localBusiness: input.localBusiness,
    createdAt: t,
    updatedAt: t,
  };
  const token = newToken();
  const onboarding: Onboarding = {
    id: newId("onb_"),
    clientId: client.id,
    engagementId: engagement.id,
    tokenHash: hashToken(token),
    tokenHint: token.slice(-4),
    tokenSealed: sealToken(token),
    status: "active",
    expiresAt: new Date(Date.now() + settings.defaults.linkLifetimeDays * 86400_000).toISOString(),
    contact: { firstName: input.firstName.trim(), lastName: input.lastName?.trim(), email: input.email.trim().toLowerCase(), phone: input.phone?.trim() },
    companyName: client.name,
    accountManager: { name: input.accountManager || settings.defaults.accountManager, email: input.accountManagerEmail || settings.defaults.accountManagerEmail, title: "Account Manager" },
    strategist: input.strategist || settings.defaults.strategist,
    assignedOwner: input.assignedOwner || createdBy,
    estimatedMinutes: estimateMinutes(services),
    reminders: [],
    createdBy,
    createdAt: t,
    updatedAt: t,
  };
  await db().put("clients", client);
  await db().put("engagements", engagement);
  await db().put("onboardings", onboarding);
  // Pre-fill what we already know so the client does not type it twice.
  await db().put<OnboardingAnswer>("answers", {
    id: `${onboarding.id}:business.company`,
    onboardingId: onboarding.id,
    sectionKey: "business.company",
    values: {
      legal_name: client.name,
      contact_name: [onboarding.contact.firstName, onboarding.contact.lastName].filter(Boolean).join(" "),
      contact_email: onboarding.contact.email,
      contact_phone: onboarding.contact.phone ?? "",
    },
    updatedAt: t,
    updatedBy: "team",
  });
  await audit({ onboardingId: onboarding.id, actor: `team:${createdBy}`, action: "onboarding.created" });
  return { onboarding, token, url: portalUrl(token) };
}

/** Client workspace. Internal structure always; Google Drive too when configured. Idempotent. */
export async function ensureWorkspace(o: Onboarding) {
  const existing = await db().find<CloudFolder>("cloud_folders", { onboardingId: o.id });
  if (existing.length) return existing;
  const t = now();
  const root = o.companyName;
  const internal: CloudFolder[] = CLIENT_FOLDERS.map((f) => ({
    id: `${o.id}:internal:${f}`,
    onboardingId: o.id,
    provider: "internal",
    name: f,
    path: `${root}/${f}`,
    createdAt: t,
  }));
  for (const f of internal) await db().put("cloud_folders", f);
  if (driveConfigured()) {
    try {
      const ws = await createDriveWorkspace(root, CLIENT_FOLDERS);
      await db().put<CloudFolder>("cloud_folders", {
        id: `${o.id}:drive:root`,
        onboardingId: o.id,
        provider: "google_drive",
        name: root,
        path: root,
        externalId: ws.root.id,
        externalUrl: ws.root.url,
        createdAt: t,
      });
      for (const c of ws.children)
        await db().put<CloudFolder>("cloud_folders", {
          id: `${o.id}:drive:${c.name}`,
          onboardingId: o.id,
          provider: "google_drive",
          name: c.name,
          path: `${root}/${c.name}`,
          externalId: c.id,
          externalUrl: c.url,
          createdAt: t,
        });
    } catch (e) {
      console.error("[onboarding] Drive workspace failed", e);
    }
  }
  return db().find<CloudFolder>("cloud_folders", { onboardingId: o.id });
}

export async function regenerateLink(o: Onboarding, actor: string, days?: number) {
  const settings = await getSettings();
  const token = newToken();
  const next: Onboarding = {
    ...o,
    tokenHash: hashToken(token),
    tokenHint: token.slice(-4),
    tokenSealed: sealToken(token),
    status: o.status === "completed" ? "completed" : "active",
    expiresAt: new Date(Date.now() + (days ?? settings.defaults.linkLifetimeDays) * 86400_000).toISOString(),
    updatedAt: now(),
  };
  await db().put("onboardings", next);
  await audit({ onboardingId: o.id, actor, action: "link.regenerated" });
  return { onboarding: next, token, url: portalUrl(token) };
}

export async function revokeLink(o: Onboarding, actor: string) {
  await db().put<Onboarding>("onboardings", { ...o, status: "revoked", updatedAt: now() });
  for (const d of await db().find<DelegatedTask>("delegated_tasks", { onboardingId: o.id })) {
    if (d.status !== "completed") await db().put("delegated_tasks", { ...d, status: "revoked" });
  }
  await audit({ onboardingId: o.id, actor, action: "link.revoked" });
}

/* ───────── Context ───────── */

export async function loadContext(onboardingId: string) {
  const o = await db().get<Onboarding>("onboardings", onboardingId);
  if (!o) return null;
  const by = { onboardingId };
  const [client, engagement, answers, access, assets, folders, social, proof, workshop, bonuses, guarantees, objections, competitors, delegated, booking, overrides, custom, secrets] =
    await Promise.all([
      db().get<Client>("clients", o.clientId),
      db().get<Engagement>("engagements", o.engagementId),
      db().find<OnboardingAnswer>("answers", by),
      db().find<AccessConnection>("access_connections", by),
      db().find<ClientAsset>("assets", by),
      db().find<CloudFolder>("cloud_folders", by),
      db().find<SocialProfile>("social_profiles", by),
      db().find<{ id: string }>("proof_assets", by),
      db().get<OfferWorkshop>("offer_workshops", onboardingId),
      db().find<OfferBonus>("offer_bonuses", by),
      db().find<OfferGuarantee>("offer_guarantees", by),
      db().find<Objection>("objections", by),
      db().find<Competitor>("competitors", by),
      db().find<DelegatedTask>("delegated_tasks", by),
      db().get<KickoffBooking>("kickoff_bookings", onboardingId),
      db().find<TemplateOverride>("template_overrides"),
      db().find<CustomQuestion>("custom_questions"),
      db().find<SecretRecord>("secrets", by),
    ]);
  if (!engagement || !client) return null;
  const template = resolveTemplate(engagement, overrides, custom);
  const ord = <T extends { order: number }>(a: T[]) => a.sort((x, y) => x.order - y.order);
  return {
    onboarding: o,
    client,
    engagement,
    template,
    answers: Object.fromEntries(answers.map((a) => [a.sectionKey, a.values])) as Record<string, Record<string, AnswerValue>>,
    access: Object.fromEntries(access.map((a) => [a.platform, a])) as Record<string, AccessConnection>,
    assets: assets.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    folders,
    social,
    proof,
    workshop,
    bonuses: ord(bonuses),
    guarantees: ord(guarantees),
    objections: ord(objections),
    competitors: ord(competitors),
    delegated: delegated.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    booking,
    secrets,
  };
}
export type OnboardingContext = NonNullable<Awaited<ReturnType<typeof loadContext>>>;

export function progressInput(ctx: OnboardingContext): ProgressInput {
  const assetCounts: Record<string, number> = {};
  for (const a of ctx.assets) {
    const section = ASSET_CATEGORY_BY_KEY[a.category]?.section ?? "other";
    assetCounts[section] = (assetCounts[section] ?? 0) + 1;
  }
  const offerAnswered = Object.entries(ctx.workshop?.values ?? {}).filter(([, v]) => (Array.isArray(v) ? v.length : v !== "" && v != null)).length;
  return {
    template: ctx.template,
    answers: ctx.answers,
    access: Object.fromEntries(Object.entries(ctx.access).map(([k, v]) => [k, { status: v.status, details: v.details }])),
    assetCounts,
    socialProfiles: ctx.social.length,
    offerStatus: ctx.workshop?.status ?? (ctx.onboarding.offerMode === "kickoff" ? "skipped" : "not_started"),
    offerAnswered: offerAnswered + ctx.bonuses.length + ctx.guarantees.length + ctx.objections.length + ctx.competitors.length,
    kickoffBooked: ctx.booking?.status === "booked",
  };
}

/** After every client change: activity timestamp, cached progress, milestone events. */
export async function afterChange(onboardingId: string, opts: { client?: boolean } = { client: true }) {
  const ctx = await loadContext(onboardingId);
  if (!ctx) return null;
  const input = progressInput(ctx);
  const p = computeProgress(input);
  const o = ctx.onboarding;
  const next: Onboarding = {
    ...o,
    lastClientActivityAt: opts.client ? now() : o.lastClientActivityAt,
    startedAt: o.startedAt ?? (opts.client ? now() : undefined),
    progressCache: { overall: p.overall, phases: Object.fromEntries(p.phases.map((x) => [x.key, x.percent])) },
    updatedAt: now(),
  };
  if (!o.startedAt && opts.client) await emit(o, "ONBOARDING_STARTED");
  if (p.byKey.business.percent === 100) await emit(o, "BUSINESS_INFO_COMPLETED");
  if (p.byKey.access.status !== "incomplete") await emit(o, "ACCESS_STARTED");
  if (ctx.assets.length > 0) await emit(o, "ASSETS_UPLOADED", { files: ctx.assets.filter((a) => a.kind === "file").length, links: ctx.assets.filter((a) => a.kind === "link").length });
  const required = missingItems(input).filter((m) => m.required);
  if (required.length === 0 && !o.completedAt) {
    next.completedAt = now();
    next.status = "completed";
    await emit(o, "ONBOARDING_COMPLETE", { progress: p.overall });
  }
  await db().put("onboardings", next);
  return { ctx: { ...ctx, onboarding: next }, progress: p };
}

/* ───────── Validation helpers ───────── */

function cleanValue(v: unknown): AnswerValue {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v.slice(0, 5000);
  if (typeof v === "boolean") return v;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string").slice(0, 40).map((x) => (x as string).slice(0, 300));
  return null;
}

const ASSET_ANSWER_KEYS = ["none", "has_guidelines", "has_reviews", "permission", "google_reviews", "facebook_reviews", "trustpilot", "note"];

export function allowedKeys(sectionKey: string, ctx: OnboardingContext): string[] | null {
  if (sectionKey.startsWith("assets.")) return ASSET_SECTIONS.some((s) => `assets.${s.key}` === sectionKey) ? ASSET_ANSWER_KEYS : null;
  if (sectionKey.startsWith("delegated.")) return ctx.delegated.some((d) => `delegated.${d.id}` === sectionKey) ? ["answer"] : null;
  const s = [...ctx.template.business, ...ctx.template.offer].find((x) => x.key === sectionKey) ?? ALL_SECTIONS.find((x) => x.key === sectionKey);
  return s ? s.questions.map((q) => q.key) : null;
}

/* ───────── Mutations ───────── */

export async function saveAnswers(ctx: OnboardingContext, sectionKey: string, values: Record<string, unknown>, by: OnboardingAnswer["updatedBy"]) {
  const allowed = allowedKeys(sectionKey, ctx);
  if (!allowed) throw new Error("Unknown section");
  const clean: Record<string, AnswerValue> = {};
  for (const [k, v] of Object.entries(values)) if (allowed.includes(k)) clean[k] = cleanValue(v);
  if (sectionKey.startsWith("offer.")) {
    const w: OfferWorkshop = ctx.workshop ?? { id: ctx.onboarding.id, onboardingId: ctx.onboarding.id, status: "in_progress", values: {}, updatedAt: now() };
    w.values = { ...w.values, ...clean };
    if (w.status === "not_started" || w.status === "skipped") w.status = "in_progress";
    w.updatedAt = now();
    await db().put("offer_workshops", w);
    return w.values;
  }
  const id = `${ctx.onboarding.id}:${sectionKey}`;
  const merged = { ...(ctx.answers[sectionKey] ?? {}), ...clean };
  await db().put<OnboardingAnswer>("answers", { id, onboardingId: ctx.onboarding.id, sectionKey, values: merged, updatedAt: now(), updatedBy: by });
  return merged;
}

const CLIENT_ACCESS_STATUSES: AccessStatus[] = ["not_started", "pending", "need_help", "kickoff", "not_required"];

export async function updateAccess(
  ctx: OnboardingContext,
  platform: string,
  patch: { status?: AccessStatus; details?: Record<string, unknown>; clientNote?: string },
  by: "client" | "delegate" | "team",
  actor: string,
) {
  if (!ACCESS_BY_KEY[platform]) throw new Error("Unknown platform");
  if (patch.status && by !== "team" && !CLIENT_ACCESS_STATUSES.includes(patch.status)) throw new Error("Only Madvert can verify a connection.");
  const prev = ctx.access[platform];
  const details: Record<string, AnswerValue> = { ...(prev?.details ?? {}) };
  for (const [k, v] of Object.entries(patch.details ?? {})) if (/^[a-z_]{1,40}$/.test(k)) details[k] = cleanValue(v);
  const next: AccessConnection = {
    id: `${ctx.onboarding.id}:${platform}`,
    onboardingId: ctx.onboarding.id,
    platform,
    status: patch.status ?? prev?.status ?? "not_started",
    details,
    clientNote: patch.clientNote !== undefined ? patch.clientNote.slice(0, 2000) : prev?.clientNote,
    verifiedBy: prev?.verifiedBy,
    verifiedAt: prev?.verifiedAt,
    updatedAt: now(),
  };
  if (by === "team" && patch.status === "connected") {
    next.verifiedBy = actor;
    next.verifiedAt = now();
    const ev = ACCESS_BY_KEY[platform].connectedEvent;
    if (ev && prev?.status !== "connected") await emit(ctx.onboarding, ev, { platform });
  }
  await db().put("access_connections", next);
  if (patch.status && patch.status !== prev?.status) await audit({ onboardingId: ctx.onboarding.id, actor, action: `access.${patch.status}`, target: platform });
  return next;
}

export async function replaceSocial(ctx: OnboardingContext, profiles: { platform: string; url: string; username?: string; accessStatus?: string }[]) {
  for (const p of ctx.social) await db().remove("social_profiles", p.id);
  const out: SocialProfile[] = [];
  for (const p of profiles.slice(0, 30)) {
    if (!p.url && !p.username) continue;
    const rec: SocialProfile = {
      id: newId("soc_"),
      onboardingId: ctx.onboarding.id,
      platform: String(p.platform).slice(0, 40),
      url: String(p.url ?? "").slice(0, 500),
      username: p.username ? String(p.username).slice(0, 120) : undefined,
      accessStatus: (["shared", "need_help", "not_required"].includes(String(p.accessStatus)) ? p.accessStatus : "shared") as SocialProfile["accessStatus"],
      createdAt: now(),
    };
    await db().put("social_profiles", rec);
    out.push(rec);
  }
  return out;
}

export async function addAsset(
  ctx: OnboardingContext,
  a: { category: string; kind: "file" | "link"; name: string; storageKey?: string; storageDriver?: "local" | "vercel-blob"; mimeType?: string; size?: number; url?: string; note?: string },
  by: ClientAsset["uploadedBy"],
) {
  const cat = ASSET_CATEGORY_BY_KEY[a.category];
  if (!cat) throw new Error("Unknown category");
  if (a.kind === "file" && !a.storageKey?.startsWith(keyPrefix(ctx.onboarding.id))) throw new Error("Invalid storage key");
  if (a.kind === "link") {
    let u: URL;
    try {
      u = new URL(String(a.url));
    } catch {
      throw new Error("Please paste a full link starting with https://");
    }
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("Only web links are allowed.");
  }
  const rec: ClientAsset = {
    id: newId("ast_"),
    onboardingId: ctx.onboarding.id,
    category: a.category,
    kind: a.kind,
    name: a.name.slice(0, 200),
    storageKey: a.storageKey,
    storageDriver: a.storageDriver,
    mimeType: a.mimeType?.slice(0, 120),
    size: a.size,
    url: a.kind === "link" ? String(a.url).slice(0, 1000) : undefined,
    linkProvider: a.kind === "link" ? linkProvider(String(a.url)) : undefined,
    note: a.note?.slice(0, 1000),
    folder: cat.folder,
    uploadedBy: by,
    createdAt: now(),
    updatedAt: now(),
  };
  await db().put("assets", rec);
  return rec;
}

export async function saveOfferLists(
  ctx: OnboardingContext,
  lists: {
    bonuses?: Partial<OfferBonus>[];
    guarantees?: Partial<OfferGuarantee>[];
    objections?: Partial<Objection>[];
    competitors?: Partial<Competitor>[];
  },
  team = false,
) {
  const s = (v: unknown, n = 2000) => (typeof v === "string" ? v.slice(0, n) : undefined);
  const id = ctx.onboarding.id;
  const replace = async <T extends { id: string }>(col: "offer_bonuses" | "offer_guarantees" | "objections" | "competitors", prev: T[], items: T[]) => {
    for (const p of prev) await db().remove(col, p.id);
    for (const i of items) await db().put(col, i);
  };
  if (lists.bonuses)
    await replace(
      "offer_bonuses",
      ctx.bonuses,
      lists.bonuses.slice(0, 20).filter((b) => s(b.name)).map((b, i) => ({
        id: newId("bon_"),
        onboardingId: id,
        name: s(b.name, 200)!,
        description: s(b.description),
        perceivedValue: s(b.perceivedValue, 100),
        actualCost: s(b.actualCost, 100),
        conditions: s(b.conditions),
        order: i,
      })),
    );
  if (lists.guarantees)
    await replace(
      "offer_guarantees",
      ctx.guarantees,
      lists.guarantees.slice(0, 10).filter((g) => s(g.type) || s(g.terms)).map((g, i) => ({
        id: newId("gua_"),
        onboardingId: id,
        type: s(g.type, 100) ?? "Custom",
        terms: s(g.terms) ?? "",
        clientApproved: g.clientApproved === true,
        order: i,
      })),
    );
  if (lists.objections) {
    const prevNotes = new Map(ctx.objections.map((o) => [o.objection, o.strategyNotes]));
    await replace(
      "objections",
      ctx.objections,
      lists.objections.slice(0, 12).filter((o) => s(o.objection)).map((o, i) => ({
        id: newId("obj_"),
        onboardingId: id,
        category: s(o.category, 60),
        objection: s(o.objection, 500)!,
        currentResponse: s(o.currentResponse),
        evidence: s(o.evidence),
        // Strategy notes are written by the team only; client edits keep them.
        strategyNotes: team ? s(o.strategyNotes) : prevNotes.get(s(o.objection, 500)!),
        order: i,
      })),
    );
  }
  if (lists.competitors)
    await replace(
      "competitors",
      ctx.competitors,
      lists.competitors.slice(0, 10).filter((c) => s(c.name)).map((c, i) => ({
        id: newId("cmp_"),
        onboardingId: id,
        name: s(c.name, 200)!,
        website: s(c.website, 300),
        strengths: s(c.strengths),
        weaknesses: s(c.weaknesses),
        difference: s(c.difference),
        order: i,
      })),
    );
  const w: OfferWorkshop = ctx.workshop ?? { id, onboardingId: id, status: "in_progress", values: {}, updatedAt: now() };
  if (w.status === "not_started" || w.status === "skipped") w.status = "in_progress";
  w.updatedAt = now();
  await db().put("offer_workshops", w);
}

export async function setOfferStatus(ctx: OnboardingContext, status: "in_progress" | "completed" | "skipped") {
  const id = ctx.onboarding.id;
  const w: OfferWorkshop = ctx.workshop ?? { id, onboardingId: id, status, values: {}, updatedAt: now() };
  w.status = status;
  w.updatedAt = now();
  await db().put("offer_workshops", w);
  await db().put<Onboarding>("onboardings", { ...ctx.onboarding, offerMode: status === "skipped" ? "kickoff" : "now", updatedAt: now() });
  if (status === "completed") await emit(ctx.onboarding, "OFFER_COMPLETED");
  if (status === "skipped") await emit(ctx.onboarding, "OFFER_SKIPPED");
}

export async function recordBooking(
  ctx: OnboardingContext,
  b: { startsAt?: string; timezone?: string; meetingUrl?: string; source: KickoffBooking["source"] },
) {
  const prev = ctx.booking;
  const valid = (d?: string) => (d && !Number.isNaN(Date.parse(d)) ? new Date(d).toISOString() : undefined);
  const rec: KickoffBooking = {
    id: ctx.onboarding.id,
    onboardingId: ctx.onboarding.id,
    status: "booked",
    startsAt: valid(b.startsAt) ?? prev?.startsAt,
    timezone: b.timezone?.slice(0, 80) || prev?.timezone,
    meetingUrl: b.meetingUrl && /^https:\/\//.test(b.meetingUrl) ? b.meetingUrl.slice(0, 500) : prev?.meetingUrl,
    strategist: prev?.strategist ?? ctx.onboarding.strategist,
    source: b.source,
    createdAt: prev?.createdAt ?? now(),
    updatedAt: now(),
  };
  await db().put("kickoff_bookings", rec);
  if (prev?.status !== "booked") await emit(ctx.onboarding, "KICKOFF_BOOKED", { starts_at: rec.startsAt ?? null, timezone: rec.timezone ?? null, source: b.source });
  return rec;
}

export async function storeSecret(ctx: OnboardingContext, s: { platform: string; label: string; username?: string; secret: string }, by: SecretRecord["createdBy"], actor: string) {
  if (!ACCESS_BY_KEY[s.platform]) throw new Error("Unknown platform");
  if (!s.secret || s.secret.length > 4000) throw new Error("Invalid credential");
  const rec: SecretRecord = {
    id: newId("sec_"),
    onboardingId: ctx.onboarding.id,
    platform: s.platform,
    label: s.label.slice(0, 120) || "Credential",
    username: s.username?.slice(0, 200),
    cipher: encrypt(s.secret),
    createdAt: now(),
    createdBy: by,
    revealedCount: 0,
  };
  await db().put("secrets", rec);
  await audit({ onboardingId: ctx.onboarding.id, actor, action: "secret.stored", target: `${s.platform}:${rec.id}` });
  return { id: rec.id, platform: rec.platform, label: rec.label, username: rec.username, createdAt: rec.createdAt };
}

export async function addNote(onboardingId: string, sectionKey: string, body: string, author: string, tag?: string) {
  const n: InternalNote = { id: newId("not_"), onboardingId, sectionKey: sectionKey.slice(0, 60), body: body.slice(0, 4000), tag: tag?.slice(0, 40), author, createdAt: now() };
  await db().put("internal_notes", n);
  return n;
}

export async function listEvents(onboardingId: string) {
  return (await db().find<OnboardingEvent>("events", { onboardingId })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
