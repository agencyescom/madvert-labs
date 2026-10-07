import type { ReactNode } from "react";

/**
 * Madvert dimensional icon system.
 * Each glyph has a "body" (extruded, neutral material) and an "accent" (cyan, lit).
 * Gradients live once in <IconDefs /> (rendered in the root layout) so every icon shares them.
 */

export type IconName =
  | "branding"
  | "acquisition"
  | "conversion"
  | "studios"
  | "automation"
  | "development"
  | "paidMedia"
  | "seo"
  | "aiSearch"
  | "crm"
  | "analytics"
  | "tracking"
  | "growth"
  | "strategy"
  | "aiAgents"
  | "mobileApps"
  | "webApps"
  | "systems";

function gearPath(cx: number, cy: number, rOuter: number, rInner: number, teeth: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const t = step * 0.22;
    const corners = [
      [a - step / 2 + t, rInner],
      [a - t * 0.9, rOuter],
      [a + t * 0.9, rOuter],
      [a + step / 2 - t, rInner],
    ] as const;
    for (const [ang, r] of corners) {
      pts.push(`${(cx + r * Math.cos(ang)).toFixed(2)} ${(cy + r * Math.sin(ang)).toFixed(2)}`);
    }
  }
  return `M${pts.join(" L")}Z`;
}

const GEAR = gearPath(24, 24, 18, 14, 8);

type Glyph = { body: ReactNode; accent: ReactNode };

