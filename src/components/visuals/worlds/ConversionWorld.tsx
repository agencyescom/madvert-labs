import type { CSSProperties } from "react";
import { Bar, Card, Check, Chrome, Floor, W, H, z } from "./kit";
import { WorldStage } from "./WorldStage";
import { useSvgId } from "./useSvgId";

/** Visitors entering from the left edge; `drop` ones leave before the CTA (honest CRO). */
const VISITORS: { y: number; drop?: boolean }[] = [
  { y: 70 },
  { y: 118, drop: true },
  { y: 176 },
  { y: 230, drop: true },
  { y: 268 },
  { y: 146 },
  { y: 300, drop: true },
];

const v = (o: Record<string, string | number>) => o as CSSProperties;

/**
 * Conversion: one landing page carries the scene. Traffic flows in, the offer and CTA catch it,
 * the form and booking flow progress, and booked opportunities stack up.
 */
export function ConversionWorld({ className = "" }: { className?: string }) {
  const id = useSvgId("cv");
  const grad = id("grad");
  const heat = id("heat");
  return (
    <WorldStage name="cv" tint="#2dd4bf" className={className}>
      <Floor rx={200} cx={250} />
      <div className="wld-plane" style={{ "--rx": "6deg", "--ry": "-16deg" } as CSSProperties}>
        <svg className="wld-overlay" viewBox={`0 0 ${W} ${H}`} style={{ transform: z(-20) }}>
          <defs>
            <linearGradient id={grad} x1="0" x2="1">
              <stop offset="0" stopColor="#14b8a6" />
              <stop offset="1" stopColor="#00e5ff" />
            </linearGradient>
            <radialGradient id={heat}>
              <stop offset="0" stopColor="#ff6b4a" stopOpacity="0.75" />
              <stop offset="0.45" stopColor="#fbbf24" stopOpacity="0.45" />
              <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="cv-wire">
            <path d="M200 163 C 240 163, 250 200, 268 200" />
            <path d="M392 170 C 420 170, 410 140, 406 134" />
            <path d="M406 134 C 470 180, 450 260, 420 282" />
          </g>
        </svg>

        {/* landing page */}
        <Card x={56} y={34} w={276} h={240} depth={0} className="cv-page">
          <Chrome w={276} />
          <rect x="14" y="28" width="26" height="8" rx="3" fill={`url(#${grad})`} />
          <Bar x={150} y={30} w={20} h={4} />
          <Bar x={176} y={30} w={20} h={4} />
          <Bar x={202} y={30} w={20} h={4} />
          <rect x="232" y="26" width="30" height="12" rx="6" className="wf-soft-strong" />
          <rect x="14" y="52" width="40" height="5" rx="2.5" fill="#14b8a6" opacity="0.7" />
          <Bar x={14} y={64} w={128} h={11} className="wf-ink-bar" />
          <Bar x={14} y={80} w={100} h={11} className="wf-ink-bar" />
          <Bar x={14} y={99} w={120} h={4} />
          <Bar x={14} y={108} w={92} h={4} />
          <ellipse cx="51" cy="129" rx="58" ry="24" fill={`url(#${heat})`} className="cv-heat" />
          <g className="cv-cta">
            <rect x="14" y="118" width="76" height="22" rx="7" fill={`url(#${grad})`} />
            <text x="52" y="132.5" textAnchor="middle" className="cv-btn">Book a call</text>
          </g>
          <Bar x={98} y={127} w={40} h={4} />
          {/* offer card */}
          <rect x="154" y="50" width="108" height="100" rx="9" className="cv-offer" />
          <rect x="164" y="60" width="34" height="13" rx="6.5" className="cv-badge" />
          <text x="181" y="69.5" textAnchor="middle" className="cv-badge-t">Offer</text>
          <Bar x={164} y={82} w={84} h={7} className="wf-ink-bar" />
          {[98, 112, 126].map((y) => (
            <g key={y}>
              <Check x={169} y={y} r={4} />
              <Bar x={178} y={y - 2} w={y === 112 ? 52 : 66} h={4} />
            </g>
          ))}
          {/* trust row + features */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={14 + i * 52} y="162" width="40" height="8" rx="4" className="wf-soft-strong" />
          ))}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={14 + i * 84} y="182" width="76" height="46" rx="7" className="wf-soft" />
              <rect x={22 + i * 84} y="190" width="12" height="12" rx="3.5" fill={`url(#${grad})`} opacity={0.85 - i * 0.15} />
              <Bar x={22 + i * 84} y={208} w={50} h={4} className="wf-ink-bar" />
              <Bar x={22 + i * 84} y={216} w={38} h={3} />
            </g>
          ))}
        </Card>

        {/* A/B test */}
        <Card x={18} y={10} w={98} h={34} depth={70} className="cv-ab">
          <text x="10" y="21" className="wt-label">Test</text>
          <rect x="38" y="7" width="52" height="20" rx="10" className="wf-soft-strong" />
          <rect x="65" y="9" width="23" height="16" rx="8" fill={`url(#${grad})`} className="cv-ab-knob" />
          <text x="52" y="21" textAnchor="middle" className="wt-label">A</text>
          <text x="76.5" y="21" textAnchor="middle" className="cv-ab-b">B</text>
        </Card>

        {/* lead form */}
        <Card x={268} y={146} w={124} h={118} depth={70} className="cv-form">
          <text x="12" y="21" className="wt-title">Your details</text>
          {[30, 56].map((y, i) => (
            <g key={y}>
              <rect x="12" y={y} width="100" height="17" rx="4.5" className="wf-field" />
              <rect x="18" y={y + 6.5} width={i ? 46 : 62} height="4" rx="2" className={`wf-ink-bar cv-type cv-type-${i + 1}`} />
            </g>
          ))}
          <g className="cv-continue">
            <rect x="12" y="84" width="100" height="20" rx="6" className="cv-dark-btn" />
            <text x="62" y="97.5" textAnchor="middle" className="cv-dark-btn-t">Continue</text>
          </g>
        </Card>

        {/* booking flow */}
        <Card x={344} y={26} w={124} h={108} depth={100} className="cv-booking">
          <text x="12" y="20" className="wt-title">Booking</text>
          <rect x="22" y="35" width="80" height="2.4" rx="1.2" className="wf-soft-strong" />
          <rect x="22" y="35" width="80" height="2.4" rx="1.2" fill={`url(#${grad})`} className="cv-steps-fill" />
          {[22, 62, 102].map((cx, i) => (
            <circle key={cx} cx={cx} cy="36.2" r="5.5" className={`cv-step cv-step-${i + 1}`} />
          ))}
          {["Details", "Time", "Done"].map((t, i) => (
            <text key={t} x={22 + i * 40} y="54" textAnchor="middle" className="wt-micro">
              {t}
            </text>
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={12 + i * 35} y="62" width="30" height="13" rx="4" className={i === 1 ? "cv-slot" : "wf-cell"} />
          ))}
          <g className="cv-confirm">
            <rect x="12" y="82" width="100" height="18" rx="9" className="wf-success-soft" />
            <Check x={23} y={91} r={5} />
            <text x="33" y="94.5" className="wt-success">Confirmed</text>
          </g>
        </Card>

        {/* booked opportunities */}
        <Card x={348} y={282} w={120} h={74} depth={50} className="cv-stack">
          <text x="12" y="19" className="wt-title">Booked</text>
          {[0, 1].map((i) => (
            <g key={i} className={i === 0 ? "cv-row-new" : undefined}>
              <rect x="10" y={27 + i * 22} width="100" height="18" rx="5" className="wf-soft" />
              <rect x="16" y={31 + i * 22} width="10" height="10" rx="2.5" fill={`url(#${grad})`} />
              <Bar x={32} y={33.5 + i * 22} w={44} h={4} className="wf-ink-bar" />
              <Check x={100} y={36 + i * 22} r={4.5} />
            </g>
          ))}
        </Card>

        {/* traffic + cursor + the converting lead */}
        <svg className="wld-overlay" viewBox={`0 0 ${W} ${H}`} style={{ transform: z(85) }}>
          {VISITORS.map((p, i) => (
            <g
              key={i}
              className={p.drop ? "cv-visitor cv-drop" : "cv-visitor"}
              style={v({ "--y0": `${p.y}px`, "--d": `${i * 190}ms`, "--xm": `${p.drop ? 70 : 104}px`, "--ym": `${p.drop ? p.y + 8 : 163}px` })}
            >
              <circle r="4.2" className="cv-visitor-dot" />
            </g>
          ))}
          <circle cx="107" cy="163" r="10" className="cv-ripple" />
          <g className="cv-cursor">
            <path d="M0 0 L0 15 L4 11 L7 18 L10 16.6 L7 10 L12.5 10 Z" className="cv-cursor-shape" />
          </g>
          <circle r="5" className="cv-lead cv-lead-1" />
          <circle r="5" className="cv-lead cv-lead-2" />
        </svg>
      </div>
    </WorldStage>
  );
}
