/**
 * Application schema — single source of truth for the form, the scoring logic
 * and server-side validation.
 */
export const OPTIONS = {
  productionLocation: ["Pakistan", "United States", "Other"],
  markets: ["USA", "Canada", "UK", "Europe", "Other"],
  patchTypes: ["Embroidered", "PVC", "Chenille", "Woven", "Leather", "Printed", "Other"],
  customerChannels: [
    "Referrals & repeat customers",
    "Google / SEO",
    "Paid ads (Meta, Google)",
    "Marketplaces (Etsy, Amazon, Alibaba)",
    "Cold email / LinkedIn outreach",
    "Sales reps & trade shows",
    "Organic social media",
    "Other",
  ],
  quoteHandler: ["Owner", "Salesperson", "Sales Team", "Other"],
  responseTime: ["Under 5 Minutes", "Under 30 Minutes", "Within 2 Hours", "Same Day", "Next Day+"],
  yesNo: ["Yes", "No"],
  desiredVolume: ["3–5 / Day", "5–10 / Day", "10–20 / Day", "20+ / Day"],
} as const;

export type ApplicationAnswers = {
  fullName: string;
  company: string;
  website: string;
  email: string;
  phone: string;
  productionLocation: string;
  productionLocationOther: string;
  markets: string[];
  patchTypes: string[];
  /** How customers currently find the business */
  customerChannels: string[];
  quoteHandler: string;
  responseTime: string;
  usesCrm: string;
  runsAds: string;
  desiredVolume: string;
  canInvest: string;
  successNotes: string;
};

export const EMPTY_ANSWERS: ApplicationAnswers = {
  fullName: "",
  company: "",
  website: "",
  email: "",
  phone: "",
  productionLocation: "",
  productionLocationOther: "",
  markets: [],
  patchTypes: [],
  customerChannels: [],
  quoteHandler: "",
  responseTime: "",
  usesCrm: "",
  runsAds: "",
  desiredVolume: "",
  canInvest: "",
  successNotes: "",
};

