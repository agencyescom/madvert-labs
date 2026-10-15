import type { PhaseKey, ServiceKey } from "../types";

export type QuestionType = "text" | "textarea" | "email" | "tel" | "url" | "number" | "select" | "radio" | "multi";

export interface Question {
  key: string;
  label: string;
  type: QuestionType;
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** Half width on desktop. */
  half?: boolean;
  showIf?: { key: string; equals?: string; in?: string[]; includes?: string };
  /** Only asked when the engagement includes one of these services. */
  services?: ServiceKey[];
  order?: number;
  custom?: boolean;
}

export interface SectionDef {
  key: string;
  phase: PhaseKey;
  letter?: string;
  title: string;
  intro?: string;
  why?: { title: string; body: string };
  questions: Question[];
}

const TIMEZONES = [
  "Asia/Dubai (GST)",
  "Asia/Karachi (PKT)",
  "Asia/Riyadh (AST)",
  "Europe/London (GMT/BST)",
  "Europe/Berlin (CET)",
  "America/New_York (ET)",
  "America/Chicago (CT)",
  "America/Denver (MT)",
  "America/Los_Angeles (PT)",
  "Australia/Sydney (AET)",
  "Other",
];

export const GOALS = [
  "More Qualified Leads",
  "More Sales",
  "More Appointments",
  "Lower Acquisition Cost",
  "Better Lead Quality",
  "Organic Growth",
  "Improve Conversion",
  "Brand Growth",
  "Automation",
  "Other",
] as const;

/* ───────── Step 01 · Business information ───────── */

export const BUSINESS_SECTIONS: SectionDef[] = [
  {
    key: "business.company",
    phase: "business",
    letter: "A",
    title: "Company",
    intro: "The basics, so every document, campaign and contract uses the right details.",
    questions: [
      { key: "legal_name", label: "Legal business name", type: "text", required: true, half: true },
      { key: "trading_name", label: "Trading name", type: "text", half: true, help: "If customers know you by a different name." },
      { key: "website", label: "Website", type: "url", placeholder: "https://", half: true },
      { key: "industry", label: "Industry", type: "text", required: true, half: true, placeholder: "e.g. Luxury interiors" },
      { key: "year_established", label: "Year established", type: "number", half: true },
      { key: "team_size", label: "Team size", type: "select", options: ["Just me", "2–5", "6–20", "21–50", "51–200", "200+"], half: true },
      { key: "locations", label: "Business locations", type: "text", half: true, placeholder: "e.g. Dubai, Abu Dhabi" },
      { key: "countries", label: "Countries served", type: "text", required: true, half: true, placeholder: "e.g. UAE, Saudi Arabia" },
      { key: "address", label: "Business address", type: "textarea" },
      { key: "contact_name", label: "Primary contact", type: "text", required: true, half: true },
      { key: "contact_role", label: "Role", type: "text", half: true },
      { key: "contact_email", label: "Email", type: "email", required: true, half: true },
      { key: "contact_phone", label: "Phone", type: "tel", half: true },
      { key: "timezone", label: "Timezone", type: "select", options: TIMEZONES, required: true, half: true },
    ],
  },
  {
    key: "business.model",
    phase: "business",
    letter: "B",
    title: "Business model",
    intro: "How the business makes money, so we optimise for revenue and not vanity metrics.",
    why: {
      title: "Why we ask about revenue and capacity",
      body: "Sale value and lifetime value decide how much a customer is worth acquiring. Capacity tells us how hard we can push demand before your team becomes the bottleneck. Ranges are fine and optional figures can stay blank.",
    },
    questions: [
      { key: "sells", label: "What do you sell?", type: "radio", options: ["Products", "Services", "Both"], required: true },
      { key: "main_offers", label: "Main products / services", type: "textarea", required: true, placeholder: "List the ones that matter most for growth first." },
      { key: "avg_sale", label: "Average sale value", type: "text", required: true, half: true, placeholder: "e.g. AED 18,000" },
      { key: "ltv", label: "Typical customer lifetime value", type: "text", half: true, help: "If known." },
      {
        key: "revenue_range",
        label: "Approximate monthly revenue",
        type: "select",
        options: ["Prefer not to say", "Under $10k", "$10k–$50k", "$50k–$150k", "$150k–$500k", "$500k–$1M", "$1M+"],
        half: true,
        help: "Optional.",
      },
      { key: "marketing_spend", label: "Current monthly marketing spend", type: "text", half: true, help: "Optional." },
      {
        key: "capacity",
        label: "If we significantly increase demand, approximately how many new customers or orders could your team handle per month?",
        type: "text",
        required: true,
        placeholder: "e.g. 25 new projects / month",
      },
    ],
  },
  {
    key: "business.customers",
    phase: "business",
    letter: "C",
    title: "Customers",
    intro: "Who buys, why they buy and what slows them down.",
    questions: [
      { key: "market", label: "Who do you sell to?", type: "radio", options: ["B2B", "B2C", "Both"], required: true },
      { key: "ideal_customer", label: "Describe your ideal customer", type: "textarea", required: true, placeholder: "Who are they, what do they care about, what do they usually spend?" },
      { key: "customer_locations", label: "Primary customer locations", type: "text", half: true },
      { key: "sales_cycle", label: "Typical sales cycle", type: "select", options: ["Same day", "Under a week", "1–4 weeks", "1–3 months", "3+ months"], half: true },
      { key: "customer_problems", label: "Typical customer problems", type: "textarea" },
      { key: "why_buy", label: "Why customers usually buy from you", type: "textarea", required: true },
      { key: "objections", label: "Common objections", type: "textarea", placeholder: "Price, timing, trust…" },
    ],
  },
  {
    key: "business.growth",
    phase: "business",
    letter: "D",
    title: "Growth",
    intro: "What success looks like, in your words.",
    questions: [
      { key: "success", label: "What would make this engagement successful?", type: "textarea", required: true },
      { key: "primary_goal", label: "Primary goal", type: "multi", options: GOALS, required: true, help: "Pick up to three." },
      { key: "goal_other", label: "Other goal", type: "text", showIf: { key: "primary_goal", includes: "Other" } },
      { key: "bottleneck", label: "Biggest current marketing bottleneck", type: "textarea", required: true },
      { key: "anything_else", label: "Anything Madvert should know before starting?", type: "textarea" },
    ],
  },
];

