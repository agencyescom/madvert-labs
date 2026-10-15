import "server-only";
import { computeProgress, missingItems } from "../progress";
import * as assetSections from "../template/assets";
import { SERVICES, teamLine } from "../template/services";
import { vaultConfigured } from "./crypto";
import { getGuides, resolveGuides } from "./guides";
import { progressInput, type OnboardingContext } from "./repo";
import { getSettings, publicIntegrations } from "./settings";
import { keyPrefix, signedFileUrl, storageDriver } from "./storage";

/**
 * The state sent to the client portal. Internal notes, strategy notes, credential values,
 * token hashes and team-only fields are never included.
 */
export async function clientState(ctx: OnboardingContext) {
  const settings = await getSettings();
  const integrations = publicIntegrations(settings);
  const guides = resolveGuides(await getGuides(), integrations);
  const input = progressInput(ctx);
  const o = ctx.onboarding;
  return {
    onboarding: {
      id: o.id,
      companyName: o.companyName,
      firstName: o.contact.firstName,
      email: o.contact.email,
      accountManager: o.accountManager,
      // Real photo for the founder; other managers get a 3D tile.
      accountManagerPhoto: /usama/i.test(o.accountManager.name) ? "/images/usama-abbas-dahri-portrait.webp" : null,
      strategist: o.strategist ?? null,
      estimatedMinutes: o.estimatedMinutes,
      services: ctx.engagement.services.map((s) => SERVICES[s]?.label ?? s),
      serviceKeys: ctx.engagement.services,
      ecommerce: ctx.engagement.ecommerce,
      team: teamLine(ctx.engagement.services),
      startedAt: o.startedAt ?? null,
      offerMode: o.offerMode ?? null,
      expiresAt: o.expiresAt,
      status: o.status,
    },
    template: ctx.template,
    answers: ctx.answers,
    access: Object.fromEntries(
      Object.entries(ctx.access).map(([k, a]) => [k, { status: a.status, details: a.details, clientNote: a.clientNote ?? "", verified: Boolean(a.verifiedAt) }]),
    ),
    assets: ctx.assets.map((a) => ({
      id: a.id,
      category: a.category,
      kind: a.kind,
      name: a.name,
      mimeType: a.mimeType ?? null,
      size: a.size ?? null,
      url: a.kind === "link" ? (a.url ?? null) : null,
      linkProvider: a.linkProvider ?? null,
      note: a.note ?? "",
      folder: a.folder,
      previewUrl: a.kind === "file" ? signedFileUrl(a.id, 6 * 3600) : null,
      createdAt: a.createdAt,
    })),
    social: ctx.social.map((s) => ({ platform: s.platform, url: s.url, username: s.username ?? "", accessStatus: s.accessStatus })),
    offer: {
      status: ctx.workshop?.status ?? (o.offerMode === "kickoff" ? "skipped" : "not_started"),
      values: ctx.workshop?.values ?? {},
      bonuses: ctx.bonuses.map(({ name, description, perceivedValue, actualCost, conditions }) => ({ name, description, perceivedValue, actualCost, conditions })),
      guarantees: ctx.guarantees.map(({ type, terms, clientApproved }) => ({ type, terms, clientApproved })),
      objections: ctx.objections.map(({ category, objection, currentResponse, evidence }) => ({ category, objection, currentResponse, evidence })),
      competitors: ctx.competitors.map(({ name, website, strengths, weaknesses, difference }) => ({ name, website, strengths, weaknesses, difference })),
    },
    delegated: ctx.delegated
      .filter((d) => d.status !== "revoked")
      .map((d) => ({ id: d.id, taskKey: d.taskKey, taskLabel: d.taskLabel, name: d.name, email: d.email, role: d.role ?? "", status: d.status, createdAt: d.createdAt })),
    booking: ctx.booking
      ? { status: ctx.booking.status, startsAt: ctx.booking.startsAt ?? null, timezone: ctx.booking.timezone ?? null, meetingUrl: ctx.booking.meetingUrl ?? null, strategist: ctx.booking.strategist ?? o.strategist ?? null }
      : null,
    secrets: ctx.secrets.map((s) => ({ id: s.id, platform: s.platform, label: s.label, createdAt: s.createdAt })),
    integrations,
    guides,
    progress: computeProgress(input),
    missing: missingItems(input),
    upload: { mode: storageDriver(), prefix: keyPrefix(o.id) },
    vaultEnabled: vaultConfigured(),
    emailEnabled: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
  };
}

export type ClientState = Awaited<ReturnType<typeof clientState>>;

/**
 * What a delegate (someone the client sent ONE task to) receives: only the data that task needs.
 * Everything else is removed server side, so it never reaches their browser.
 */
export function delegateState(full: ClientState, task: { id: string; taskKey: string }): ClientState {
  const [kind, key] = task.taskKey.split(":");
  const assetSection = kind === "asset" ? key : null;
  const platform = kind === "access" ? key : null;
  const { ASSET_SECTION_BY_KEY } = assetSections;
  const cats = assetSection ? new Set(ASSET_SECTION_BY_KEY[assetSection]?.categories.map((c) => c.key)) : new Set<string>();
  const keepAnswers = Object.fromEntries(
    Object.entries(full.answers).filter(([k]) => (assetSection && k === `assets.${assetSection}`) || k === `delegated.${task.id}`),
  );
  return {
    ...full,
    onboarding: { ...full.onboarding, email: "", services: [], serviceKeys: [], team: "", startedAt: null, offerMode: null },
    template: { ...full.template, business: [], offer: [], access: full.template.access.filter((a) => a.key === platform), assets: full.template.assets.filter((a) => a.key === assetSection) },
    answers: keepAnswers,
    access: platform && full.access[platform] ? { [platform]: full.access[platform] } : {},
    assets: full.assets.filter((a) => cats.has(a.category)),
    social: platform === "social" ? full.social : [],
    offer: { status: "not_started", values: {}, bonuses: [], guarantees: [], objections: [], competitors: [] },
    delegated: [],
    booking: null,
    secrets: full.secrets.filter((s) => s.platform === platform),
    progress: full.progress,
    missing: [],
  };
}
