import type { LeadPayload } from "./types";

const TIMEOUT_MS = 6000;

async function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  } finally {
    clearTimeout(t);
  }
}

/** Flat shape most automation tools (GoHighLevel, Zapier, Make, n8n) map easily. */
export function flatten(lead: LeadPayload) {
  return {
    event: `madvert.${lead.kind}`,
    event_id: lead.eventId,
    submitted_at: lead.submittedAt,
    name: lead.contact.name,
    first_name: lead.contact.name?.split(" ")[0],
    email: lead.contact.email,
    phone: lead.contact.phone,
    company_name: lead.contact.business,
    website: lead.contact.website,
    service: lead.service,
    intent: lead.intent,
    resource: lead.resource?.slug,
    booking_start: lead.booking?.start,
    booking_timezone: lead.booking?.timezone,
    booking_link: lead.booking?.eventLink,
    attachment_url: lead.attachmentUrl,
    ...Object.fromEntries(Object.entries(lead.answers).map(([k, v]) => [`answer_${k}`, v])),
    ...lead.attribution,
    tags: ["website", lead.kind, lead.service, lead.intent].filter(Boolean),
  };
}

function hubspot(lead: LeadPayload) {
  const portal = process.env.HUBSPOT_PORTAL_ID;
  const form = process.env.HUBSPOT_FORM_ID;
  if (!portal || !form) return null;
  const [firstname, ...rest] = (lead.contact.name ?? "").split(" ");
  const message = Object.entries(lead.answers)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const fields = [
    { name: "email", value: lead.contact.email },
    { name: "firstname", value: firstname },
    { name: "lastname", value: rest.join(" ") },
    { name: "phone", value: lead.contact.phone },
    { name: "company", value: lead.contact.business },
    { name: "website", value: lead.contact.website },
    { name: "message", value: message },
    { name: "utm_source", value: lead.attribution.utm_source },
    { name: "utm_medium", value: lead.attribution.utm_medium },
    { name: "utm_campaign", value: lead.attribution.utm_campaign },
  ].filter((f) => f.value);
  return post(`https://api.hsforms.com/submissions/v3/integration/submit/${portal}/${form}`, {
    fields,
    context: { pageUri: lead.request.pageUrl, pageName: `Madvert ${lead.kind}` },
  });
}

function slack(lead: LeadPayload) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return null;
  const lines = [
    `*New ${lead.kind.replace("_", " ")}* from ${lead.contact.name ?? lead.contact.email}`,
    `${lead.contact.email}${lead.contact.phone ? ` · ${lead.contact.phone}` : ""}${lead.contact.business ? ` · ${lead.contact.business}` : ""}`,
    lead.booking ? `Booked: ${lead.booking.start} (${lead.booking.timezone})` : "",
    lead.resource ? `Resource: ${lead.resource.title ?? lead.resource.slug}` : "",
    ...Object.entries(lead.answers)
      .filter(([, v]) => v)
      .map(([k, v]) => `• *${k}*: ${String(v).slice(0, 400)}`),
    `Source: ${lead.attribution.utm_source ?? "direct"} / ${lead.attribution.utm_medium ?? "none"} / ${lead.attribution.utm_campaign ?? ""}`,
  ].filter(Boolean);
  return post(url, { text: lines.join("\n") });
}

/** Fan a lead out to every configured destination. Failures are logged and never block the visitor. */
export async function dispatchLead(lead: LeadPayload) {
  const flat = flatten(lead);
  const hooks = [
    process.env.GOHIGHLEVEL_WEBHOOK_URL,
    process.env.ZAPIER_WEBHOOK_URL,
    process.env.MAKE_WEBHOOK_URL,
    process.env.N8N_WEBHOOK_URL,
    process.env.GENERIC_WEBHOOK_URL,
  ].filter(Boolean) as string[];
  const jobs = [...hooks.map((u) => post(u, flat)), hubspot(lead), slack(lead)].filter(Boolean) as Promise<void>[];
  const results = await Promise.allSettled(jobs);
  results.forEach((r) => r.status === "rejected" && console.error("[leads] destination failed:", r.reason));
  return { delivered: results.filter((r) => r.status === "fulfilled").length, attempted: results.length };
}
