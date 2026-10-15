import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Tokens, signatures and the credential vault.
 *
 * ONBOARDING_SECRET         signs admin sessions and short-lived file URLs (required in production).
 * ONBOARDING_ENCRYPTION_KEY 32 bytes, base64 or hex. Enables the secure credential vault (AES-256-GCM).
 */

export const newId = (prefix = "") => `${prefix}${randomBytes(9).toString("base64url")}`;

/** 256-bit random bearer token for client and delegated links. Only its hash is stored. */
export const newToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

let warned = false;
function secret(): string {
  const s = process.env.ONBOARDING_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production" && process.env.ONBOARDING_ALLOW_DEV_SECRET !== "true") {
    throw new Error("ONBOARDING_SECRET (32+ characters) is required in production.");
  }
  if (!warned) {
    warned = true;
    console.warn("[onboarding] ONBOARDING_SECRET is not set; using an insecure development secret.");
  }
  return "madvert-dev-only-secret-do-not-use-in-production";
}

export const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** value.signature, verified in constant time. */
export const seal = (value: string) => `${Buffer.from(value).toString("base64url")}.${sign(value)}`;
export function unseal(sealed: string | undefined | null): string | null {
  if (!sealed) return null;
  const [b, sig] = sealed.split(".");
  if (!b || !sig) return null;
  const value = Buffer.from(b, "base64url").toString();
  return safeEqual(sig, sign(value)) ? value : null;
}

/* ───────── Vault ───────── */

function vaultKey(): Buffer | null {
  const raw = process.env.ONBOARDING_ENCRYPTION_KEY;
  if (!raw) return null;
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  return key.length === 32 ? key : null;
}

export const vaultConfigured = () => vaultKey() !== null;

export function encrypt(plain: string): string {
  const key = vaultKey();
  if (!key) throw new Error("Credential vault is not configured (ONBOARDING_ENCRYPTION_KEY).");
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), body]).toString("base64");
}

export function decrypt(cipher: string): string {
  const key = vaultKey();
  if (!key) throw new Error("Credential vault is not configured (ONBOARDING_ENCRYPTION_KEY).");
  const buf = Buffer.from(cipher, "base64");
  const d = createDecipheriv("aes-256-gcm", key, buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}

/* ───────── Link tokens at rest ─────────
 * Client links are looked up by hash. A copy is also kept encrypted (key derived from ONBOARDING_SECRET)
 * so the team can copy the link again and reminders can include it. Rotating ONBOARDING_SECRET makes
 * old copies unreadable; regenerate links in that case.
 */
function linkKey() {
  return Buffer.from(hkdfSync("sha256", secret(), "madvert-onboarding", "link-token", 32));
}

export function sealToken(token: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", linkKey(), iv);
  const body = Buffer.concat([c.update(token, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), body]).toString("base64url");
}

export function openToken(sealed?: string) {
  if (!sealed) return null;
  try {
    const buf = Buffer.from(sealed, "base64url");
    const d = createDecipheriv("aes-256-gcm", linkKey(), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}
