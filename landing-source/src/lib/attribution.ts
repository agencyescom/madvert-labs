/**
 * Marketing attribution capture. First touch is kept in localStorage,
 * the latest touch in sessionStorage. Both are attached to the application.
 */
export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  meta_campaign_id?: string;
  meta_adset_id?: string;
  meta_ad_id?: string;
  fbclid?: string;
  gclid?: string;
  landing_page?: string;
  referrer?: string;
  captured_at?: string;
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** Meta IDs arrive under different names depending on how the URL parameters were configured. */
const META_ALIASES: Record<"meta_campaign_id" | "meta_adset_id" | "meta_ad_id", string[]> = {
  meta_campaign_id: ["meta_campaign_id", "campaign_id", "fb_campaign_id", "utm_id"],
  meta_adset_id: ["meta_adset_id", "adset_id", "ad_set_id", "fb_adset_id"],
  meta_ad_id: ["meta_ad_id", "ad_id", "fb_ad_id"],
};

const FIRST_KEY = "ml_attr_first";
const LAST_KEY = "ml_attr_last";

function safeGet(storage: Storage | undefined, key: string): Attribution | null {
  try {
    const raw = storage?.getItem(key);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
function safeSet(storage: Storage | undefined, key: string, value: Attribution) {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode etc.) */
  }
}

export function captureAttribution() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const attr: Attribution = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) attr[k] = v.slice(0, 200);
  }
  for (const [field, aliases] of Object.entries(META_ALIASES) as [keyof typeof META_ALIASES, string[]][]) {
    for (const a of aliases) {
      const v = params.get(a);
      if (v) {
        attr[field] = v.slice(0, 64);
        break;
      }
    }
  }
  const fbclid = params.get("fbclid");
  if (fbclid) attr.fbclid = fbclid.slice(0, 300);
  const gclid = params.get("gclid");
  if (gclid) attr.gclid = gclid.slice(0, 300);

  const hasSignal = Object.keys(attr).length > 0;
  const stamped: Attribution = {
    ...attr,
    landing_page: window.location.pathname + window.location.search,
    referrer: document.referrer || undefined,
    captured_at: new Date().toISOString(),
  };
  if (!safeGet(window.localStorage, FIRST_KEY)) safeSet(window.localStorage, FIRST_KEY, stamped);
  if (hasSignal || !safeGet(window.sessionStorage, LAST_KEY)) safeSet(window.sessionStorage, LAST_KEY, stamped);
}

function readCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export function getAttribution() {
  if (typeof window === "undefined") return { first: null, last: null };
  return {
    first: safeGet(window.localStorage, FIRST_KEY),
    last: safeGet(window.sessionStorage, LAST_KEY),
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
  };
}
