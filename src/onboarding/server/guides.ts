import "server-only";
import type { GuideStep } from "../types";
import { DEFAULT_GUIDES } from "../guides/defaults";
import { db } from "./db";
import type { PublicIntegrations } from "./settings";

/** Default guides with admin edits (and added steps) applied. Steps an admin removed are stored with `instruction: "__removed__"`. */
export async function getGuides(): Promise<GuideStep[]> {
  const saved = await db().find<GuideStep>("guides");
  const byId = new Map(DEFAULT_GUIDES.map((g) => [g.id, g]));
  for (const s of saved) byId.set(s.id, { ...byId.get(s.id), ...s });
  return [...byId.values()].filter((g) => g.instruction !== "__removed__").sort((a, b) => a.platform.localeCompare(b.platform) || a.stepNumber - b.stepNumber);
}

const PLACEHOLDER = "[configured in Settings]";

export function fillPlaceholders(text: string, i: PublicIntegrations) {
  const map: Record<string, string> = {
    metaPartnerId: i.metaPartnerId,
    googleAccessEmail: i.googleAccessEmail,
    googleAdsManagerId: i.googleAdsManagerId,
    websiteAccessEmail: i.websiteAccessEmail,
    dnsAccessEmail: i.dnsAccessEmail,
    crmAccessEmail: i.crmAccessEmail,
  };
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => map[k] || (k === "googleAdsManagerId" ? "Madvert Labs" : PLACEHOLDER));
}

export function resolveGuides(guides: GuideStep[], i: PublicIntegrations) {
  return guides.map((g) => ({
    ...g,
    title: fillPlaceholders(g.title, i),
    instruction: fillPlaceholders(g.instruction, i),
    illustration: g.illustration ? (JSON.parse(fillPlaceholders(JSON.stringify(g.illustration), i)) as GuideStep["illustration"]) : undefined,
    screenshotUrl: g.screenshotKey ? `/api/onboarding/guide-image/${encodeURIComponent(g.id)}?v=${encodeURIComponent(g.updatedAt ?? "")}` : undefined,
    screenshotKey: undefined,
  }));
}
export type ResolvedGuide = ReturnType<typeof resolveGuides>[number];
