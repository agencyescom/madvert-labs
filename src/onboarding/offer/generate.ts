/**
 * One-click offer generator. Pure and deterministic (no AI, no invented numbers): it arranges
 * what the business already told us into a complete offer using proven offer structure
 * (dream outcome, time to value, effort removed, risk reversal, value stack, scarcity).
 * Every figure shown comes from the input; nothing is made up.
 */

export interface OfferInput {
  business: string;
  offerName?: string;
  product: string;
  audience: string;
  outcome: string;
  problem: string;
  timeframe?: string;
  price?: string;
  coreValue?: string;
  uniqueness?: string;
  proof?: string;
  guarantee?: string;
  speed?: string;
  effort?: string;
  bonuses?: { name: string; value?: string; description?: string }[];
  objections?: string[];
  scarcity?: string;
}

export interface GeneratedOffer {
  name: string;
  headlines: string[];
  subheadline: string;
  promise: string;
  forWho: string[];
  stack: { label: string; title: string; detail: string; value?: string }[];
  totalValue?: string;
  price?: string;
  guarantee?: string;
  proof: string[];
  urgency?: string;
  cta: string;
  objections: { q: string; a: string }[];
  ps: string;
}

const clean = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim();
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const lowerFirst = (s: string) => (s && !/^[A-Z]{2}/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const noDot = (s: string) => s.replace(/[.!\s]+$/, "");
const words = (s: string, n: number) => s.split(" ").slice(0, n).join(" ");

/** "AED 1,500" → { amount: 1500, prefix: "AED ", suffix: "" } */
export function parseMoney(s?: string) {
  const m = clean(s).match(/^([^\d-]*)([\d.,]+)\s*(k|K|m|M)?(.*)$/);
  if (!m) return null;
  let amount = Number(m[2].replace(/,/g, ""));
  if (!Number.isFinite(amount)) return null;
  if (m[3]?.toLowerCase() === "k") amount *= 1000;
  if (m[3]?.toLowerCase() === "m") amount *= 1_000_000;
  return { amount, prefix: m[1], suffix: m[4].trim() ? ` ${m[4].trim()}` : "" };
}

const fmt = (n: number, prefix: string, suffix = "") => `${prefix}${Math.round(n).toLocaleString("en-US")}${suffix}`;

export function generateOffer(raw: OfferInput): GeneratedOffer {
  const i = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === "string" && k !== "proof" ? clean(v) : v])) as OfferInput;
  const outcome = noDot(i.outcome || "real, measurable results");
  const problem = noDot(lowerFirst(i.problem || "the usual guesswork"));
  const audience = noDot(i.audience || "businesses like yours");
  const product = noDot(i.product || "our service");
  const name = noDot(i.offerName || `The ${cap(words(outcome.replace(/^(get|more|a|an|the)\s+/i, ""), 4))} ${/system|program|package|plan/i.test(product) ? "" : "Program"}`.trim());
  const timeframe = noDot(i.timeframe ?? "");
  const speed = noDot(i.speed ?? "");
  const guarantee = noDot(i.guarantee ?? "");

  const headlines = [
    `${cap(outcome)}${timeframe ? ` in ${timeframe}` : ""}, without ${problem}`,
    `For ${lowerFirst(audience)}: ${lowerFirst(outcome)}${guarantee ? ", backed by our guarantee" : ""}`,
    `Introducing ${name}: ${lowerFirst(outcome)}${speed ? `, ${lowerFirst(speed)}` : ""}`,
  ];

  const subheadline = `${name}: ${lowerFirst(product)}, built for ${lowerFirst(audience)}.${i.uniqueness ? ` ${cap(noDot(i.uniqueness))}.` : ""}`;
  const promise = `We help ${lowerFirst(audience)} ${lowerFirst(outcome.replace(/^get\s+/i, "get "))}${timeframe ? ` within ${timeframe}` : ""}, so ${problem} stops costing them time and money.`;

  const forWho = [
    /\bwho\b/i.test(audience) ? cap(audience) : `${cap(audience)} who want ${lowerFirst(outcome)}`,
    `Anyone tired of ${problem}`,
    i.effort ? `Teams who want it done for them: ${lowerFirst(noDot(i.effort))}` : `Owners who want a clear plan instead of more guesswork`,
  ];

  const stack: GeneratedOffer["stack"] = [{ label: "CORE OFFER", title: name, detail: cap(product), value: clean(i.coreValue) || undefined }];
  (i.bonuses ?? [])
    .filter((b) => clean(b.name))
    .forEach((b, n) => stack.push({ label: `BONUS ${n + 1}`, title: cap(clean(b.name)), detail: clean(b.description) || "Included at no extra cost", value: clean(b.value) || undefined }));
  if (speed) stack.push({ label: "SPEED", title: cap(speed), detail: "So you see value sooner" });
  if (guarantee) stack.push({ label: "GUARANTEE", title: cap(guarantee), detail: "You carry less of the risk" });

  // Totals only from numbers the user actually gave.
  const values = stack.map((s) => parseMoney(s.value)).filter(Boolean) as NonNullable<ReturnType<typeof parseMoney>>[];
  const priceM = parseMoney(i.price);
  const prefix = values[0]?.prefix ?? priceM?.prefix ?? "";
  const total = values.reduce((n, v) => n + v.amount, 0);
  const totalValue = values.length >= 2 || (values.length === 1 && priceM && values[0].amount > priceM.amount) ? fmt(total, prefix, values[0].suffix) : undefined;

  const proof = (i.proof ?? "")
    .split(/\n|;|•/)
    .map(clean)
    .filter(Boolean)
    .slice(0, 4);

  const answer = (q: string) => {
    const t = q.toLowerCase();
    if (/(price|expens|cost|budget|afford|cheap)/.test(t))
      return totalValue && i.price
        ? `You get ${totalValue} of value for ${i.price}.${guarantee ? ` And ${lowerFirst(guarantee)}.` : ""}`
        : guarantee
          ? `${cap(guarantee)}, so the risk sits with us, not you.`
          : `It is built to pay for itself through ${lowerFirst(outcome)}.`;
    if (/(time|busy|bandwidth|later|timing)/.test(t)) return speed ? `${cap(speed)}. ${i.effort ? cap(noDot(i.effort)) + "." : "We handle the heavy lifting."}` : "We handle the heavy lifting, so it takes very little of your time.";
    if (/(trust|quality|work|proof|sure|risk|scam)/.test(t)) return proof[0] ? `${proof[0]}.${guarantee ? ` Plus: ${lowerFirst(guarantee)}.` : ""}` : guarantee ? `${cap(guarantee)}.` : "You will see exactly what we do and why, from day one.";
    if (/(compet|other|already|supplier|agency)/.test(t)) return i.uniqueness ? `${cap(noDot(i.uniqueness))}.` : `We focus on one thing: ${lowerFirst(outcome)}.`;
    return guarantee ? `${cap(guarantee)}.` : `We will walk you through it before you commit.`;
  };
  const objections = (i.objections ?? []).map(clean).filter(Boolean).slice(0, 5).map((q) => ({ q: cap(q), a: answer(q) }));

  return {
    name,
    headlines,
    subheadline,
    promise,
    forWho,
    stack,
    totalValue,
    price: i.price || undefined,
    guarantee: guarantee ? cap(guarantee) : undefined,
    proof,
    urgency: i.scarcity ? cap(noDot(i.scarcity)) : undefined,
    cta: `Claim ${name}`,
    objections,
    ps: `P.S. ${guarantee ? `${cap(guarantee)}. ` : ""}The fastest way to ${lowerFirst(outcome.replace(/^get\s+/i, "get "))} is to start now.`,
  };
}

