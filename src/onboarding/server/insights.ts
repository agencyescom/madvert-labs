import "server-only";
import type { AnswerValue } from "../types";
import { accessStatusOf, missingItems } from "../progress";
import { progressInput, type OnboardingContext } from "./repo";

const str = (v: AnswerValue | undefined) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v)).trim();

export interface RiskFlag {
  level: "high" | "medium" | "low";
  label: string;
}

/** Rule based flags for the team. These are prompts for review, not conclusions. */
export function riskFlags(ctx: OnboardingContext): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const input = progressInput(ctx);
  const b = { ...ctx.answers["business.company"], ...ctx.answers["business.model"], ...ctx.answers["business.customers"], ...ctx.answers["business.growth"] };
  const crm = str(ctx.access.crm?.details?.crm);
  if (ctx.template.access.some((a) => a.key === "crm") && (crm === "None" || crm === "Spreadsheet")) flags.push({ level: "medium", label: `No CRM in place (${crm}). Lead follow-up needs a system.` });
  if (ctx.access.whatsapp?.details?.has_number === "No") flags.push({ level: "low", label: "No dedicated WhatsApp Business number yet." });
  const help = ctx.template.access.filter((a) => ["need_help", "kickoff"].includes(accessStatusOf(input, a.key)));
  if (help.length) flags.push({ level: "medium", label: `Access needs help: ${help.map((h) => h.key).join(", ")}.` });
  if (ctx.booking?.startsAt) {
    const hours = (Date.parse(ctx.booking.startsAt) - Date.now()) / 3600_000;
    const missingAccess = missingItems(input).filter((m) => m.phase === "access" && m.required);
    if (hours > 0 && hours < 48 && missingAccess.length) flags.push({ level: "high", label: `Kickoff within 48 hours with ${missingAccess.length} access item(s) missing.` });
  }
  if (/^(just me|2–5)$/i.test(str(b.team_size)) && str(b.capacity)) flags.push({ level: "low", label: `Small team: confirm capacity (“${str(b.capacity)}”) before scaling demand.` });
  if (ctx.guarantees.some((g) => !g.clientApproved)) flags.push({ level: "medium", label: "Guarantees entered but not marked Client Approved Claim. Do not use publicly." });
  const proof = ctx.answers["assets.social_proof"];
  if (proof?.has_reviews === "No") flags.push({ level: "medium", label: "No reviews or testimonials available. Proof will need building." });
  if (proof?.permission === "No") flags.push({ level: "low", label: "Client has not allowed public use of proof assets." });
  if (ctx.workshop?.status === "skipped" || ctx.onboarding.offerMode === "kickoff") flags.push({ level: "low", label: "Offer workshop to be completed during kickoff." });
  if (!ctx.onboarding.lastClientActivityAt) flags.push({ level: "low", label: "Client has not opened onboarding yet." });
  else if (Date.now() - Date.parse(ctx.onboarding.lastClientActivityAt) > 5 * 86400_000 && !ctx.onboarding.completedAt)
    flags.push({ level: "medium", label: "No client activity for 5+ days." });
  return flags;
}

export interface SummaryItem {
  label: string;
  value: string;
  source: "CLIENT-PROVIDED FACT" | "MADVERT STRATEGY IDEA";
}

/**
 * Internal offer summary draft. Client answers are reproduced as CLIENT-PROVIDED FACT.
 * Anything Madvert suggests is labelled MADVERT STRATEGY IDEA and is never presented as fact.
 */