const glyphs: Record<IconName, Glyph> = {
  paidMedia: {
    body: (
      <>
        <path d="M8 19.5c0-1.4 1-2.6 2.3-3L29 10v28l-18.7-6.5A3.2 3.2 0 0 1 8 28.4z" />
        <path d="M13.5 31.5l2.4 7.4a2 2 0 0 0 1.9 1.4h2.4a1.4 1.4 0 0 0 1.3-1.9l-2.1-5.5z" />
      </>
    ),
    accent: (
      <g fill="none" strokeWidth="3" strokeLinecap="round">
        <path d="M34.5 17.5 40 14" />
        <path d="M35.5 24h6.5" />
        <path d="M34.5 30.5 40 34" />
      </g>
    ),
  },
  seo: {
    body: (
      <>
        <path d="M21 6a15 15 0 1 1 0 30 15 15 0 0 1 0-30zm0 5.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19z" fillRule="evenodd" />
        <path d="M31.2 29.4l9.5 9.5a2.6 2.6 0 0 1-3.7 3.7l-9.5-9.5z" />
      </>
    ),
    accent: <circle cx="21" cy="21" r="5" />,
  },
  aiSearch: {
    body: (
      <>
        <path d="M21 6a15 15 0 1 1 0 30 15 15 0 0 1 0-30zm0 5.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19z" fillRule="evenodd" />
        <path d="M31.2 29.4l9.5 9.5a2.6 2.6 0 0 1-3.7 3.7l-9.5-9.5z" />
      </>
    ),
    accent: <path d="M21 13.5l1.7 4.3 4.3 1.7-4.3 1.7L21 25.5l-1.7-4.3-4.3-1.7 4.3-1.7z" />,
  },
  crm: {
    body: (
      <>
        <circle cx="24" cy="15" r="6.5" />
        <path d="M12.5 38.5c0-6.4 5.2-11 11.5-11s11.5 4.6 11.5 11v1.5h-23z" />
      </>
    ),
    accent: (
      <>
        <circle cx="10.5" cy="19" r="4" />
        <circle cx="37.5" cy="19" r="4" />
        <path d="M3.5 36c0-4.4 3-7.5 7-7.5 1.4 0 2.6.3 3.6 1a14 14 0 0 0-3 7.5H3.5zM44.5 36c0-4.4-3-7.5-7-7.5-1.4 0-2.6.3-3.6 1a14 14 0 0 1 3 7.5h7.6z" />
      </>
    ),
  },
  automation: {
    body: <path d={GEAR} />,
    accent: <circle cx="24" cy="24" r="6" />,
  },
  analytics: {
    body: (
      <>
        <rect x="8" y="26" width="8" height="14" rx="2.2" />
        <rect x="20" y="17" width="8" height="23" rx="2.2" />
      </>
    ),
    accent: <rect x="32" y="8" width="8" height="32" rx="2.2" />,
  },
  tracking: {
    body: (
      <>
        <path d="M24 9a15 15 0 1 1 0 30 15 15 0 0 1 0-30zm0 4.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21z" fillRule="evenodd" />
        <rect x="22.2" y="3" width="3.6" height="9" rx="1.8" />
        <rect x="22.2" y="36" width="3.6" height="9" rx="1.8" />
        <rect x="3" y="22.2" width="9" height="3.6" rx="1.8" />
        <rect x="36" y="22.2" width="9" height="3.6" rx="1.8" />
      </>
    ),
    accent: <circle cx="24" cy="24" r="4.5" />,
  },
  conversion: {
    body: <path d="M7.5 9.5h33a1.5 1.5 0 0 1 1.2 2.4L29 27.5v10.2a2 2 0 0 1-1.1 1.8l-5 2.5a1.5 1.5 0 0 1-2.2-1.3V27.5L6.3 11.9a1.5 1.5 0 0 1 1.2-2.4z" />,
    accent: <rect x="10" y="12" width="28" height="3.4" rx="1.7" />,
  },
  growth: {
    body: (
      <>
        <rect x="7" y="30" width="7" height="11" rx="1.8" />
        <rect x="18" y="25" width="7" height="16" rx="1.8" />
        <rect x="29" y="20" width="7" height="21" rx="1.8" />
      </>
    ),
    accent: (
      <>
        <path d="M7 22.5 17 14l7 5 13-11.5" fill="none" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31.5 6.5h8v8z" />
      </>
    ),
  },
  strategy: {
    body: <path d="M4 41 18.5 17l6.7 10.6 4.6-6.6L44 41z" />,
    accent: (
      <>
        <rect x="28.6" y="7" width="2.6" height="15" rx="1.3" />
        <path d="M31 7.5h9.5l-2.6 3.6 2.6 3.6H31z" />
      </>
    ),
  },
  studios: {
    body: (
      <>
        <rect x="5" y="13" width="27" height="22" rx="5" />
        <path d="M33.5 21.2 42 15.8a1.3 1.3 0 0 1 2 1.1v14.2a1.3 1.3 0 0 1-2 1.1l-8.5-5.4z" />
      </>
    ),
    accent: <circle cx="18.5" cy="24" r="4.5" />,
  },
  development: {
    body: (
      <path
        d="M10 8h28a5 5 0 0 1 5 5v22a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5zm-1 8v19a1 1 0 0 0 1 1h28a1 1 0 0 0 1-1V16z"
        fillRule="evenodd"
      />
    ),
    accent: (
      <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21.5 14.5 26l4.5 4.5" />
        <path d="M29 21.5 33.5 26 29 30.5" />
        <path d="M26 20.5 22 31.5" />
      </g>
    ),
  },
  webApps: {
    body: (
      <path
        d="M10 7h28a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V12a5 5 0 0 1 5-5zm-1 9v20a1 1 0 0 0 1 1h28a1 1 0 0 0 1-1V16z"
        fillRule="evenodd"
      />
    ),
    accent: (
      <>
        <rect x="12" y="20" width="10" height="13" rx="2" />
        <rect x="25" y="20" width="11" height="5" rx="2" />
        <rect x="25" y="28" width="11" height="5" rx="2" />
      </>
    ),
  },
  mobileApps: {
    body: (
      <path
        d="M17 4h14a4.5 4.5 0 0 1 4.5 4.5v31A4.5 4.5 0 0 1 31 44H17a4.5 4.5 0 0 1-4.5-4.5v-31A4.5 4.5 0 0 1 17 4zm-.5 6v26.5h15V10z"
        fillRule="evenodd"
      />
    ),
    accent: (
      <>
        <rect x="19" y="14" width="10" height="3.5" rx="1.75" />
        <rect x="19" y="21" width="10" height="10" rx="2.4" />
        <circle cx="24" cy="40" r="1.8" />
      </>
    ),
  },
  aiAgents: {
    body: (
      <>
        <rect x="11" y="11" width="26" height="26" rx="6" />
        <g>
          <rect x="16" y="4" width="3" height="7" rx="1.5" />
          <rect x="22.5" y="4" width="3" height="7" rx="1.5" />
          <rect x="29" y="4" width="3" height="7" rx="1.5" />
          <rect x="16" y="37" width="3" height="7" rx="1.5" />
          <rect x="22.5" y="37" width="3" height="7" rx="1.5" />
          <rect x="29" y="37" width="3" height="7" rx="1.5" />
          <rect x="4" y="16" width="7" height="3" rx="1.5" />
          <rect x="4" y="29" width="7" height="3" rx="1.5" />
          <rect x="37" y="16" width="7" height="3" rx="1.5" />
          <rect x="37" y="29" width="7" height="3" rx="1.5" />
        </g>
      </>
    ),
    accent: <path d="M24 16.5 31 31h-4l-3-6.5-3 6.5h-4z" />,
  },
  branding: {
    body: <path d="M24 4.5 41 14.3v19.4L24 43.5 7 33.7V14.3z" />,
    accent: <path d="M24 14.5c.9 4.9 4.6 8.6 9.5 9.5-4.9.9-8.6 4.6-9.5 9.5-.9-4.9-4.6-8.6-9.5-9.5 4.9-.9 8.6-4.6 9.5-9.5z" />,
  },
  acquisition: {
    body: (
      <path
        d="M22 7a17 17 0 1 1 0 34 17 17 0 0 1 0-34zm0 5a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm0 5.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z"
        fillRule="evenodd"
      />
    ),
    accent: (
      <>
        <path d="M23.4 25.4 39 9.8" fill="none" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M35.5 5.5h7v7l-3.2.4z" />
      </>
    ),
  },
  systems: {
    body: (
      <>
        <path d="M24 30.5 43 21l-19-9.5L5 21z" opacity="0.55" />
        <path d="M24 38.5 43 29l-4.6-2.3L24 33.9 9.6 26.7 5 29z" />
      </>
    ),
    accent: <path d="M24 23.5 43 14 24 4.5 5 14z" />,
  },
};

