/**
 * The Madvert Growth Ribbon: the recurring signature of the site.
 * A soft band of strands that reads as flow, data and continuity.
 * Rendered as static SVG on the server; motion is CSS only and is disabled under reduced motion.
 */

type Shape = "rise" | "wave" | "fall" | "flat";

const SHAPES: Record<Shape, [number, number, number, number, number]> = {
  // y at x = 0, 400, 800, 1200, 1600 (viewBox 1600 x 400)
  rise: [330, 300, 230, 150, 60],
  wave: [220, 120, 260, 140, 200],
  fall: [80, 160, 220, 270, 320],
  flat: [200, 180, 210, 190, 200],
};

function strand(base: [number, number, number, number, number], offset: number, twist: number) {
  const y = base.map((v, i) => v + offset * (1 - 0.55 * Math.sin((i / 4) * Math.PI)) + twist * Math.sin(i * 1.3));
  return `M-20 ${y[0].toFixed(1)} C 220 ${y[0].toFixed(1)}, 260 ${y[1].toFixed(1)}, 400 ${y[1].toFixed(1)} S 650 ${y[2].toFixed(1)}, 800 ${y[2].toFixed(1)} S 1050 ${y[3].toFixed(1)}, 1200 ${y[3].toFixed(1)} S 1450 ${y[4].toFixed(1)}, 1620 ${y[4].toFixed(1)}`;
}

export function GrowthRibbon({
  shape = "rise",
  strands = 10,
  spread = 46,
  className = "",
  opacity = 1,
  flowing = true,
  id = "gr",
}: {
  shape?: Shape;
  strands?: number;
  spread?: number;
  className?: string;
  opacity?: number;
  flowing?: boolean;
  id?: string;
}) {
  const base = SHAPES[shape];
  const lines = Array.from({ length: strands }, (_, i) => {
    const t = i / (strands - 1);
    return { d: strand(base, (t - 0.5) * spread, (t - 0.5) * 18), t };
  });
  const core = strand(base, 0, 0);
  return (
    <svg
      viewBox="0 0 1600 400"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#00b4ff" stopOpacity="0" />
          <stop offset="0.25" stopColor="#00b4ff" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#00e5ff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#00e5ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${id}-g)`} strokeLinecap="round">
        {lines.map(({ d, t }, i) => (
          <path key={i} d={d} strokeWidth={0.6 + (1 - Math.abs(t - 0.5) * 2) * 0.9} opacity={0.18 + (1 - Math.abs(t - 0.5) * 2) * 0.5} />
        ))}
        <path d={core} strokeWidth="2" opacity="0.9" />
        {flowing ? <path d={core} strokeWidth="3" className="ribbon-flow" stroke="#bff7ff" opacity="0.7" /> : null}
      </g>
    </svg>
  );
}

/** A thin connector that draws itself when its parent [data-reveal] enters the viewport. */
export function RibbonUnderline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 14" aria-hidden="true" className={`ribbon-underline ${className}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="ru-g" x1="0" x2="1">
          <stop offset="0" stopColor="#00b4ff" />
          <stop offset="1" stopColor="#00e5ff" />
        </linearGradient>
      </defs>
      <path d="M2 10 C 60 2, 120 14, 218 4" pathLength={1} fill="none" stroke="url(#ru-g)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
