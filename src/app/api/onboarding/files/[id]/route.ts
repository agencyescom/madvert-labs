import type { ClientAsset } from "@/onboarding/types";
import { opsUser, portalActor } from "@/onboarding/server/auth";
import { db } from "@/onboarding/server/db";
import { audit } from "@/onboarding/server/events";
import { handle, json } from "@/onboarding/server/http";
import { forceDownload, readObject, verifySignedFile } from "@/onboarding/server/storage";

/**
 * Private file access. Allowed for: a valid short-lived signed URL (issued only to the owning client,
 * a delegate of that onboarding or the team), the owning client/delegate token header, or a team session.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    const asset = await db().get<ClientAsset>("assets", id);
    if (!asset || asset.kind !== "file" || !asset.storageKey || !asset.storageDriver) return json({ error: "Not found" }, 404);
    const url = new URL(req.url);
    let allowed = verifySignedFile(id, url.searchParams.get("exp"), url.searchParams.get("sig"));
    let actor = "signed-url";
    if (!allowed) {
      const team = await opsUser();
      if (team) {
        allowed = true;
        actor = `team:${team}`;
      }
    }
    if (!allowed && (req.headers.get("x-onboarding-token") || req.headers.get("x-delegate-token"))) {
      const a = await portalActor(req).catch(() => null);
      if (a && a.onboarding.id === asset.onboardingId) {
        allowed = true;
        actor = a.kind;
      }
    }
    if (!allowed) return json({ error: "Not found" }, 404);
    const obj = await readObject(asset.storageKey, asset.storageDriver);
    if (!obj) return json({ error: "Not found" }, 404);
    if (actor.startsWith("team:")) await audit({ onboardingId: asset.onboardingId, actor, action: "file.viewed", target: asset.id });
    const download = url.searchParams.get("download") === "1" || forceDownload(asset.mimeType, asset.name);
    const name = encodeURIComponent(asset.name);
    return new Response(obj.body, {
      headers: {
        "Content-Type": download ? "application/octet-stream" : asset.mimeType || "application/octet-stream",
        ...(obj.size ? { "Content-Length": String(obj.size) } : {}),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${name}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox; default-src 'none'; img-src 'self'; media-src 'self'",
        "X-Robots-Tag": "noindex",
      },
    });
  });
}
