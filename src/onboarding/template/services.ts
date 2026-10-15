import type { ServiceKey } from "../types";

/** Engagement services. The signed engagement decides which onboarding items are requested. */
export const SERVICES: Record<ServiceKey, { label: string; team: string }> = {
  meta_ads: { label: "Paid Media · Meta Ads", team: "Paid Media" },
  google_ads: { label: "Paid Media · Google Ads", team: "Paid Media" },
  seo: { label: "SEO & AI Search", team: "Organic Growth" },
  website: { label: "Website & Conversion", team: "Conversion" },
  branding: { label: "Branding & Marketing", team: "Brand" },
  studios: { label: "Madvert Studios · Content & Video", team: "Studios" },
  crm_automation: { label: "CRM & Automation", team: "CRM Automation" },
  development: { label: "Tech & Product Development", team: "Development" },
  strategy: { label: "Growth Strategy", team: "Growth" },
};

export const SERVICE_KEYS = Object.keys(SERVICES) as ServiceKey[];

/** The full stack engagement. */
export const FULL_STACK: ServiceKey[] = SERVICE_KEYS;

export function teamLine(services: ServiceKey[]) {
  const teams = [...new Set(services.map((s) => SERVICES[s]?.team).filter(Boolean))];
  return teams.join(" + ");
}

export function estimateMinutes(services: ServiceKey[]): [number, number] {
  const n = services.length;
  if (n <= 1) return [15, 25];
  if (n <= 3) return [20, 35];
  return [30, 45];
}
