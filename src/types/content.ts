export type CaseStudyCategory = "acquisition" | "seo" | "branding" | "studios" | "automation" | "technology";

export type Metric = { label: string; value: string; context?: string };

export type ImageAsset = { url: string; alt: string; width?: number; height?: number };

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  videoUrl?: string;
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
  /** True while the entry is a framework awaiting real client data. Placeholders are noindexed. */
  placeholder?: boolean;
};

export type ResourceCategory = "acquire" | "convert" | "search" | "brand" | "automate" | "build";
export type GatingType = "open" | "email" | "form" | "qualified";

export type Resource = {
  slug: string;
  title: string;
  kind: string;
  category: ResourceCategory;
  description: string;
  outline: string[];
  gating: GatingType;
  fileUrl?: string;
  externalUrl?: string;
  relatedService?: string;
  featured?: boolean;
  cover?: ImageAsset;
  seo?: { title?: string; description?: string };
  placeholder?: boolean;
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