export function offerSummary(ctx: OnboardingContext) {
  const v = ctx.workshop?.values ?? {};
  const biz = { ...ctx.answers["business.customers"], ...ctx.answers["business.model"] };
  const fact = (label: string, value: string): SummaryItem[] => (value ? [{ label, value, source: "CLIENT-PROVIDED FACT" }] : []);
  const idea = (label: string, value: string): SummaryItem => ({ label, value, source: "MADVERT STRATEGY IDEA" });
  const speed = ["response", "quote", "consult", "sample", "delivery", "install", "results", "support"]
    .map((k) => (str(v[`speed_${k}`]) ? `${k}: ${str(v[`speed_${k}`])}` : ""))
    .filter(Boolean)
    .join(" · ");

  const sections: { title: string; items: SummaryItem[] }[] = [
    { title: "Ideal customer", items: [...fact("Best customer", str(v.best_customer)), ...fact("Ideal customer (business info)", str(biz.ideal_customer))] },
    { title: "Core problem", items: fact("Problem", str(v.problem) || str(biz.customer_problems)) },
    { title: "Desired outcome", items: [...fact("Outcome", str(v.outcome)), ...fact("Ideal end result", str(v.end_result)), ...fact("Before → after", [str(v.before), str(v.after)].filter(Boolean).join(" → "))] },
    { title: "Core offer", items: [...fact("Offer", str(v.primary_offer) || str(v.selling)), ...fact("Price", [str(v.price), str(v.pricing_type)].filter(Boolean).join(" · ")), ...fact("Packaging", str(v.packaging))] },
    {
      title: "Differentiators",
      items: [...fact("Why choose us", str(v.why_you)), ...fact("Unique", str(v.unique)), ...fact("Method", str(v.method)), ...fact("Hard to copy", str(v.moat)), ...fact("Customers praise", str(v.praise))],
    },
    { title: "Bonuses", items: ctx.bonuses.map((b) => ({ label: b.name, value: [b.description, b.perceivedValue && `value ${b.perceivedValue}`, b.actualCost && `cost ${b.actualCost}`, b.conditions].filter(Boolean).join(" · "), source: "CLIENT-PROVIDED FACT" as const })) },
    {
      title: "Guarantees",
      items: ctx.guarantees.map((g) => ({ label: `${g.type}${g.clientApproved ? " · Client Approved Claim" : " · NOT APPROVED FOR PUBLIC USE"}`, value: g.terms, source: "CLIENT-PROVIDED FACT" as const })),
    },
    {
      title: "Proof",
      items: [
        ...fact("Years in business", str(v.years)),
        ...fact("Customers served", str(v.customers_served)),
        ...fact("Projects", str(v.projects)),
        ...fact("Rating", [str(v.rating), str(v.review_volume)].filter(Boolean).join(" · ")),
        ...fact("Credentials", str(v.credentials)),
        ...fact("Awards", str(v.awards)),
        ...fact("Results", str(v.results)),
      ],
    },
    { title: "Speed", items: [...fact("Turnaround", speed), ...fact("Can be made", str(v.speed_possible))] },
    { title: "Objections", items: ctx.objections.map((o) => ({ label: o.objection, value: [o.currentResponse && `Response: ${o.currentResponse}`, o.evidence && `Evidence: ${o.evidence}`].filter(Boolean).join(" · "), source: "CLIENT-PROVIDED FACT" as const })) },
  ];

  const ideas: SummaryItem[] = [];
  if (!ctx.guarantees.length && (str(v.fears) || str(v.blockers))) ideas.push(idea("Risk reversal", "Customers have stated fears but no guarantee is offered. Explore a response-time or inspection guarantee the business can keep."));
  if (!ctx.bonuses.length) ideas.push(idea("Bonuses", "No bonuses yet. Consider a low-cost, high-value bonus such as a free audit, mockup or priority support."));
  if (str(v.speed_possible).match(/Same day|24 hours|Instant/)) ideas.push(idea("Speed angle", `Speed is a candidate headline: “${str(v.speed_possible)}” turnaround.`));
  if (str(v.moat)) ideas.push(idea("Positioning", `Lead with what competitors cannot copy: ${str(v.moat).slice(0, 160)}.`));
  if (ctx.competitors.length) ideas.push(idea("Competitive gap", `Compare against ${ctx.competitors.map((c) => c.name).join(", ")} on the differences the client listed.`));
  if (ctx.workshop?.strategyNotes) ideas.push(idea("Team notes", ctx.workshop.strategyNotes));
  sections.push({ title: "Positioning opportunities", items: ideas });
  return sections.filter((s) => s.items.length);
}
