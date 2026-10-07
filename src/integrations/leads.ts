import { after } from "next/server";
import { dispatchLead } from "./webhooks";
import { sendGa4, sendMetaCapi } from "./conversions";
import { emailShell, esc, sendEmail } from "./email";
import { clientIp } from "./rate-limit";
import type { LeadPayload } from "./types";

export function requestContext(req: Request): LeadPayload["request"] {
  const cookies = Object.fromEntries(
    (req.headers.get("cookie") ?? "")
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]),
  );
  const ga = cookies["_ga"]?.split(".").slice(-2).join(".");
  return {
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") ?? undefined,
    pageUrl: req.headers.get("referer") ?? undefined,
    fbp: cookies["_fbp"],
    fbc: cookies["_fbc"],
    gaClientId: ga || undefined,
  };
}

const conversionName: Record<LeadPayload["kind"], { meta: "Lead" | "Schedule" | "CompleteRegistration"; ga: string }> = {
  growth_brief: { meta: "Lead", ga: "contact_form_complete" },
  challenge: { meta: "Lead", ga: "challenge_form_complete" },
  resource: { meta: "CompleteRegistration", ga: "resource_download" },
  booking: { meta: "Schedule", ga: "calendar_booking_complete" },
};

/**
 * Everything that happens after a valid lead: CRM and automation webhooks, internal notification,
 * server side conversions. Runs after the response is sent so the visitor never waits on third parties.
 */
export function processLead(lead: LeadPayload) {
  after(async () => {
    const conv = conversionName[lead.kind];
    const tasks: Promise<unknown>[] = [dispatchLead(lead), sendMetaCapi(lead, conv.meta), sendGa4(lead, conv.ga)];
    const notify = process.env.LEAD_NOTIFICATION_EMAIL;
    if (notify) {
      const rows = Object.entries({ ...lead.contact, ...lead.answers, service: lead.service, intent: lead.intent, resource: lead.resource?.slug, attachment: lead.attachmentUrl, booking: lead.booking?.start })
        .filter(([, v]) => v)
        .map(([k, v]) => `<p style="margin:0 0 10px"><strong style="color:#fff">${esc(k)}</strong><br>${esc(String(v))}</p>`)
        .join("");
      const src = `<p style="margin-top:20px;font-size:12px">Source: ${esc(lead.attribution.utm_source ?? "direct")} / ${esc(lead.attribution.utm_medium ?? "")} / ${esc(lead.attribution.utm_campaign ?? "")} · Landing: ${esc(lead.attribution.landing_page ?? "")}</p>`;
      tasks.push(sendEmail({ to: notify, subject: `New ${lead.kind.replace("_", " ")}: ${lead.contact.name ?? lead.contact.email}`, html: emailShell("New website lead", rows + src), replyTo: lead.contact.email }));
    }
    const results = await Promise.allSettled(tasks);
    results.forEach((r) => r.status === "rejected" && console.error("[leads] post processing failed:", r.reason));
  });
}
