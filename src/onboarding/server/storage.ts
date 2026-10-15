import "server-only";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { sign, safeEqual } from "./crypto";

/**
 * Private file storage for onboarding uploads.
 *
 * - `vercel-blob` (BLOB_READ_WRITE_TOKEN set): files are uploaded straight from the browser to a
 *   PRIVATE Vercel Blob store (no 4.5 MB function body limit) and read back server side only.
 * - `local` (development): files are written under ONBOARDING_DATA_DIR/uploads.
 *
 * Files are never served from a public URL. Every download goes through /api/onboarding/files/:id,
 * which checks the caller (client token, delegate token or team session) or a short-lived signed URL.
 */

export type StorageDriver = "local" | "vercel-blob" | "unconfigured";

export function storageDriver(): StorageDriver {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob";
  return process.env.VERCEL ? "unconfigured" : "local";
}

const root = () => path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.ONBOARDING_DATA_DIR ?? ".data", "uploads");

export function safeName(name: string) {
  const base = name.normalize("NFKD").replace(/[^\w.\- ]+/g, "").replace(/\s+/g, "-").slice(-120);
  return base.replace(/^\.+/, "") || "file";
}

/** Storage keys live under onboarding/{onboardingId}/{folder}/... so one client's files never share a prefix with another's. */
export const keyPrefix = (onboardingId: string) => `onboarding/${onboardingId}/`;

export async function putLocal(key: string, data: Buffer) {
  const file = path.join(root(), key);
  if (!file.startsWith(root() + path.sep)) throw new Error("Invalid key");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data, { mode: 0o600 });
}

export async function readObject(key: string, driver: "local" | "vercel-blob"): Promise<{ body: ReadableStream; size?: number } | null> {
  if (driver === "local") {
    const file = path.join(root(), key);
    if (!file.startsWith(root() + path.sep)) return null;
    try {
      const st = await fs.stat(file);
      return { body: Readable.toWeb(createReadStream(file)) as unknown as ReadableStream, size: st.size };
    } catch {
      return null;
    }
  }
  const { get } = await import("@vercel/blob");
  const res = await get(key, { access: "private" });
  if (!res || !res.stream) return null;
  return { body: res.stream as ReadableStream, size: res.blob?.size ?? undefined };
}

export async function deleteObject(key: string, driver: "local" | "vercel-blob") {
  try {
    if (driver === "local") await fs.rm(path.join(root(), key), { force: true });
    else {
      const { del } = await import("@vercel/blob");
      await del(key);
    }
  } catch (e) {
    console.error("[storage] delete failed", e);
  }
}

export async function headObject(key: string): Promise<{ size: number; contentType: string } | null> {
  try {
    const { head } = await import("@vercel/blob");
    const h = await head(key);
    return { size: h.size, contentType: h.contentType };
  } catch {
    return null;
  }
}

/* ───────── Signed URLs ───────── */

/** Short-lived URL for one file (used in admin views and PDFs). No secret value is in the URL, only an expiry and HMAC. */
export function signedFileUrl(assetId: string, ttlSec = 600) {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  return `/api/onboarding/files/${assetId}?exp=${exp}&sig=${sign(`file:${assetId}:${exp}`)}`;
}

export function verifySignedFile(assetId: string, exp: string | null, sig: string | null) {
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, sign(`file:${assetId}:${exp}`));
}

/** Content types that must never render inline (script capable). */
export const forceDownload = (mime = "", name = "") => /svg|html|xml|javascript/i.test(mime) || /\.(svg|html?|xml|js)$/i.test(name);
