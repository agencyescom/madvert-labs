import { NextResponse } from "next/server";
import { z } from "zod";
import { bookingSchema } from "@/forms/schemas";
import { calendarConfig, createBooking, isSlotFree } from "@/integrations/google-calendar";
import { emailShell, esc, sendEmail } from "@/integrations/email";
import { processLead, requestContext } from "@/integrations/leads";
import { clientIp, rateLimit } from "@/integrations/rate-limit";
import { spamCheck } from "@/integrations/spam";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = await rateLimit(`book:${ip}`, 5, 900);
  if (!limit.ok) return NextResponse.json({ ok: false, error: "Too many attempts. Please try again shortly." }, { status: 429 });

  const cfg = calendarConfig();
  if (!cfg.ok) return NextResponse.json({ ok: false, error: "Online booking is not available yet." }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fields: z.flattenError(parsed.error).fieldErrors }, { status: 422 });
  }
  const d = parsed.data;
  const spam = await spamCheck(d, ip);
  if (spam) return NextResponse.json({ ok: false, error: "We could not verify this request. Please try again." }, { status: 400 });

  try {
    if (!(await isSlotFree(cfg.config, d.start))) {
      return NextResponse.json({ ok: false, error: "That time was just taken. Please choose another slot.", code: "slot_taken" }, { status: 409 });
    }
    const description = [
      `Business strategy call booked through madvertlabs.com`,
      ``,
      `Name: ${d.name}`,
      `Email: ${d.email}`,
      `Phone / WhatsApp: ${d.phone}`,
      `Business: ${d.business}`,
      d.website ? `Website: ${d.website}` : "",
      `Market: ${d.market}`,
      ``,
      `Primary problem:`,
      d.problem,
      d.notes ? `\nNotes:\n${d.notes}` : "",
      ``,
      `Visitor time zone: ${d.timezone}`,
      d.attribution.utm_source ? `Source: ${d.attribution.utm_source} / ${d.attribution.utm_medium ?? ""} / ${d.attribution.utm_campaign ?? ""}` : "",
    ]
      .filter((l) => l !== "")
      .join("\n");

    const booking = await createBooking(cfg.config, {
      start: d.start,
      attendee: { name: d.name, email: d.email },
      description,
      requestId: d.eventId,
    });

    const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: d.timezone }).format(new Date(booking.start));
    await sendEmail({
      to: d.email,
      subject: "Your Madvert Labs strategy call is booked",
      html: emailShell(
        "Your strategy call is booked",
        `<p>Hi ${esc(d.name.split(" ")[0])},</p><p>Thanks for booking a business strategy call with ${esc(cfg.config.ownerName)}.</p><p><strong style="color:#fff">${esc(when)}</strong><br>(${esc(d.timezone)})</p>${
          booking.meetLink ? `<p>Join on Google Meet: <a style="color:#3fd4ff" href="${esc(booking.meetLink)}">${esc(booking.meetLink)}</a></p>` : ""
        }<p>A calendar invitation is on its way. Bring the real numbers. We will bring the questions.</p>`,
      ),
    }).catch(() => false);

    processLead({
      kind: "booking",
      eventId: d.eventId,
      submittedAt: new Date().toISOString(),
      contact: { name: d.name, email: d.email, phone: d.phone, business: d.business, website: d.website },
      answers: { problem: d.problem, market: d.market, notes: d.notes },
      booking: { start: booking.start, end: booking.end, timezone: d.timezone, meetLink: booking.meetLink },
      attribution: d.attribution,
      request: requestContext(req),
    });

    // Only what the visitor needs: never the owner's calendar links.
    return NextResponse.json({ ok: true, start: booking.start, end: booking.end, meetLink: booking.meetLink });
  } catch (err) {
    console.error("[calendar] booking failed", err);
    return NextResponse.json({ ok: false, error: "We could not complete the booking. Please try again or send us a growth brief." }, { status: 502 });
  }
}
