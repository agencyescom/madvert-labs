import type { Onboarding } from "@/onboarding/types";
import { safeEqual } from "@/onboarding/server/crypto";
import { db } from "@/onboarding/server/db";
import { body, handle, json } from "@/onboarding/server/http";
import { afterChange, loadContext, recordBooking } from "@/onboarding/server/repo";

/**
 * Booking webhook from the Madvert calendar (GoHighLevel / LeadConnector workflow → "Webhook" action).
 * Configure the workflow trigger "Appointment booked" for the kickoff calendar and POST to
 * /api/onboarding/webhooks/booking with header `x-webhook-secret: <ONBOARDING_BOOKING_WEBHOOK_SECRET>`.
 * Matches the onboarding by the contact's email. Accepts GHL's default payload or a flat one.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const secret = process.env.ONBOARDING_BOOKING_WEBHOOK_SECRET;
    if (!secret) return json({ error: "Booking webhook is not configured.", configurationRequired: true }, 503);
    if (!safeEqual(req.headers.get("x-webhook-secret") ?? "", secret)) return json({ error: "Unauthorized" }, 401);
    const b = await body<Record<string, unknown>>(req);
    const cal = (b.calendar ?? {}) as Record<string, unknown>;
    const email = String(b.email ?? b.contact_email ?? (b.contact as Record<string, unknown> | undefined)?.email ?? "").toLowerCase().trim();
    if (!email) return json({ error: "email missing" }, 400);
    const startsAt = String(cal.startTime ?? b.startTime ?? b.start_time ?? b.starts_at ?? "");
    const timezone = String(cal.selectedTimezone ?? b.timezone ?? b.selectedTimezone ?? "");
    const meetingUrl = String(cal.address ?? b.meeting_url ?? b.meetingLocation ?? "");
    const all = await db().find<Onboarding>("onboardings");
    const match = all
      .filter((o) => o.contact.email === email && o.status !== "revoked")
      .sort((a, b2) => b2.createdAt.localeCompare(a.createdAt))[0];
    if (!match) return json({ ok: true, matched: false });
    const ctx = await loadContext(match.id);
    if (!ctx) return json({ ok: true, matched: false });
    await recordBooking(ctx, { startsAt, timezone, meetingUrl: /^https:\/\//.test(meetingUrl) ? meetingUrl : undefined, source: "webhook" });
    await afterChange(match.id, { client: false });
    return json({ ok: true, matched: true });
  });
}
