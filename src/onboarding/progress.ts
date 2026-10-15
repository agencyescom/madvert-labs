import type { AccessStatus, AnswerValue, MissingItem, PhaseKey, PhaseProgress } from "./types";
import { ACCESS_BY_KEY } from "./template/access";
import { ASSET_SECTION_BY_KEY } from "./template/assets";
import { isAnswered, isVisible } from "./template/questions";
import type { ResolvedTemplate } from "./template/resolve";

/** Everything progress needs. Built on the server and mirrored on the client, so both always agree. */
export interface ProgressInput {
  template: ResolvedTemplate;
  answers: Record<string, Record<string, AnswerValue>>;
  access: Record<string, { status: AccessStatus; details: Record<string, AnswerValue> }>;
  assetCounts: Record<string, number>; // per asset section
  socialProfiles: number;
  offerStatus: "not_started" | "in_progress" | "completed" | "skipped";
  offerAnswered: number;
  kickoffBooked: boolean;
}

export const PHASES: { key: PhaseKey; n: string; label: string; title: string }[] = [
  { key: "business", n: "01", label: "Business", title: "Business Information" },
  { key: "access", n: "02", label: "Access", title: "Access & Connections" },
  { key: "assets", n: "03", label: "Assets", title: "Brand & Marketing Assets" },
  { key: "offer", n: "04", label: "Strategy", title: "Offer & Strategy" },
  { key: "kickoff", n: "05", label: "Kickoff", title: "Kickoff Call" },
];

const ACCESS_SCORE: Record<AccessStatus, number> = { not_started: 0, need_help: 0.5, kickoff: 0.5, pending: 1, connected: 1, not_required: 1 };

export function sectionProgress(template: ResolvedTemplate, sectionKey: string, values: Record<string, AnswerValue> = {}) {
  const s = [...template.business, ...template.offer].find((x) => x.key === sectionKey);
  if (!s) return { done: 0, total: 0 };
  const req = s.questions.filter((q) => q.required && isVisible(q, values));
  return { done: req.filter((q) => isAnswered(values[q.key])).length, total: req.length };
}

export function accessStatusOf(input: ProgressInput, key: string): AccessStatus {
  if (key === "social") {
    const s = input.access.social?.status;
    if (s && s !== "not_started") return s;
    return input.socialProfiles > 0 ? "pending" : "not_started";
  }
  return input.access[key]?.status ?? "not_started";
}

export function assetSectionDone(input: ProgressInput, key: string) {
  const a = input.answers[`assets.${key}`] ?? {};
  const count = input.assetCounts[key] ?? 0;
  if (a.none === true) return true;
  if (key === "brand_guidelines") return a.has_guidelines === "No" || (a.has_guidelines === "Yes" && count > 0);
  if (key === "social_proof") {
    if (a.has_reviews === "No") return true;
    const links = ["google_reviews", "facebook_reviews", "trustpilot"].some((k) => isAnswered(a[k]));
    return isAnswered(a.has_reviews) && (count > 0 || links) && isAnswered(a.permission);
  }
  return count > 0;
}

