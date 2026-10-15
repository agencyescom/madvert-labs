import type { Resource, ResourceCategory } from "@/types/content";

/** Display order of the Madvert Vault filter chips. */
export const resourceCategoryOrder: ResourceCategory[] = ["offers", "ads", "leads", "search", "automation", "conversion", "brand"];

export const resourceCategoryLabel: Record<ResourceCategory, string> = {
  offers: "Offers",
  ads: "Ads & Creative",
  leads: "Lead Generation",
  search: "SEO & AI",
  automation: "Automation",
  conversion: "Conversion",
  brand: "Brand",
};

/** Tint used by the CSS fallback cover. */
export const resourceCategoryTint: Record<ResourceCategory, string> = {
  offers: "#00b4ff",
  ads: "#8b7bff",
  leads: "#2dd4bf",
  search: "#34d399",
  automation: "#f5b13d",
  conversion: "#00e5ff",
  brand: "#f472b6",
};

/** Older CMS documents may still carry the previous category keys. */
const legacy: Record<string, ResourceCategory> = {
  acquire: "leads",
  convert: "conversion",
  automate: "automation",
  build: "automation",
  content: "automation",
};

export function categoryOf(r: Pick<Resource, "category">): ResourceCategory {
  const c = r.category as string;
  return (c in resourceCategoryLabel ? c : legacy[c] ?? "conversion") as ResourceCategory;
}
