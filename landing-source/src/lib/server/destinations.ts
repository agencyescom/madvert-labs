import "server-only";

/**
 * Application delivery adapters. Each adapter is enabled purely by environment
 * variables, so connecting GoHighLevel, HubSpot, Zapier, Make or a custom API
 * requires no code changes. Add a new adapter by appending to `ADAPTERS`.
 */
export type ApplicationRecord = {
  id: string;
  /** "application" (full partnership application) or "discovery" (short form before booking) */
  form: "application" | "discovery";
  submitted_at: string;
  name: string;
  company: string;
  website: string;
  email: string;
  phone: string;
  country: string;
  /** Every answer from the form, keyed by field name */
  answers: Record<string, string | string[] | number | boolean>;
  qualification_score?: number;
  qualified?: boolean;
  qualification_flags?: string[];
  attribution: Record<string, unknown>;
  page_url?: string;
  user_agent?: string;
};

type Adapter = {
  name: string;
  enabled: () => boolean;
  send: (r: ApplicationRecord) => Promise<void>;
};

async function postJSON(url: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
}

const ADAPTERS: Adapter[] = [
  {
    name: "webhook",
    enabled: () => !!process.env.APPLICATION_WEBHOOK_URL,
    send: (r) =>
      postJSON(
        process.env.APPLICATION_WEBHOOK_URL!,
        r,
        process.env.APPLICATION_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.APPLICATION_WEBHOOK_SECRET } : {},
      ),
  },
  {
    name: "gohighlevel",
    enabled: () => !!process.env.GHL_WEBHOOK_URL,
    // GHL inbound webhooks accept flat JSON; arrays are joined for easy field mapping.
    send: (r) =>
      postJSON(process.env.GHL_WEBHOOK_URL!, {
        ...r,
        answers: undefined,
        ...Object.fromEntries(Object.entries(r.answers).map(([k, v]) => [`answer_${k}`, Array.isArray(v) ? v.join(", ") : v])),
        first_name: r.name.split(" ")[0],
        last_name: r.name.split(" ").slice(1).join(" "),
        qualification_flags: r.qualification_flags?.join(", "),
        ...Object.fromEntries(Object.entries(r.attribution).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : v])),
        tags: ["custom-patches", `custom-patches-${r.form}`, ...(r.form === "application" ? [r.qualified ? "app-qualified" : "app-review"] : [])],
      }),
  },
  {
    name: "hubspot",
    enabled: () => !!(process.env.HUBSPOT_PORTAL_ID && process.env.HUBSPOT_FORM_GUID),
    send: (r) =>
      postJSON(
        `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FORM_GUID}`,
        {
          fields: [
            { name: "firstname", value: r.name.split(" ")[0] },
            { name: "lastname", value: r.name.split(" ").slice(1).join(" ") },
            { name: "email", value: r.email },
            { name: "phone", value: r.phone },
            { name: "company", value: r.company },
            { name: "website", value: r.website },
            { name: "message", value: JSON.stringify({ ...r, attribution: undefined }) },
          ],
          context: { pageName: "Patch Capacity Partnership" },
        },
      ),
  },
];

export async function deliverApplication(record: ApplicationRecord) {
  const active = ADAPTERS.filter((a) => a.enabled());
  if (active.length === 0) {
    console.error("[apply] No delivery destination configured — the lead was NOT saved.", { id: record.id, form: record.form });
    return { delivered: [] as string[], failed: [] as string[], configured: 0 };
  }
  const results = await Promise.allSettled(active.map((a) => a.send(record)));
  const delivered: string[] = [];
  const failed: string[] = [];
  results.forEach((res, i) => {
    if (res.status === "fulfilled") delivered.push(active[i].name);
    else {
      failed.push(active[i].name);
      console.error(`[apply] ${active[i].name} delivery failed:`, res.reason);
    }
  });
  return { delivered, failed, configured: active.length };
}