/* ───────── Step 04 · Offer workshop ───────── */

export const SAVINGS = ["Time", "Money", "Stress", "Risk", "Effort", "Staff", "Complexity"] as const;
export const GUARANTEE_TYPES = [
  "Money-back guarantee",
  "Replacement guarantee",
  "Revision guarantee",
  "Delivery guarantee",
  "Quality guarantee",
  "Response-time guarantee",
  "Price guarantee",
  "Performance-related guarantee",
  "Trial",
  "Sample",
  "Free consultation",
  "Inspection",
  "Proof before payment",
  "Custom",
] as const;
export const SPEED_OPTIONS = ["Same day", "24 hours", "48 hours", "Express", "Priority", "Instant", "Automated"] as const;
export const BONUS_IDEAS = [
  "Free consultation",
  "Free audit",
  "Free quote",
  "Free mockup",
  "Free design",
  "Free delivery",
  "Free setup",
  "Free assessment",
  "Free onboarding",
  "Free training",
  "Priority support",
  "Extra revision",
  "Extended support",
  "Template",
  "Checklist",
  "Guide",
  "Tool",
  "Calculator",
  "Sample",
  "Bonus product",
] as const;
export const OBJECTION_CATEGORIES = [
  "Too expensive",
  "Need to think",
  "Already have supplier",
  "Don't trust quality",
  "Timing",
  "No urgency",
  "Competitor cheaper",
  "Need approval",
  "Uncertain ROI",
  "Other",
] as const;

