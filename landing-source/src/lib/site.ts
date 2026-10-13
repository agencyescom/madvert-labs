import { asset } from "./paths";

export const SITE = {
  name: "Madvert Labs",
  tagline: "Digital Marketing & Growth Systems",
  offer: "The Patch Capacity Partnership",
  /** Canonical URL of this landing page (it lives under a sub-path of the main site). */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.madvertlabs.com/custom-patches",
  title: "Pre-Qualified Custom Patch RFQs | Madvert Labs",
  description:
    "A performance-based customer acquisition partnership for established custom patch and embroidery manufacturers selling into the U.S. Founding beta pricing starts at $15 per accepted qualified RFQ, with ad spend included.",
  price: 15,
} as const;

/** GoHighLevel booking calendar (white-labelled on api.madvertlabs.com). */
export const BOOKING = {
  calendarUrl: process.env.NEXT_PUBLIC_GHL_CALENDAR_URL || "https://api.madvertlabs.com/widget/booking/m2v95rY845IT0tQwdbEL",
  /**
   * GoHighLevel's embed script. It resizes the booking iframe to fit each step of the flow.
   * If the embed code in GHL (Calendars → ⋯ → Share → Embed code) shows a different script URL
   * for your white-label domain, set NEXT_PUBLIC_GHL_EMBED_SCRIPT to that URL.
   */
  embedScript: process.env.NEXT_PUBLIC_GHL_EMBED_SCRIPT || "https://api.madvertlabs.com/js/form_embed.js",
} as const;

/** The VSL, served from the page's own folder: /custom-patches/vsl.mp4 in production. */
export const VSL = {
  src: asset("/vsl.mp4"),
  poster: asset("/vsl-poster.webp"),
  width: 1920,
  height: 1080,
  /** Actual running time of the supplied file (95.5 s). */
  duration: "1:35",
  title: "The Madvert Labs Patches Partnership, explained",
} as const;

export const APPLY_HREF = "#apply";
export const BOOK_HREF = "#book-call";

export const NAV_LINKS = [
  { id: "how-it-works", label: "How It Works" },
  { id: "included", label: "What's Included" },
  { id: "pricing", label: "Pricing" },
  { id: "who-its-for", label: "Who It's For" },
  { id: "faq", label: "FAQ" },
] as const;
