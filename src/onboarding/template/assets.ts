import type { ServiceKey } from "../types";

/** Internal client workspace structure. Created when onboarding starts. */
export const CLIENT_FOLDERS = [
  "01 Brand",
  "02 Advertising",
  "03 Creative",
  "04 Video",
  "05 Website",
  "06 Reports",
  "07 Raw Assets",
  "08 Approvals",
  "09 Strategy",
  "10 Documents",
] as const;
export type ClientFolder = (typeof CLIENT_FOLDERS)[number];

export interface AssetCategory {
  key: string;
  label: string;
  folder: ClientFolder;
}

export interface AssetSection {
  key: string;
  title: string;
  intro: string;
  /** Categories the client can tag each file with. */
  categories: AssetCategory[];
  /** Services that make at least one upload (or an explicit "I don't have this") required. */
  requiredFor: ServiceKey[];
  accept?: string;
  hints?: string[];
}

const c = (key: string, label: string, folder: ClientFolder): AssetCategory => ({ key, label, folder });

export const ASSET_SECTIONS: AssetSection[] = [
  {
    key: "logos",
    title: "Logos",
    intro: "Every version you have. Vector files are gold, but a PNG is a perfectly good start.",
    categories: [
      c("logo_primary", "Primary logo", "01 Brand"),
      c("logo_secondary", "Secondary logo", "01 Brand"),
      c("logo_icon", "Icon", "01 Brand"),
      c("logo_png", "Transparent PNG", "01 Brand"),
      c("logo_vector", "SVG / Vector", "01 Brand"),
    ],
    requiredFor: ["branding", "studios", "meta_ads", "google_ads", "website", "strategy", "seo", "crm_automation", "development"],
    accept: "image/*,.svg,.ai,.eps,.pdf,.zip",
    hints: ["Primary logo", "Secondary logo", "Icon", "Transparent PNG", "SVG / Vector if available"],
  },
  {
    key: "brand_guidelines",
    title: "Brand guidelines",
    intro: "Only if they exist. No guidelines? No problem, we simply continue.",
    categories: [c("brand_guidelines", "Brand guidelines / brand folder", "01 Brand")],
    requiredFor: [],
    accept: ".pdf,.zip,image/*",
  },
  {
    key: "brand_assets",
    title: "Brand assets",
    intro: "Fonts, colours and photography. Upload files or paste a folder link.",
    categories: [
      c("fonts", "Fonts", "01 Brand"),
      c("colors", "Colour references", "01 Brand"),
      c("brand_photography", "Brand photography", "03 Creative"),
      c("product_photos", "Product photos", "03 Creative"),
      c("service_photos", "Service photos", "03 Creative"),
      c("team_photos", "Team photos", "03 Creative"),
      c("founder_photos", "Founder photos", "03 Creative"),
      c("location_photos", "Office / location photos", "03 Creative"),
      c("lifestyle", "Lifestyle imagery", "03 Creative"),
      c("design_assets", "Existing design assets", "03 Creative"),
    ],
    requiredFor: ["branding", "studios", "meta_ads", "google_ads", "website"],
  },
  {
    key: "marketing",
    title: "Marketing materials",
    intro: "What has been tried before, what worked and what did not.",
    categories: [
      c("old_ads", "Old ads", "02 Advertising"),
      c("winning_ads", "Winning ads", "02 Advertising"),
      c("video_footage", "Video footage", "04 Video"),
      c("raw_video", "Raw video", "07 Raw Assets"),
      c("brochures", "Brochures", "10 Documents"),
      c("catalogs", "Catalogues", "10 Documents"),
      c("sales_decks", "Sales decks", "10 Documents"),
      c("price_lists", "Price lists", "10 Documents"),
      c("menus", "Menus", "10 Documents"),
      c("offers", "Existing offers", "09 Strategy"),
      c("lead_magnets", "Lead magnets", "03 Creative"),
      c("email_campaigns", "Email campaigns", "02 Advertising"),
      c("landing_pages", "Previous landing pages", "05 Website"),
      c("campaign_reports", "Previous campaign reports", "06 Reports"),
      c("analytics_reports", "Analytics reports", "06 Reports"),
      c("seo_reports", "SEO reports", "06 Reports"),
      c("case_studies", "Existing case studies", "10 Documents"),
      c("testimonials_docs", "Testimonials", "03 Creative"),
    ],
    requiredFor: [],
  },
  {
    key: "social_proof",
    title: "Social proof",
    intro: "Reviews, testimonials and anything that shows customers trust you.",
    categories: [
      c("video_testimonials", "Video testimonials", "04 Video"),
      c("review_screenshots", "Review screenshots", "03 Creative"),
      c("written_testimonials", "Written testimonials", "03 Creative"),
      c("proof_case_studies", "Case studies", "10 Documents"),
      c("before_after", "Before / after results", "03 Creative"),
      c("awards", "Awards", "03 Creative"),
      c("certifications", "Certifications", "10 Documents"),
      c("media_mentions", "Media mentions", "03 Creative"),
      c("press", "Press features", "03 Creative"),
      c("partnerships", "Partnerships", "03 Creative"),
      c("client_logos", "Client logos", "03 Creative"),
    ],
    requiredFor: [],
  },
  {
    key: "business_media",
    title: "Business media library",
    intro: "Anything that helps us understand or market your business can be useful. Even imperfect phone footage.",
    categories: [
      c("factory", "Factory footage", "07 Raw Assets"),
      c("office", "Office footage", "07 Raw Assets"),
      c("team_footage", "Team footage", "07 Raw Assets"),
      c("bts", "Behind the scenes", "07 Raw Assets"),
      c("manufacturing", "Product manufacturing", "07 Raw Assets"),
      c("service_delivery", "Service delivery", "07 Raw Assets"),
      c("customer_interactions", "Customer interactions", "07 Raw Assets"),
      c("events", "Events", "07 Raw Assets"),
      c("projects", "Projects", "07 Raw Assets"),
      c("media_before_after", "Before / after", "07 Raw Assets"),
      c("shipping", "Packing / shipping", "07 Raw Assets"),
      c("installation", "Installation", "07 Raw Assets"),
      c("media_testimonials", "Testimonials", "04 Video"),
      c("founder_videos", "Founder videos", "04 Video"),
      c("reels", "Existing reels", "04 Video"),
      c("phone_footage", "Raw phone footage", "07 Raw Assets"),
    ],
    requiredFor: ["studios"],
    accept: "image/*,video/*",
  },
];