const SIZES = {
  xs: { box: 32, glyph: 18, radius: 9 },
  sm: { box: 44, glyph: 24, radius: 12 },
  md: { box: 60, glyph: 32, radius: 16 },
  lg: { box: 88, glyph: 48, radius: 22 },
  xl: { box: 132, glyph: 74, radius: 30 },
} as const;

export function Glyph({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  const g = glyphs[name];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={className}>
      {/* extrusion */}
      <g transform="translate(0.9 1.4)" fill="url(#ic-side)" stroke="url(#ic-side)">
        {g.body}
      </g>
      <g fill="url(#ic-body)" stroke="url(#ic-body)" strokeWidth="0">
        {g.body}
      </g>
      <g fill="url(#ic-accent)" stroke="url(#ic-accent)" filter="url(#ic-glow)">
        {g.accent}
      </g>
    </svg>
  );
}

export function Icon3D({
  name,
  size = "md",
  glow = false,
  className = "",
  label,
}: {
  name: IconName;
  size?: keyof typeof SIZES;
  glow?: boolean;
  className?: string;
  label?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.radius,
        background: "linear-gradient(160deg, var(--surface-2), var(--bg))",
        boxShadow: glow
          ? "inset 0 1px 0 rgb(255 255 255 / 0.08), 0 0 0 1px rgb(0 200 255 / 0.28), 0 18px 40px -18px rgb(0 180 255 / 0.55)"
          : "inset 0 1px 0 rgb(255 255 255 / 0.07), 0 0 0 1px var(--line), 0 14px 30px -20px rgb(0 0 0 / 0.5)",
      }}
    >
      <Glyph name={name} size={s.glyph} />
    </span>
  );
}

/** Shared gradient definitions for every icon on the page. Render once. */
export function IconDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="ic-body" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" style={{ stopColor: "var(--ic-body-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--ic-body-b)" }} />
        </linearGradient>
        <linearGradient id="ic-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--ic-side-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--ic-side-b)" }} />
        </linearGradient>
        <linearGradient id="ic-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00e5ff" />
          <stop offset="1" stopColor="#0094ff" />
        </linearGradient>
        <filter id="ic-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="b" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0.75  0 0 0 0 1  0 0 0 0.75 0" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
