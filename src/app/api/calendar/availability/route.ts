import { NextResponse } from "next/server";
import { connection } from "next/server";
import { availableSlots, calendarConfig } from "@/integrations/google-calendar";
import { clientIp, rateLimit } from "@/integrations/rate-limit";

export async function GET(req: Request) {
  await connection();
  const limit = await rateLimit(`avail:${clientIp(req)}`, 60, 600);
  if (!limit.ok) return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });

  const cfg = calendarConfig();
  if (!cfg.ok) {
    if (process.env.NODE_ENV !== "production") console.warn("[calendar] not configured:", cfg.missing.join(", "));
    return NextResponse.json({ ok: true, configured: false, slots: [] }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const slots = await availableSlots(cfg.config);
    return NextResponse.json(
      { ok: true, configured: true, slots, meetingMinutes: cfg.config.meetingMinutes, hostTimezone: cfg.config.timezone },
      { headers: { "Cache-Control": "private, max-age=30" } },
    );
  } catch (err) {
    console.error("[calendar] availability failed", err);
    return NextResponse.json({ ok: false, configured: true, error: "Availability is temporarily unavailable.", slots: [] }, { status: 503 });
  }
}
