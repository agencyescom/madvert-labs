import { getAttribution } from "./attribution";

/**
 * Posts a lead to the configured endpoint and only resolves when the server confirms it was
 * delivered to at least one destination (CRM / webhook). Throws an actionable message otherwise,
 * so the UI never shows a success state for a lead that wasn't saved.
 *
 * Production (static export under /custom-patches): the main site's /api/custom-patches/leads.
 * Local server build: this project's /api/apply.
 */
export type LeadForm = "application" | "discovery";
export type SubmitResult = { ok: true; qualified?: boolean };

const ENDPOINT = process.env.NEXT_PUBLIC_LEADS_ENDPOINT || "/api/apply";

export async function submitLead(form: LeadForm, answers: object, meta: { startedAt: number; honeypot: string }): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        form,
        answers,
        attribution: getAttribution(),
        page_url: typeof window !== "undefined" ? window.location.href : undefined,
        startedAt: meta.startedAt,
        website_confirm: meta.honeypot,
      }),
    });
  } catch {
    throw new Error("We couldn't reach our server. Check your connection and try again.");
  }
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; qualified?: boolean; error?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `We couldn't save your details (error ${res.status}). Please try again in a moment.`);
  }
  return { ok: true, qualified: data.qualified };
}
