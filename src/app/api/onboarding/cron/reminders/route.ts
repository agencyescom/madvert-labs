import { safeEqual } from "@/onboarding/server/crypto";
import { handle, json } from "@/onboarding/server/http";
import { runReminders } from "@/onboarding/server/reminders";

/** Daily cron (vercel.json). Vercel sends `Authorization: Bearer <CRON_SECRET>`. */
export async function GET(req: Request) {
  return handle(async () => {
    const secret = process.env.CRON_SECRET;
    if (!secret) return json({ error: "CRON_SECRET is not configured.", configurationRequired: true }, 503);
    if (!safeEqual(req.headers.get("authorization") ?? "", `Bearer ${secret}`)) return json({ error: "Unauthorized" }, 401);
    return json(await runReminders());
  });
}
