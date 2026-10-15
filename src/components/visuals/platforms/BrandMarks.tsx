/**
 * Simplified platform marks, drawn as SVG for nominative reference only
 * (to name the platforms Madvert Labs works with). No endorsement implied.
 */

type MarkProps = { className?: string; uid: string };

/** Meta: the infinity-style mark in Meta blue. */
export function MetaMark({ className, uid }: MarkProps) {
  const g = `${uid}-meta`;
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" x2="1" y1="0.2" y2="0.8">
          <stop offset="0" stopColor="#0064E0" />
          <stop offset="0.55" stopColor="#0073EE" />
          <stop offset="1" stopColor="#0082FB" />
        </linearGradient>
      </defs>
      <path
        d="M20 12C23 7.4 26 3.6 30 3.6c4.4 0 6.9 4.9 6.9 9.7 0 4.1-2 7.1-5.4 7.1-4 0-7-4.1-11.5-8.4C16 7.5 13 3.6 9.6 3.6 5.6 3.6 3.1 8.4 3.1 13c0 4.2 2 7.4 5.4 7.4 4 0 7.5-4 11.5-8.4Z"
        fill="none"
        stroke={`url(#${g})`}
        strokeWidth="3.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Google: four-colour G. */
export function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/** Analytics: three rising bars in analytics orange. */
export function AnalyticsMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="15.5" y="2" width="6" height="20" rx="3" fill="#F9AB00" />
      <rect x="9" y="9" width="6" height="13" rx="3" fill="#E37400" />
      <circle cx="5.5" cy="19" r="3" fill="#E37400" />
    </svg>
  );
}

/** Generic glyphs for the non-brand systems, tinted with the accent gradient. */
export function SystemGlyph({ kind, uid, className }: { kind: "search" | "crm" | "ai" | "website" | "sales"; uid: string; className?: string }) {
  const g = `${uid}-sg-${kind}`;
  const stroke = `url(#${g})`;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id={g} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#00B4FF" />
          <stop offset="1" stopColor="#00D8F5" />
        </linearGradient>
      </defs>
      {kind === "search" && (
        <>
          <circle cx="10.5" cy="10.5" r="6" stroke={stroke} strokeWidth="2.2" />
          <path d="m15 15 5 5" stroke={stroke} strokeWidth="2.4" />
          <path d="M10.5 7.6v5.8M7.6 10.5h5.8" stroke={stroke} strokeWidth="1.6" opacity="0.7" />
        </>
      )}
      {kind === "crm" && (
        <>
          <circle cx="9" cy="8.5" r="3.2" stroke={stroke} strokeWidth="2" />
          <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" stroke={stroke} strokeWidth="2" />
          <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 14.4c1.6.6 2.7 2.1 3 4.6" stroke={stroke} strokeWidth="1.8" opacity="0.7" />
        </>
      )}
      {kind === "ai" && (
        <>
          <path d="M11 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5Z" fill={stroke} />
          <path d="M18 14.5c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8Z" fill={stroke} opacity="0.7" />
        </>
      )}
      {kind === "website" && (
        <>
          <rect x="3" y="4.5" width="18" height="15" rx="3" stroke={stroke} strokeWidth="2" />
          <path d="M3 9h18" stroke={stroke} strokeWidth="1.8" />
          <path d="M7 14h6" stroke={stroke} strokeWidth="2" />
        </>
      )}
      {kind === "sales" && (
        <>
          <path d="M3.5 5h17l-6.5 7.5V18l-4 2v-7.5Z" stroke={stroke} strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
