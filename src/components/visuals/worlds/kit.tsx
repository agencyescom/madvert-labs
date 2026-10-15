import type { CSSProperties, ReactNode } from "react";

/**
 * Shared primitives for the six pillar "worlds".
 * Every world is drawn on a 480 x 384 design stage (5:4). Cards are HTML layers positioned in %
 * so they can live in real CSS 3D space; their content is SVG in the same design units,
 * so everything scales together from 300px phones to large desktops.
 */
export const W = 480;
export const H = 384;

export function at(x: number, y: number, w: number, h: number): CSSProperties {
  return {
    left: `${(x / W) * 100}%`,
    top: `${(y / H) * 100}%`,
    width: `${(w / W) * 100}%`,
    height: `${(h / H) * 100}%`,
  };
}

/** translateZ expressed in container units so depth scales with the stage. */
export const z = (units: number) => `translateZ(${((units / W) * 100).toFixed(2)}cqw)`;

export function Card({
  x,
  y,
  w,
  h,
  depth = 0,
  className = "",
  style,
  children,
  flat = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  depth?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** no card chrome (transparent layer) */
  flat?: boolean;
}) {
  return (
    <div
      className={`${flat ? "wld-layer" : "wld-card"} ${className}`}
      style={{ ...at(x, y, w, h), transform: depth ? z(depth) : undefined, ...style }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" overflow="visible">
        {children}
      </svg>
    </div>
  );
}

/** Placeholder text line (we never print fake claims, just the rhythm of copy). */
export function Bar({
  x,
  y,
  w,
  h = 5,
  className = "wf-line",
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  className?: string;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} className={className} />;
}

/** Window chrome: three dots + optional address pill. */
export function Chrome({ w, address = true }: { w: number; address?: boolean }) {
  return (
    <g>
      <rect x="0" y="0" width={w} height="18" className="wf-chrome" />
      <circle cx="10" cy="9" r="2.6" fill="#ff6b6b" opacity="0.85" />
      <circle cx="18" cy="9" r="2.6" fill="#fbbf24" opacity="0.85" />
      <circle cx="26" cy="9" r="2.6" fill="#34d399" opacity="0.85" />
      {address && <rect x={w / 2 - w * 0.22} y="5" width={w * 0.44} height="8" rx="4" className="wf-soft" />}
    </g>
  );
}

export function Check({ x, y, r = 6, className = "" }: { x: number; y: number; r?: number; className?: string }) {
  return (
    <g className={className}>
      <circle cx={x} cy={y} r={r} fill="var(--success)" />
      <path
        d={`M${x - r * 0.45} ${y + r * 0.02} l${r * 0.32} ${r * 0.32} l${r * 0.6} ${-r * 0.62}`}
        fill="none"
        stroke="#fff"
        strokeWidth={r * 0.28}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Soft floor shadow under the composition. */
export function Floor({ cx = 240, cy = 352, rx = 190, ry = 22 }: { cx?: number; cy?: number; rx?: number; ry?: number }) {
  return (
    <svg className="wld-floor" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="wf-floor" />
    </svg>
  );
}
