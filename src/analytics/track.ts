import type { AnalyticsEvent } from "./events";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    __madvertReady?: boolean;
  }
}

/** Fan out one event to every analytics destination that is loaded. Never throws. */
export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...clean });
    window.gtag?.("event", event, clean);
    window.fbq?.("trackCustom", event, clean);
    window.clarity?.("event", event);
    if (process.env.NODE_ENV === "development") console.debug("[track]", event, clean);
  } catch {
    /* analytics must never break the page */
  }
}

/** Standard conversion events with deduplication ids shared with the server (Meta CAPI). */
export function trackConversion(kind: "Lead" | "Schedule", eventId: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", kind, params, { eventID: eventId });
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const label =
      kind === "Lead" ? process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL : process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL;
    if (adsId && label) window.gtag?.("event", "conversion", { send_to: `${adsId}/${label}`, transaction_id: eventId });
  } catch {}
}

/** Google Ads enhanced conversions: hand hashed-on-Google's-side user data to gtag before the conversion fires. */
export function setEnhancedConversionData(data: { email?: string; phone?: string }) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("set", "user_data", {
      email: data.email?.trim().toLowerCase(),
      phone_number: data.phone?.replace(/[^\d+]/g, ""),
    });
  } catch {}
}
