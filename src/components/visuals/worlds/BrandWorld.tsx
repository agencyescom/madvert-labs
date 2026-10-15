import type { CSSProperties } from "react";
import { Bar, Card, Floor, W, H, z } from "./kit";
import { WorldStage } from "./WorldStage";
import { useSvgId } from "./useSvgId";

/** Fly-in offset for an asset, in container units, plus its delay. */
const fly = (fx: number, fy: number, fr: number, d: number) =>
  ({ "--fx": `${fx}cqw`, "--fy": `${fy}cqw`, "--fr": `${fr}deg`, "--d": `${d}ms` }) as CSSProperties;

const LINKS = [
  "M240 190 C 200 160, 140 120, 92 92",
  "M240 190 C 290 150, 350 110, 396 96",
  "M240 190 C 190 200, 130 210, 84 214",
  "M240 190 C 300 210, 350 225, 398 230",
  "M240 190 C 210 250, 160 290, 132 318",
  "M240 190 C 280 250, 320 290, 346 322",
];

/**
 * Branding & Marketing: scattered brand assets (packaging, social, photo, video, campaign, press)
 * fly in around an identity board, then take on one colour system together.
 */
export function BrandWorld({ className = "" }: { className?: string }) {
  const id = useSvgId("br");
  const brand = id("brand");
  const sky = id("sky");
  const vid = id("vid");
  return (
    <WorldStage name="brand" tint="#8b7bff" className={className}>
      <Floor rx={200} />
      <div className="wld-plane wld-sway" style={{ "--rx": "10deg", "--ry": "-12deg" } as CSSProperties}>
        {/* system links behind the assets */}
        <svg className="wld-overlay" viewBox={`0 0 ${W} ${H}`} style={{ transform: z(-30) }}>
          <defs>
            <linearGradient id={brand} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7c5cff" />
              <stop offset="0.6" stopColor="#00b4ff" />
              <stop offset="1" stopColor="#00e5ff" />
            </linearGradient>
          </defs>
          {LINKS.map((d, i) => (
            <g key={d}>
              <path d={d} pathLength={1} className="br-link" style={{ "--d": `${1700 + i * 90}ms` } as CSSProperties} />
              <path d={d} pathLength={1} className="br-pulse" style={{ "--d": `${3000 + i * 420}ms` } as CSSProperties} />
            </g>
          ))}
        </svg>

        {/* 01 packaging */}
        <Card flat x={24} y={30} w={122} h={116} depth={10} className="br-asset" style={fly(-14, -10, -14, 120)}>
          <defs>
            <linearGradient id={id("box")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7c5cff" />
              <stop offset="1" stopColor="#00b4ff" />
            </linearGradient>
          </defs>
          <ellipse cx="62" cy="106" rx="50" ry="7" className="wf-shadow" />
          <path d="M12 44 L52 30 L110 44 L70 60 Z" className="br-box-top" />
          <path d="M12 44 L70 60 L70 104 L12 88 Z" fill={`url(#${id("box")})`} />
          <path d="M70 60 L110 44 L110 88 L70 104 Z" className="br-box-side" />
          <g transform="translate(41 72) skewY(15)">
            <circle cx="-5" cy="0" r="7" fill="none" stroke="#fff" strokeWidth="2.4" />
            <circle cx="5" cy="0" r="7" fill="none" stroke="#fff" strokeWidth="2.4" opacity="0.7" />
          </g>
          <g transform="translate(78 66) skewY(-21)">
            <rect x="0" y="0" width="22" height="3" rx="1.5" fill="#fff" opacity="0.5" />
            <rect x="0" y="7" width="14" height="3" rx="1.5" fill="#fff" opacity="0.35" />
          </g>
          {/* business card leaning on the box */}
          <g transform="translate(78 82) rotate(-8)">
            <rect x="0" y="0" width="38" height="24" rx="3" className="br-paper" />
            <circle cx="9" cy="9" r="4" fill={`url(#${id("box")})`} />
            <rect x="6" y="16" width="20" height="2.6" rx="1.3" className="wf-line" />
          </g>
        </Card>

        {/* 02 social creative */}
        <Card x={338} y={24} w={118} h={144} depth={20} className="br-asset" style={fly(14, -12, 12, 260)}>
          <circle cx="15" cy="15" r="7" fill={`url(#${brand})`} />
          <Bar x={27} y={10} w={40} h={4.5} className="wf-ink-bar" />
          <Bar x={27} y={18} w={24} h={3.5} />
          <rect x="8" y="30" width="102" height="80" rx="6" fill={`url(#${brand})`} />
          <circle cx="78" cy="58" r="22" fill="#fff" opacity="0.16" />
          <circle cx="36" cy="86" r="30" fill="#fff" opacity="0.1" />
          <rect x="18" y="44" width="46" height="6" rx="3" fill="#fff" opacity="0.92" />
          <rect x="18" y="55" width="32" height="6" rx="3" fill="#fff" opacity="0.7" />
          <rect x="18" y="88" width="30" height="12" rx="6" fill="#fff" />
          <path d="M14 126 c0 -4 5 -6 7 -2 c2 -4 7 -2 7 2 c0 4 -7 8 -7 8 s-7 -4 -7 -8z" fill="#fb7185" />
          <path d="M36 121 h14 a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -3 3 h-9 l-4 3 v-3 a3 3 0 0 1 -1 -3 v-6 a3 3 0 0 1 0 -3z" className="wf-icon" />
          <path d="M62 128 l12 -6 l-3 13 l-3 -5z" className="wf-icon" />
          <Bar x={84} y={125} w={24} h={4} />
        </Card>

        {/* 03 photography */}
        <Card x={18} y={166} w={130} h={96} depth={30} className="br-asset" style={fly(-16, 4, -10, 380)}>
          <defs>
            <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9ec5ff" />
              <stop offset="1" stopColor="#ffd5b0" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="118" height="68" rx="5" fill={`url(#${sky})`} />
          <circle cx="88" cy="34" r="10" fill="#fff4dc" />
          <path d="M6 64 L36 36 L56 54 L76 34 L124 66 L124 74 L6 74 Z" fill="#5b6ea8" />
          <path d="M6 74 L6 62 L30 52 L62 66 L94 52 L124 70 L124 74 Z" fill="#2e3c6b" />
          <path d="M14 14 h8 M14 14 v8 M116 14 h-8 M116 14 v8 M14 66 h8 M14 66 v-8 M116 66 h-8 M116 66 v-8" stroke="#fff" strokeWidth="1.6" opacity="0.85" />
          <Bar x={8} y={82} w={54} h={4.5} className="wf-ink-bar" />
          <circle cx="116" cy="84" r="4" fill={`url(#${brand})`} />
        </Card>

        {/* 04 video */}
        <Card x={334} y={184} w={128} h={90} depth={35} className="br-asset" style={fly(16, 6, 10, 500)}>
          <defs>
            <linearGradient id={vid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1b2350" />
              <stop offset="1" stopColor="#3a2b7a" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="116" height="62" rx="5" fill={`url(#${vid})`} />
          <circle cx="98" cy="22" r="18" fill="#00e5ff" opacity="0.18" />
          <circle cx="64" cy="37" r="13" fill="#fff" opacity="0.95" />
          <path d="M60 31 L71 37 L60 43 Z" fill="#3a2b7a" />
          <rect x="6" y="76" width="116" height="4" rx="2" className="wf-soft" />
          <rect x="6" y="76" width="50" height="4" rx="2" fill={`url(#${brand})`} />
          <circle cx="56" cy="78" r="3.6" fill="#fff" stroke="#00b4ff" strokeWidth="1.4" />
        </Card>

        {/* 05 campaign */}
        <Card x={52} y={278} w={156} h={84} depth={45} className="br-asset br-campaign" style={fly(-10, 14, -8, 640)}>
          <rect width="156" height="84" fill={`url(#${brand})`} />
          <circle cx="132" cy="18" r="34" fill="#fff" opacity="0.1" />
          <text x="12" y="22" className="br-eyebrow">CAMPAIGN</text>
          <rect x="12" y="32" width="96" height="9" rx="4.5" fill="#fff" />
          <rect x="12" y="46" width="70" height="9" rx="4.5" fill="#fff" opacity="0.75" />
          <rect x="12" y="62" width="44" height="13" rx="6.5" fill="#0a1020" />
          <rect x="19" y="67" width="30" height="3" rx="1.5" fill="#fff" />
          <g transform="translate(136 64)">
            <circle cx="-5" cy="0" r="6.5" fill="none" stroke="#fff" strokeWidth="2.2" />
            <circle cx="5" cy="0" r="6.5" fill="none" stroke="#fff" strokeWidth="2.2" opacity="0.7" />
          </g>
        </Card>

        {/* 06 publication / PR */}
        <Card x={272} y={284} w={156} h={80} depth={40} className="br-asset" style={fly(12, 14, 9, 760)}>
          <text x="10" y="20" className="br-mast">PRESS</text>
          <rect x="10" y="26" width="136" height="1" className="wf-line" />
          <rect x="10" y="33" width="52" height="38" rx="3" fill={`url(#${brand})`} opacity="0.9" />
          <circle cx="36" cy="52" r="9" fill="none" stroke="#fff" strokeWidth="2" />
          <Bar x={70} y={34} w={76} h={6} className="wf-ink-bar" />
          <Bar x={70} y={44} w={60} h={6} className="wf-ink-bar" />
          <Bar x={70} y={56} w={34} h={3} />
          <Bar x={108} y={56} w={38} h={3} />
          <Bar x={70} y={63} w={34} h={3} />
          <Bar x={108} y={63} w={30} h={3} />
        </Card>

        {/* centre: identity board */}
        <Card x={160} y={92} w={160} h={192} depth={60} className="br-board">
          <text x="14" y="22" className="wt-eyebrow">BRAND SYSTEM</text>
          <rect x="14" y="32" width="50" height="50" rx="12" fill={`url(#${brand})`} />
          <circle cx="33" cy="57" r="11" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="45" cy="57" r="11" fill="none" stroke="#fff" strokeWidth="3" opacity="0.7" />
          <Bar x={74} y={44} w={70} h={9} className="wf-ink-bar" />
          <Bar x={74} y={60} w={48} h={5} />
          <rect x="14" y="94" width="132" height="1" className="wf-line" />
          <text x="12" y="138" className="br-type">Aa</text>
          <Bar x={74} y={108} w={70} h={7} className="wf-ink-bar" />
          <Bar x={74} y={121} w={56} h={5} />
          <Bar x={74} y={131} w={62} h={4} />
          {["#7c5cff", "#00b4ff", "#00e5ff", "var(--ink)", "#ffb86b"].map((c, i) => (
            <circle
              key={c}
              cx={24 + i * 24}
              cy="166"
              r="9"
              fill={c}
              className="br-swatch"
              style={{ "--d": `${500 + i * 110}ms` } as CSSProperties}
            />
          ))}
        </Card>
      </div>
    </WorldStage>
  );
}
