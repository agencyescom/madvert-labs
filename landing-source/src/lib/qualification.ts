import type { ApplicationAnswers } from "./application";

/**
 * Configurable application scoring.
 *
 * Each rule awards (or removes) points. The final score is normalised to
 * 0–100 against the maximum positive points available. Applications at or
 * above `threshold` are shown the booking calendar; everything else gets the
 * manual-review message. `hardStops` force manual review regardless of score.
 *
 * Adjust weights, thresholds or add rules here — the form and the API route
 * both use this module, so client and server always agree.
 */
export type Rule = {
  id: string;
  label: string;
  /** Points awarded when matched. Use a function for tiered values. */
  points: number | ((a: ApplicationAnswers) => number);
  test: (a: ApplicationAnswers) => boolean;
};

export type QualificationConfig = {
  threshold: number;
  positive: Rule[];
  negative: Rule[];
  hardStops: Omit<Rule, "points">[];
};

const tier = <T extends string>(value: T, map: Partial<Record<T, number>>) => map[value] ?? 0;

const envThreshold = Number(process.env.NEXT_PUBLIC_QUALIFY_THRESHOLD);

export const QUALIFICATION_CONFIG: QualificationConfig = {
  threshold: Number.isFinite(envThreshold) && envThreshold > 0 ? envThreshold : 60,

  positive: [
    { id: "us_market", label: "Serves U.S. market", points: 15, test: (a) => a.markets.includes("USA") },
    {
      id: "sales_capability",
      label: "Dedicated sales capability",
      points: (a) => tier(a.quoteHandler, { Owner: 4, Salesperson: 8, "Sales Team": 8, Other: 3 }),
      test: (a) => a.quoteHandler !== "",
    },
    {
      id: "response_time",
      label: "Fast response time",
      points: (a) =>
        tier(a.responseTime, { "Under 5 Minutes": 10, "Under 30 Minutes": 8, "Within 2 Hours": 5, "Same Day": 2 }),
      test: (a) => a.responseTime !== "" && a.responseTime !== "Next Day+",
    },
    { id: "can_invest", label: "Can invest $1,500+/month", points: 15, test: (a) => a.canInvest === "Yes" },
    {
      id: "recurring_volume",
      label: "Wants recurring volume",
      points: (a) => tier(a.desiredVolume, { "3–5 / Day": 4, "5–10 / Day": 6, "10–20 / Day": 8, "20+ / Day": 8 }),
      test: (a) => a.desiredVolume !== "",
    },
    { id: "website", label: "Existing website", points: 4, test: (a) => a.website.trim().length > 3 },
    {
      id: "real_operation",
      label: "Real business operation",
      points: 4,
      test: (a) => a.productionLocation !== "" && a.patchTypes.length > 0,
    },
  ],

  negative: [
    { id: "no_us_focus", label: "No U.S. focus", points: -20, test: (a) => !a.markets.includes("USA") },
    { id: "cannot_invest", label: "Cannot invest", points: -25, test: (a) => a.canInvest === "No" },
    {
      id: "no_follow_up",
      label: "No sales follow-up",
      points: -6,
      test: (a) => a.quoteHandler === "Other" && a.responseTime === "Next Day+",
    },
    { id: "next_day_only", label: "Next-day response only", points: -8, test: (a) => a.responseTime === "Next Day+" },
  ],

  hardStops: [
    { id: "cannot_invest", label: "Cannot allocate acquisition budget", test: (a) => a.canInvest === "No" },
    { id: "no_us_focus", label: "Does not serve the U.S. market", test: (a) => !a.markets.includes("USA") },
  ],
};

export type QualificationResult = {
  score: number;
  raw: number;
  qualified: boolean;
  matched: string[];
  flags: string[];
  hardStops: string[];
};

const pts = (r: Rule, a: ApplicationAnswers) => (typeof r.points === "function" ? r.points(a) : r.points);

/** Highest achievable positive points (used to normalise to 0–100). */
function maxPositive(config: QualificationConfig) {
  const probe = (r: Rule) => {
    if (typeof r.points === "number") return r.points;
    // Tiered rule: evaluate the strongest realistic answer set.
    return r.points({
      fullName: "",
      company: "",
      website: "x.com",
      email: "",
      phone: "",
      productionLocation: "United States",
      productionLocationOther: "",
      markets: ["USA"],
      patchTypes: ["Embroidered"],
      customerChannels: ["Referrals & repeat customers"],
      quoteHandler: "Sales Team",
      responseTime: "Under 5 Minutes",
      usesCrm: "Yes",
      runsAds: "Yes",
      desiredVolume: "20+ / Day",
      canInvest: "Yes",
      successNotes: "",
    });
  };
  return config.positive.reduce((s, r) => s + Math.max(0, probe(r)), 0) || 1;
}

export function scoreApplication(a: ApplicationAnswers, config: QualificationConfig = QUALIFICATION_CONFIG): QualificationResult {
  const matched: string[] = [];
  const flags: string[] = [];
  let raw = 0;
  for (const r of config.positive) {
    if (r.test(a)) {
      raw += pts(r, a);
      matched.push(r.id);
    }
  }
  for (const r of config.negative) {
    if (r.test(a)) {
      raw += pts(r, a);
      flags.push(r.id);
    }
  }
  const hardStops = config.hardStops.filter((h) => h.test(a)).map((h) => h.id);
  const score = Math.max(0, Math.min(100, Math.round((raw / maxPositive(config)) * 100)));
  return { score, raw, qualified: score >= config.threshold && hardStops.length === 0, matched, flags, hardStops };
}
