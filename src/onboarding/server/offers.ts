import "server-only";
import type { OfferInput } from "../offer/generate";
import type { OfferShare } from "../types";
import { newId } from "./crypto";
import { db } from "./db";

const STR_KEYS = ["business", "offerName", "product", "audience", "outcome", "problem", "timeframe", "price", "coreValue", "uniqueness", "proof", "guarantee", "speed", "effort", "scarcity"] as const;

/** Keeps only known fields with sane lengths. Shared offers are public, so nothing else is stored. */
export function sanitizeOfferInput(raw: unknown): OfferInput {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const s = (v: unknown, n = 400) => (typeof v === "string" ? v.slice(0, n) : "");
  const out: Record<string, unknown> = {};
  for (const k of STR_KEYS) out[k] = s(r[k], k === "proof" ? 800 : 400);
  out.bonuses = (Array.isArray(r.bonuses) ? r.bonuses : [])
    .slice(0, 8)
    .map((b) => ({ name: s((b as Record<string, unknown>)?.name, 120), value: s((b as Record<string, unknown>)?.value, 40), description: s((b as Record<string, unknown>)?.description, 240) }))
    .filter((b) => b.name);
  out.objections = (Array.isArray(r.objections) ? r.objections : []).slice(0, 5).map((o) => s(o, 200)).filter(Boolean);
  return out as unknown as OfferInput;
}

export function shareBase(req: Request) {
  return (process.env.ONBOARDING_BASE_URL ?? (process.env.ONBOARDING_HOST ? `https://${process.env.ONBOARDING_HOST}` : undefined) ?? new URL(req.url).origin).replace(/\/$/, "");
}

export async function createOfferShare(input: OfferInput, source: OfferShare["source"], onboardingId?: string) {
  const id = newId().replace(/[^A-Za-z0-9]/g, "").slice(0, 10) + newId().replace(/[^A-Za-z0-9]/g, "").slice(0, 4);
  const rec: OfferShare = { id, source, onboardingId, input: input as unknown as Record<string, unknown>, createdAt: new Date().toISOString(), views: 0 };
  await db().put("offer_shares", rec);
  return rec;
}
