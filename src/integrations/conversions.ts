import { createHash } from "node:crypto";
import type { LeadPayload } from "./types";

const sha = (v?: string) => (v ? createHash("sha256").update(v.trim().toLowerCase()).digest("hex") : undefined);

/** Meta Conversions API. Deduplicated with the browser Pixel via the shared event id. */
export async function sendMetaCapi(lead: LeadPayload, eventName: "Lead" | "Schedule" | "CompleteRegistration") {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixel || !token) return;
  const phone = lead.contact.phone?.replace(/[^\d]/g, "");
  const [fn, ...ln] = (lead.contact.name ?? "").split(" ");
  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: lead.eventId,
        action_source: "website",
        event_source_url: lead.request.pageUrl,
        user_data: {
          em: [sha(lead.contact.email)],
          ph: phone ? [sha(phone)] : undefined,
          fn: fn ? [sha(fn)] : undefined,
          ln: ln.length ? [sha(ln.join(" "))] : undefined,
          client_ip_address: lead.request.ip,
          client_user_agent: lead.request.userAgent,
          fbp: lead.request.fbp,
          fbc: lead.request.fbc,
        },
        custom_data: { lead_type: lead.kind, service: lead.service, content_name: lead.resource?.slug },
      },
    ],
    test_event_code: process.env.META_CAPI_TEST_EVENT_CODE || undefined,
  };
  const res = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) console.error("[capi] failed", res.status, await res.text().catch(() => ""));
}

/** GA4 Measurement Protocol: server side copy of the conversion so ad blockers do not hide it. */
export async function sendGa4(lead: LeadPayload, name: string) {
  const id = process.env.NEXT_PUBLIC_GA4_ID;
  const secret = process.env.GA4_API_SECRET;
  if (!id || !secret) return;
  const res = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${id}&api_secret=${secret}`, {
    method: "POST",
    body: JSON.stringify({
      client_id: lead.request.gaClientId ?? lead.eventId,
      events: [
        {
          name,
          params: {
            lead_type: lead.kind,
            service: lead.service,
            resource: lead.resource?.slug,
            source: lead.attribution.utm_source,
            medium: lead.attribution.utm_medium,
            campaign: lead.attribution.utm_campaign,
          },
        },
      ],
    }),
    cache: "no-store",
  });
  if (!res.ok) console.error("[ga4-mp] failed", res.status);
}
