import type { GuideStep } from "@/onboarding/types";
import { db } from "@/onboarding/server/db";
import { handle, json } from "@/onboarding/server/http";
import { readObject, storageDriver } from "@/onboarding/server/storage";

/** Guide screenshots uploaded by admins. They contain no client data, so they are served to anyone with the guide id. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    const step = await db().get<GuideStep>("guides", decodeURIComponent(id));
    const driver = storageDriver();
    if (!step?.screenshotKey || driver === "unconfigured") return json({ error: "Not found" }, 404);
    const obj = await readObject(step.screenshotKey, driver);
    if (!obj) return json({ error: "Not found" }, 404);
    const ext = step.screenshotKey.split(".").pop()?.toLowerCase();
    const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return new Response(obj.body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" } });
  });
}
