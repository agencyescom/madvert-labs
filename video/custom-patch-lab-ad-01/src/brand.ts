// Custom Patch Lab brand tokens — values from the Brand Identity System PDF
// (03 — Color Palette & Typography) and the approved Gemini styleframes.
export const C = {
  navy: '#082E3B',
  navyDeep: '#05222C',
  teal: '#0F7C8A',
  orange: '#F8673C',
  red: '#E63946',
  mustard: '#F4B942',
  cream: '#FFF9F3',
  beige: '#E8DCC7',
  charcoal: '#2B2B2B',
  text: '#FBF2E2',
} as const;

export const GOLD_GRADIENT = 'linear-gradient(180deg, #FFDC85 0%, #F4B942 46%, #E3922C 100%)';
export const GOLD_LINE = 'linear-gradient(90deg, rgba(244,185,66,0) 0%, #F4B942 18%, #FFE29A 50%, #F4B942 82%, rgba(244,185,66,0) 100%)';

// Styleframes set headlines in a bold display serif; Fraunces (OFL) at its
// largest optical size is the closest open match. Montserrat is the brand's
// primary sans (labels, tracking accents).
export const FONT_DISPLAY = 'Fraunces, Georgia, serif';
export const DISPLAY_AXES = '"opsz" 144, "SOFT" 0, "WONK" 0';
export const FONT_SANS = 'Montserrat, Arial, sans-serif';

// 9:16 mobile-safe area (Reels / TikTok / Shorts UI). Keep type and CTA inside.
export const SAFE = {top: 220, bottom: 1500, left: 90, right: 950} as const;

// Marketing claims. Only flip a flag after the client confirms the claim in writing.
// "$0 setup fees" and "USA based business" appear in Gemini styleframes but NOT in
// the approved Brand Identity System, so they are off by default.
export const CLAIMS = {
  setupFeeApproved: false,
  usaBasedApproved: false,
} as const;

export const BENEFIT_LINES: [string, string] = CLAIMS.setupFeeApproved
  ? ['$0 SETUP', 'FEES.']
  : ['MADE FOR', 'YOUR BRAND.'];