export const STEPS = [
  { key: "business", label: "Business", title: "Your business" },
  { key: "production", label: "Production", title: "Production" },
  { key: "sales", label: "Sales Process", title: "Sales process" },
  { key: "growth", label: "Growth Target", title: "Growth target" },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;

export type FieldErrors = Partial<Record<keyof ApplicationAnswers, string>>;

const oneOf = (list: readonly string[], v: string) => list.includes(v);

/** Validate one step (0-based). Returns an empty object when valid. */
export function validateStep(step: number, a: ApplicationAnswers): FieldErrors {
  const e: FieldErrors = {};
  if (step === 0) {
    if (a.fullName.trim().length < 2) e.fullName = "Please enter your full name.";
    if (a.company.trim().length < 2) e.company = "Please enter your company name.";
    if (!URL_RE.test(a.website.trim())) e.website = "Please enter your website, e.g. yourcompany.com";
    if (!EMAIL_RE.test(a.email.trim())) e.email = "Please enter a valid business email.";
    if (a.phone.replace(/\D/g, "").length < 7) e.phone = "Please enter a phone or WhatsApp number.";
  }
  if (step === 1) {
    if (!oneOf(OPTIONS.productionLocation, a.productionLocation)) e.productionLocation = "Select where production is located.";
    if (a.productionLocation === "Other" && a.productionLocationOther.trim().length < 2)
      e.productionLocationOther = "Tell us the country.";
    if (a.markets.length === 0) e.markets = "Select at least one market.";
    if (a.patchTypes.length === 0) e.patchTypes = "Select at least one patch type.";
  }
  if (step === 2) {
    if (!oneOf(OPTIONS.quoteHandler, a.quoteHandler)) e.quoteHandler = "Select who handles quotations.";
    if (!oneOf(OPTIONS.responseTime, a.responseTime)) e.responseTime = "Select your typical response time.";
    if (!oneOf(OPTIONS.yesNo, a.usesCrm)) e.usesCrm = "Select one.";
    if (!oneOf(OPTIONS.yesNo, a.runsAds)) e.runsAds = "Select one.";
    if (a.customerChannels.length === 0) e.customerChannels = "Select at least one.";
  }
  if (step === 3) {
    if (!oneOf(OPTIONS.desiredVolume, a.desiredVolume)) e.desiredVolume = "Select a starting volume.";
    if (!oneOf(OPTIONS.yesNo, a.canInvest)) e.canInvest = "Select one.";
    if (a.successNotes.length > 2000) e.successNotes = "Please keep this under 2,000 characters.";
  }
  return e;
}

export function validateAll(a: ApplicationAnswers): FieldErrors {
  return STEPS.reduce<FieldErrors>((acc, _s, i) => ({ ...acc, ...validateStep(i, a) }), {});
}

/** Coerce an unknown payload into ApplicationAnswers (server side). */
export function sanitizeAnswers(input: unknown): ApplicationAnswers {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const str = (k: keyof ApplicationAnswers, max = 300) =>
    typeof src[k] === "string" ? (src[k] as string).trim().slice(0, max) : "";
  const arr = (k: keyof ApplicationAnswers, allowed: readonly string[]) =>
    Array.isArray(src[k]) ? (src[k] as unknown[]).filter((v): v is string => typeof v === "string" && allowed.includes(v)) : [];
  return {
    fullName: str("fullName", 120),
    company: str("company", 160),
    website: str("website", 300),
    email: str("email", 200),
    phone: str("phone", 40),
    productionLocation: str("productionLocation", 40),
    productionLocationOther: str("productionLocationOther", 80),
    markets: arr("markets", OPTIONS.markets),
    patchTypes: arr("patchTypes", OPTIONS.patchTypes),
    customerChannels: arr("customerChannels", OPTIONS.customerChannels),
    quoteHandler: str("quoteHandler", 30),
    responseTime: str("responseTime", 30),
    usesCrm: str("usesCrm", 5),
    runsAds: str("runsAds", 5),
    desiredVolume: str("desiredVolume", 20),
    canInvest: str("canInvest", 5),
    successNotes: str("successNotes", 2000),
  };
}

/* ───────────── Discovery-call form (short form shown before the booking calendar) ───────────── */

export const DISCOVERY_OPTIONS = {
  monthlyRevenue: ["Under $10k", "$10k–$25k", "$25k–$50k", "$50k–$100k", "$100k–$250k", "$250k+"],
  customerChannels: OPTIONS.customerChannels,
  rfqsPerMonth: ["Under 50", "50–100", "100–250", "250–500", "500+"],
  markets: ["USA", "Canada", "UK", "Europe", "Australia", "Other"],
  manufacturing: ["We manufacture in-house", "We outsource manufacturing", "Both"],
} as const;

export type DiscoveryAnswers = {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website: string;
  monthlyRevenue: string;
  customerChannels: string[];
  rfqsPerMonth: string;
  markets: string[];
  manufacturing: string;
};

export const EMPTY_DISCOVERY: DiscoveryAnswers = {
  fullName: "",
  email: "",
  phone: "",
  businessName: "",
  website: "",
  monthlyRevenue: "",
  customerChannels: [],
  rfqsPerMonth: "",
  markets: [],
  manufacturing: "",
};

export type DiscoveryErrors = Partial<Record<keyof DiscoveryAnswers, string>>;

export function validateDiscovery(d: DiscoveryAnswers): DiscoveryErrors {
  const e: DiscoveryErrors = {};
  if (d.fullName.trim().length < 2) e.fullName = "Please enter your name.";
  if (!EMAIL_RE.test(d.email.trim())) e.email = "Please enter a valid business email.";
  if (d.phone.replace(/\D/g, "").length < 7) e.phone = "Please enter a phone or WhatsApp number.";
  if (d.businessName.trim().length < 2) e.businessName = "Please enter your business name.";
  if (!URL_RE.test(d.website.trim())) e.website = "Please enter your website, e.g. yourcompany.com";
  if (!oneOf(DISCOVERY_OPTIONS.monthlyRevenue, d.monthlyRevenue)) e.monthlyRevenue = "Select your current monthly revenue.";
  if (d.customerChannels.length === 0) e.customerChannels = "Select at least one.";
  if (!oneOf(DISCOVERY_OPTIONS.rfqsPerMonth, d.rfqsPerMonth)) e.rfqsPerMonth = "Select how many RFQs you want per month.";
  if (d.markets.length === 0) e.markets = "Select at least one market.";
  if (!oneOf(DISCOVERY_OPTIONS.manufacturing, d.manufacturing)) e.manufacturing = "Select one.";
  return e;
}

export function sanitizeDiscovery(input: unknown): DiscoveryAnswers {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const str = (k: keyof DiscoveryAnswers, max = 300) => (typeof src[k] === "string" ? (src[k] as string).trim().slice(0, max) : "");
  const arr = (k: keyof DiscoveryAnswers, allowed: readonly string[]) =>
    Array.isArray(src[k]) ? (src[k] as unknown[]).filter((v): v is string => typeof v === "string" && allowed.includes(v)) : [];
  return {
    fullName: str("fullName", 120),
    email: str("email", 200),
    phone: str("phone", 40),
    businessName: str("businessName", 160),
    website: str("website", 300),
    monthlyRevenue: str("monthlyRevenue", 30),
    customerChannels: arr("customerChannels", DISCOVERY_OPTIONS.customerChannels),
    rfqsPerMonth: str("rfqsPerMonth", 30),
    markets: arr("markets", DISCOVERY_OPTIONS.markets),
    manufacturing: str("manufacturing", 40),
  };
}
