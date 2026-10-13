/**
 * Analytics hooks. Every event is pushed to window.dataLayer (GTM-ready) and,
 * when the matching env ID is configured, forwarded to the Meta Pixel and GA4.
 * No IDs are hard-coded — see .env.example.
 */
export type AnalyticsEvent =
  | "PageView"
  | "HeroCTA"
  | "BookCallCTA"
  | "DiscoveryFormStarted"
  | "DiscoveryFormSubmitted"
  | "VSLPlay"
  | "VSL50"
  | "PricingViewed"
  | "ApplicationStarted"
  | "ApplicationStep1"
  | "ApplicationStep2"
  | "ApplicationStep3"
  | "ApplicationStep4"
  | "ApplicationStep5"
  | "ApplicationSubmitted"
  | "QualifiedApplication"
  | "CalendarViewed"
  | "MeetingBooked";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Meta standard events where one fits; everything else is sent as a custom event. */
const META_STANDARD: Partial<Record<AnalyticsEvent, string>> = {
  ApplicationSubmitted: "SubmitApplication",
  QualifiedApplication: "Lead",
  MeetingBooked: "Schedule",
};

/** Events that should only fire once per page session. */
const ONCE: ReadonlySet<AnalyticsEvent> = new Set<AnalyticsEvent>([
  "PageView",
  "PricingViewed",
  "ApplicationStarted",
  "VSL50",
  "CalendarViewed",
  "DiscoveryFormStarted",
]);
const fired = new Set<string>();

export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  if (ONCE.has(event)) {
    if (fired.has(event)) return;
    fired.add(event);
  }
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: `ml_${event}`, ...props });

    // PageView for the pixel/GA is handled by their own init snippets.
    if (event !== "PageView") {
      if (window.fbq) {
        const std = META_STANDARD[event];
        if (std) window.fbq("track", std, props);
        else window.fbq("trackCustom", event, props);
      }
      if (window.gtag) window.gtag("event", event, props);
    }
    if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, props);
  } catch {
    /* analytics must never break the page */
  }
}