export const OFFER_SECTIONS: SectionDef[] = [
  {
    key: "offer.foundation",
    phase: "offer",
    title: "Foundation",
    intro: "Start with what you sell and the outcome customers are really paying for.",
    questions: [
      { key: "selling", label: "What exactly are you selling?", type: "textarea" },
      { key: "primary_offer", label: "What is the primary product or service?", type: "text" },
      { key: "outcome", label: "What outcome does the customer actually want?", type: "textarea" },
      { key: "problem", label: "What problem is the customer trying to solve?", type: "textarea" },
      { key: "best_customer", label: "Who is the best possible customer for this offer?", type: "textarea" },
      { key: "price", label: "What is the current price?", type: "text", half: true },
      { key: "pricing_type", label: "Is pricing fixed or custom?", type: "radio", options: ["Fixed", "Custom", "Both"], half: true },
      { key: "packaging", label: "How is it currently packaged?", type: "textarea", placeholder: "Tiers, packages, retainers, one-off…" },
    ],
  },
  {
    key: "offer.value",
    phase: "offer",
    title: "Value & transformation",
    intro: "The difference between before and after is what people pay for.",
    questions: [
      { key: "before", label: "What does the customer have before buying?", type: "textarea", half: true },
      { key: "after", label: "What changes after buying?", type: "textarea", half: true },
      { key: "end_result", label: "What is the ideal end result?", type: "textarea" },
      { key: "time_to_value", label: "How quickly can the customer realistically experience value?", type: "text" },
      { key: "financial_value", label: "What makes the outcome valuable financially?", type: "textarea", half: true },
      { key: "emotional_value", label: "What makes it valuable emotionally?", type: "textarea", half: true },
      { key: "inconvenience", label: "What inconvenience does it remove?", type: "textarea" },
      { key: "saves", label: "What does it save?", type: "multi", options: SAVINGS },
      { key: "saves_detail", label: "Explain how", type: "textarea", showIf: { key: "saves", in: [...SAVINGS] } },
    ],
  },
  {
    key: "offer.usp",
    phase: "offer",
    title: "Differentiation",
    intro: "Why you, and not the next search result.",
    questions: [
      { key: "why_you", label: "Why should somebody choose you instead of a competitor?", type: "textarea" },
      { key: "unique", label: "What do you do that competitors typically do not?", type: "textarea" },
      { key: "faster", label: "What are you faster at?", type: "text", half: true },
      { key: "better", label: "What are you better at?", type: "text", half: true },
      { key: "customise", label: "What can you customise?", type: "text", half: true },
      { key: "expertise", label: "What expertise do you have?", type: "text", half: true },
      { key: "method", label: "What proprietary process or method do you use?", type: "textarea" },
      { key: "easier", label: "What makes your service easier?", type: "text", half: true },
      { key: "safer", label: "What makes it safer?", type: "text", half: true },
      { key: "convenient", label: "What makes it more convenient?", type: "text", half: true },
      { key: "reliable", label: "What makes it more reliable?", type: "text", half: true },
      { key: "praise", label: "What do your best customers repeatedly praise?", type: "textarea" },
      { key: "moat", label: "What is difficult for competitors to copy?", type: "textarea" },
    ],
  },
  {
    key: "offer.proof",
    phase: "offer",
    title: "Proof & certainty",
    intro: "Evidence that makes buying from you feel safer. Only real, verifiable facts.",
    questions: [
      { key: "years", label: "Years in business", type: "text", half: true },
      { key: "customers_served", label: "Customers served", type: "text", half: true },
      { key: "projects", label: "Projects completed", type: "text", half: true },
      { key: "countries_served", label: "Countries served", type: "text", half: true },
      { key: "results", label: "Relevant revenue or results", type: "textarea", help: "Only where appropriate and verifiable." },
      { key: "credentials", label: "Certifications, licences, accreditations", type: "textarea", half: true },
      { key: "awards", label: "Awards and partnerships", type: "textarea", half: true },
      { key: "clients", label: "Recognisable clients", type: "text" },
      { key: "rating", label: "Review rating", type: "text", half: true, placeholder: "e.g. 4.9 on Google" },
      { key: "review_volume", label: "Review volume", type: "text", half: true },
      { key: "press", label: "Media mentions and press coverage", type: "textarea" },
      { key: "ip", label: "Patents or proprietary technology", type: "text" },
      { key: "team_credentials", label: "Team credentials", type: "text" },
      { key: "safety_evidence", label: "What evidence makes buying from you feel safer?", type: "textarea" },
    ],
  },
  {
    key: "offer.risk",
    phase: "offer",
    title: "Risk reversal",
    intro: "Remove the fear that stops people buying. Only guarantees you can responsibly keep.",
    questions: [
      { key: "fears", label: "What is the customer afraid might go wrong?", type: "textarea" },
      { key: "blockers", label: "What stops prospects from buying?", type: "textarea" },
    ],
  },
  {
    key: "offer.speed",
    phase: "offer",
    title: "Speed & convenience",
    intro: "How fast customers get each part of the experience.",
    questions: [
      { key: "speed_response", label: "A response", type: "text", half: true },
      { key: "speed_quote", label: "A quote", type: "text", half: true },
      { key: "speed_consult", label: "A consultation", type: "text", half: true },
      { key: "speed_sample", label: "A sample", type: "text", half: true },
      { key: "speed_delivery", label: "Delivery", type: "text", half: true },
      { key: "speed_install", label: "Installation", type: "text", half: true },
      { key: "speed_results", label: "Results", type: "text", half: true },
      { key: "speed_support", label: "Support", type: "text", half: true },
      { key: "speed_possible", label: "Can anything be made…", type: "multi", options: SPEED_OPTIONS },
      { key: "friction", label: "What removes friction from buying?", type: "textarea" },
    ],
  },
  {
    key: "offer.bonuses",
    phase: "offer",
    title: "Bonuses",
    intro: "What could we include that is inexpensive for you but highly valuable to the customer?",
    questions: [],
  },
  {
    key: "offer.stack",
    phase: "offer",
    title: "Value stack",
    intro: "Everything a customer gets, in one view.",
    questions: [
      {
        key: "stack_more",
        label: "What else could we add that would make the decision significantly easier without damaging profitability?",
        type: "textarea",
      },
    ],
  },
  {
    key: "offer.objections",
    phase: "offer",
    title: "Objections",
    intro: "The five most common reasons prospects do not buy, and how you answer them today.",
    questions: [],
  },
  {
    key: "offer.competitors",
    phase: "offer",
    title: "Competitors",
    intro: "Who customers compare you with.",
    questions: [
      { key: "admired", label: "Which competitor's marketing do you admire?", type: "text" },
      { key: "admired_why", label: "Why?", type: "textarea" },
    ],
  },
];

export const ALL_SECTIONS = [...BUSINESS_SECTIONS, ...OFFER_SECTIONS];

/** Is the question visible given the other answers in its section? */
export function isVisible(q: Question, values: Record<string, unknown>) {
  if (!q.showIf) return true;
  const v = values[q.showIf.key];
  if (q.showIf.equals !== undefined) return v === q.showIf.equals;
  if (q.showIf.includes !== undefined) return Array.isArray(v) && v.includes(q.showIf.includes);
  if (q.showIf.in) return Array.isArray(v) ? v.some((x) => q.showIf!.in!.includes(String(x))) : q.showIf.in.includes(String(v ?? ""));
  return true;
}

export function isAnswered(v: unknown) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}
