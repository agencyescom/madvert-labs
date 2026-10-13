import type { AnalyticsEvent } from "./events";
import { getAttribution } from "@/lib/attribution";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    __madvertReady?: boolean;
    __ga4ViaGtm?: boolean;
  }
}

/** Fan out one event to every analytics destination that is loaded. Never throws. */
export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...clean });
    if (!window.__ga4ViaGtm) window.gtag?.("event", event, clean);
    window.fbq?.("trackCustom", event, clean);
    window.clarity?.("event", event);
    if (process.env.NODE_ENV === "development") console.debug("[track]", event, clean);
  } catch {
    /* analytics must never break the page */
  }
}

/** Lead magnet events always carry the resource name, page and campaign attribution. */
export function trackLeadMagnet(event: AnalyticsEvent, leadMagnet: string, params: Params = {}) {
  const a = getAttribution();
  track(event, {
    lead_magnet_name: leadMagnet,
    page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
    utm_source: a.utm_source,
    utm_medium: a.utm_medium,
    utm_campaign: a.utm_campaign,
    ...params,
  });
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