/** Text version (copy to clipboard / share by message). */
export function offerText(o: GeneratedOffer) {
  return [
    o.headlines[0],
    "",
    o.subheadline,
    "",
    o.promise,
    "",
    "WHAT YOU GET",
    ...o.stack.map((s) => `• ${s.label}: ${s.title}${s.value ? ` (value ${s.value})` : ""}`),
    o.totalValue ? `Total value: ${o.totalValue}` : "",
    o.price ? `Your investment: ${o.price}` : "",
    o.guarantee ? `Guarantee: ${o.guarantee}` : "",
    o.urgency ? `${o.urgency}` : "",
    "",
    o.ps,
  ]
    .filter((l, n, a) => l !== "" || a[n - 1] !== "")
    .join("\n");
}

/** Maps a client's Offer Workshop answers to the generator input. Only Client Approved guarantees are used. */
export function inputFromWorkshop(
  company: string,
  v: Record<string, unknown>,
  lists: { bonuses: { name: string; perceivedValue?: string; description?: string }[]; guarantees: { type: string; terms: string; clientApproved: boolean }[]; objections: { objection: string }[] },
): OfferInput {
  const s = (k: string) => (Array.isArray(v[k]) ? (v[k] as string[]).join(", ") : String(v[k] ?? ""));
  const g = lists.guarantees.find((x) => x.clientApproved);
  const proofBits = [
    s("years") && `${s("years")} years in business`,
    s("customers_served") && `${s("customers_served")} customers served`,
    s("projects") && `${s("projects")} projects completed`,
    s("rating") && `Rated ${s("rating")}${s("review_volume") ? ` from ${s("review_volume")} reviews` : ""}`,
    s("awards"),
  ].filter(Boolean);
  return {
    business: company,
    product: s("primary_offer") || s("selling"),
    audience: s("best_customer"),
    outcome: s("outcome") || s("end_result"),
    problem: s("problem"),
    timeframe: s("time_to_value"),
    price: s("price"),
    uniqueness: s("why_you") || s("unique") || s("moat"),
    proof: proofBits.join("\n"),
    guarantee: g ? `${g.type}${g.terms ? `: ${g.terms}` : ""}` : "",
    speed: s("speed_delivery") ? `Delivery in ${s("speed_delivery")}` : s("speed_possible"),
    effort: s("inconvenience"),
    bonuses: lists.bonuses.map((b) => ({ name: b.name, value: b.perceivedValue, description: b.description })),
    objections: lists.objections.map((o) => o.objection),
  };
}
