/**
 * Analytics hooks. Every event is pushed to window.dataLayer (GTM-ready) and,
 * when configured, forwarded to the Meta Pixel and GA4.
 */

/** Madvert Labs Meta Pixel. Override with NEXT_PUBLIC_META_PIXEL_ID; set it to "off" to disable. */
const PIXEL_ENV = process.env.NEXT_PUBLIC_META_PIXEL_ID;
export const META_PIXEL_ID = PIXEL_ENV === "off" ? "" : /^\d{6,20}$/.test(PIXEL_ENV ?? "") ? PIXEL_ENV! : "1410121457947973";

/** Meta's base pixel code (fbevents.js loader + init + PageView). */
export const metaPixelScript = (id: string) =>
  `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`;
export type AnalyticsEvent =
  | "PageView"
  | "HeroCTA"
  | "BookCallCTA"
  | "DiscoveryFormStarted"
  | "DiscoveryFormSubmitted"
  | "application_started"
  | "application_submitted"
  | "application_crm_success"
  | "application_crm_failed"
  | "calendar_viewed"
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
  // Sent only after GoHighLevel confirmed the application was saved.
  application_crm_success: "Lead",
};

/** Events that should only fire once per page session. */
const ONCE: ReadonlySet<AnalyticsEvent> = new Set<AnalyticsEvent>([
  "PageView",
  "PricingViewed",
  "ApplicationStarted",
  "VSL50",
  "CalendarViewed",
  "DiscoveryFormStarted",
  "application_started",
  "calendar_viewed",
]);
const fired = new Set<string>();

/** `eventId` is passed to Meta as eventID so the server-side Conversions API copy is deduplicated. */
export function track(event: AnalyticsEvent, props: Props = {}, opts: { eventId?: string } = {}) {
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
        const extra = opts.eventId ? [{ eventID: opts.eventId }] : [];
        if (std) window.fbq("track", std, props, ...extra);
        else window.fbq("trackCustom", event, props, ...extra);
      }
      if (window.gtag) window.gtag("event", event, props);
    }
    if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, props);
  } catch {
    /* analytics must never break the page */
  }
}