export function computeProgress(input: ProgressInput) {
  const { template } = input;

  // Business
  let bDone = 0;
  let bTotal = 0;
  for (const s of template.business) {
    const p = sectionProgress(template, s.key, input.answers[s.key]);
    bDone += p.done;
    bTotal += p.total;
  }
  const business = bTotal ? Math.round((bDone / bTotal) * 100) : 100;

  // Access: required items count; if nothing is required, the optional ones do.
  const accessItems = template.access.some((a) => a.required) ? template.access.filter((a) => a.required) : template.access;
  const accessScore = accessItems.reduce((sum, a) => sum + ACCESS_SCORE[accessStatusOf(input, a.key)], 0);
  const access = accessItems.length ? Math.round((accessScore / accessItems.length) * 100) : 100;
  const accessTouched = template.access.some((a) => accessStatusOf(input, a.key) !== "not_started");

  // Assets
  const assetItems = template.assets.some((a) => a.required) ? template.assets.filter((a) => a.required) : template.assets;
  const assetsDone = assetItems.filter((a) => assetSectionDone(input, a.key)).length;
  const assets = assetItems.length ? Math.round((assetsDone / assetItems.length) * 100) : 100;
  const assetsTouched = Object.values(input.assetCounts).some((n) => n > 0);

  // Offer (optional, never blocks)
  const offerTotal = template.offer.reduce((n, s) => n + s.questions.length, 0) || 1;
  const offer =
    input.offerStatus === "completed" ? 100 : input.offerStatus === "skipped" ? 0 : Math.min(95, Math.round((input.offerAnswered / offerTotal) * 100));

  const kickoff = input.kickoffBooked ? 100 : 0;
  const kickoffBlocked = !input.kickoffBooked && business < 100;

  const status = (p: number, touched = p > 0) => (p >= 100 ? "completed" : touched ? "in_progress" : "incomplete") as PhaseProgress["status"];

  const phases: PhaseProgress[] = [
    { key: "business", label: "Business Information", percent: business, status: status(business) },
    { key: "access", label: "Access & Connections", percent: access, status: status(access, accessTouched) },
    { key: "assets", label: "Brand & Marketing Assets", percent: assets, status: status(assets, assetsTouched) },
    {
      key: "offer",
      label: "Offer & Strategy",
      percent: offer,
      status: input.offerStatus === "completed" ? "completed" : input.offerStatus === "in_progress" ? "in_progress" : "optional",
      note: input.offerStatus === "skipped" ? "Completing with Madvert during kickoff" : "Optional before kickoff",
    },
    {
      key: "kickoff",
      label: "Kickoff Call",
      percent: kickoff,
      status: input.kickoffBooked ? "completed" : kickoffBlocked ? "blocked" : "incomplete",
      note: kickoffBlocked ? "Unlocks once Business Information is complete" : undefined,
    },
  ];

  const overall = Math.round(business * 0.3 + access * 0.35 + assets * 0.2 + kickoff * 0.15);
  return { overall, phases, byKey: Object.fromEntries(phases.map((p) => [p.key, p])) as Record<PhaseKey, PhaseProgress> };
}

export function missingItems(input: ProgressInput): MissingItem[] {
  const out: MissingItem[] = [];
  const p = computeProgress(input);
  if (p.byKey.business.percent < 100) out.push({ key: "business", label: "Business information", phase: "business", state: "Pending", required: true });

  for (const a of input.template.access) {
    const st = accessStatusOf(input, a.key);
    const label = ACCESS_BY_KEY[a.key]?.label ?? a.key;
    const details = input.access[a.key]?.details ?? {};
    if (a.key === "whatsapp" && details.plan === "create") {
      out.push({ key: `access:${a.key}`, label: "WhatsApp Business number", phase: "access", state: "Create before launch", required: a.required });
      continue;
    }
    if (st === "connected" || st === "not_required") continue;
    if (!a.required && st === "not_started") continue;
    const state: MissingItem["state"] =
      st === "pending" ? "Awaiting verification" : st === "need_help" ? "Needs help" : st === "kickoff" ? "During kickoff" : "Pending";
    out.push({ key: `access:${a.key}`, label: `${label} access`, phase: "access", state, required: a.required });
  }

  for (const a of input.template.assets) {
    if (!a.required || assetSectionDone(input, a.key)) continue;
    out.push({ key: `asset:${a.key}`, label: ASSET_SECTION_BY_KEY[a.key]?.title ?? a.key, phase: "assets", state: "Pending", required: true });
  }

  if (!input.kickoffBooked) out.push({ key: "kickoff", label: "Kickoff call", phase: "kickoff", state: "Not started", required: true });
  return out;
}

/** Items the client can still act on. Optional work and items waiting on Madvert never trigger reminders. */
export function clientActionable(items: MissingItem[]) {
  return items.filter((i) => i.required && i.state !== "Awaiting verification" && i.state !== "During kickoff");
}
