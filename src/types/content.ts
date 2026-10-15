export type CaseStudyCategory = "acquisition" | "seo" | "branding" | "studios" | "automation" | "technology";

export type Metric = { label: string; value: string; context?: string };

export type ImageAsset = { url: string; alt: string; width?: number; height?: number };

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  /** Business name shown on the video card (falls back to company). */
  business?: string;
  industry?: string;
  market?: string;
  /** MP4/WebM file or a YouTube / Vimeo link. Without it the card renders with play disabled. */
  videoUrl?: string;
  /** Video thumbnail (poster frame). */
  posterUrl?: string;
  /** Display duration, e.g. "1:12". */
  duration?: string;
  placeholder?: boolean;
};

export type CaseStudy = {
  slug: string;
  title: string;
  client?: string;
  industry?: string;
  market?: string;
  categories: CaseStudyCategory[];
  services: string[];
  summary: string;
  problem: string;
  diagnosis: string;
  move: string;
  strategy?: string;
  execution?: string;
  creative?: string;
  system: string;
  result: string;
  learned?: string;
  metrics: Metric[];
  testimonial?: Testimonial;
  videoUrl?: string;
  featuredImage?: ImageAsset;
  gallery?: ImageAsset[];
  publishedAt?: string;
  seo?: { title?: string; description?: string };
  /** One-line card description (falls back to summary). */
  oneLiner?: string;
  /** Cover artwork. When absent a branded generated cover is drawn for the first category. */
  cover?: ImageAsset;
  /** Public URL of the downloadable PDF, e.g. /case-studies/<slug>.pdf. "Download PDF" only renders when set. */
  pdfUrl?: string;
  region?: string;
  /** Growth system type, e.g. "Lead Qualification System". Used as a filter. */
  systemType?: string;
  featured?: boolean;
  /** Detail page narrative (each falls back to the older field in brackets): challenge (problem), context, built (system), implementation (execution). */
  challenge?: string;
  context?: string;
  built?: string;
  implementation?: string;
  /** Verified outcome in the client's business terms. Only rendered when real. */
  outcome?: string;
  /** True while the entry is a framework awaiting real client data. Placeholders are noindexed. */
  placeholder?: boolean;
};

/** Vault library categories (labels, order and tints live in src/lib/resource-categories.ts). */
export type ResourceCategory = "offers" | "ads" | "leads" | "search" | "automation" | "conversion" | "brand";
export type GatingType = "open" | "email" | "form" | "qualified";

export type Resource = {
  slug: string;
  title: string;
  kind: string;
  category: ResourceCategory;
  description: string;
  /** Benefit bullets: what the reader actually gets out of it. */
  outline: string[];
  gating: GatingType;
  fileUrl?: string;
  externalUrl?: string;
  relatedService?: string;
  featured?: boolean;
  cover?: ImageAsset;
  /** Optional secondary artwork for the landing page (e.g. a 3D mockup of the same guide). */
  coverAlt?: ImageAsset;
  seo?: { title?: string; description?: string };
  placeholder?: boolean;
  // Lead magnet landing page
  sourceId?: string;
  badge?: string;
  categoryLabel?: string;
  heroHeadline?: string;
  outcome?: string;
  whoFor?: string[];
  formCta?: string;
  cardCta?: string;
  extraFields?: ("company" | "website")[];
  insight?: { title: string; points: string[] };
  successTitle?: string;
  successBody?: string;
  calendarTitle?: string;
  calendarAccent?: string;
  calendarBody?: string;
  proof?: { categories: CaseStudyCategory[]; labels: string[] };
  related?: string[];
  /** Official artwork has not been supplied yet; a branded CSS cover is shown meanwhile. */
  artworkPending?: boolean;
  /** The single resource promoted in the Vault's Featured Resource panel. */
  spotlight?: boolean;
  /** Short one-liner shown on Vault cards (falls back to outcome, then description). */
  tagline?: string;
  /** Up to four short value points shown beside the cover in the Featured Resource panel. */
  highlights?: string[];
};

export type Faq = { q: string; a: string };

export type TeamMember = {
  name: string;
  role: string;
  photo?: ImageAsset;
  bio?: string;
  placeholder?: boolean;
};

export type ProofItem = {
  kind: "testimonial" | "campaign" | "crm" | "creative" | "certification" | "video" | "result";
  label: string;
  image?: ImageAsset;
  caption?: string;
  placeholder?: boolean;
};

export type PortfolioProject = {
  slug: string;
  title: string;
  format: string;
  client?: string;
  videoUrl?: string;
  poster?: ImageAsset;
  placeholder?: boolean;
};

export type SiteSettings = {
  founderPhoto?: ImageAsset;
  heroImage?: ImageAsset;
  showreelUrl?: string;
  showreelPoster?: ImageAsset;
  clientLogos: { name: string; logo?: ImageAsset }[];
  certifications: { name: string; image?: ImageAsset }[];
};
