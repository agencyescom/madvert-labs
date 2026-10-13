import { getAttribution } from "@/lib/attribution";

export type HookEvent = "calendar_opened" | "calendar_booked";

/**
 * Server side hooks for CRM / automation (webhooks configured on the server).
 * Sent with sendBeacon so navigation never waits on it. Lead magnet context is attached when present.
 */
export function notifyEvent(event: HookEvent, data: Record<string, string | undefined> = {}) {
  if (typeof window === "undefined") return;
  try {
    const leadMagnet = document.querySelector<HTMLElement>("[data-lead-magnet]")?.dataset.leadMagnet;
    const body = JSON.stringify({ event, leadMagnet, page: window.location.pathname, attribution: getAttribution(), ...data });
    if (!navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/events", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  } catch {}
}
