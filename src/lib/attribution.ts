/** First touch + session attribution, captured client side and attached to every lead. */

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  landing_page?: string;
  first_page?: string;
  referrer?: string;
  first_seen?: string;
  timestamp?: string;
  cta_clicked?: string;
};

const FIRST = "mv_first_touch";
const SESSION = "mv_session_touch";
const LAST_CTA = "mv_last_cta";
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;

function read(store: Storage, key: string): Attribution | null {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function write(store: Storage, key: string, value: unknown) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {}
}

export function captureAttribution() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const params: Attribution = {};
  for (const k of KEYS) {
    const v = url.searchParams.get(k);
    if (v) params[k] = v.slice(0, 200);
  }
  const page = url.pathname + url.search;
  const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined;
  const now = new Date().toISOString();

  if (!read(localStorage, FIRST)) {
    write(localStorage, FIRST, { ...params, first_page: page, referrer: ref, first_seen: now });
  }
  const session = read(sessionStorage, SESSION);
  if (!session || Object.keys(params).length) {
    write(sessionStorage, SESSION, { ...(session ?? {}), ...params, landing_page: session?.landing_page ?? page, referrer: ref ?? session?.referrer });
  }
}

export function rememberCta(label: string) {
  try {
    sessionStorage.setItem(LAST_CTA, label.slice(0, 120));
  } catch {}
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const first = read(localStorage, FIRST) ?? {};
  const session = read(sessionStorage, SESSION) ?? {};
  let cta: string | undefined;
  try {
    cta = sessionStorage.getItem(LAST_CTA) ?? undefined;
  } catch {}
  return {
    // Session (last touch) UTMs win; fall back to first touch.
    utm_source: session.utm_source ?? first.utm_source,
    utm_medium: session.utm_medium ?? first.utm_medium,
    utm_campaign: session.utm_campaign ?? first.utm_campaign,
    utm_content: session.utm_content ?? first.utm_content,
    utm_term: session.utm_term ?? first.utm_term,
    gclid: session.gclid ?? first.gclid,
    fbclid: session.fbclid ?? first.fbclid,
    landing_page: session.landing_page,
    first_page: first.first_page,
    referrer: session.referrer ?? first.referrer,
    first_seen: first.first_seen,
    timestamp: new Date().toISOString(),
    cta_clicked: cta,
  };
}