export const ASSET_SECTION_BY_KEY = Object.fromEntries(ASSET_SECTIONS.map((s) => [s.key, s])) as Record<string, AssetSection>;
export const ASSET_CATEGORY_BY_KEY = Object.fromEntries(ASSET_SECTIONS.flatMap((s) => s.categories.map((cat) => [cat.key, { ...cat, section: s.key }]))) as Record<
  string,
  AssetCategory & { section: string }
>;

export const PROOF_LINKS = [
  { key: "google_reviews", label: "Google Reviews URL" },
  { key: "facebook_reviews", label: "Facebook Reviews URL" },
  { key: "trustpilot", label: "Trustpilot URL" },
] as const;

export function linkProvider(url: string): "google_drive" | "dropbox" | "onedrive" | "other" {
  const h = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  if (/(^|\.)drive\.google\.com$|(^|\.)docs\.google\.com$/.test(h)) return "google_drive";
  if (/(^|\.)dropbox\.com$/.test(h)) return "dropbox";
  if (/(^|\.)onedrive\.live\.com$|(^|\.)1drv\.ms$|sharepoint\.com$/.test(h)) return "onedrive";
  return "other";
}

/** Upload limits. Files bigger than the inline limit need cloud storage (Vercel Blob) or a folder link. */
export const MAX_FILE_BYTES = 500 * 1024 * 1024;
export const ALLOWED_EXT = /\.(png|jpe?g|webp|gif|heic|heif|svg|pdf|zip|ai|eps|psd|indd|ttf|otf|woff2?|mp4|mov|m4v|webm|avi|mp3|wav|m4a|docx?|pptx?|key|xlsx?|csv|txt)$/i;
