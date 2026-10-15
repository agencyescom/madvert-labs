import type { CSSProperties } from "react";
import { Bar, Card, Chrome, Floor, W, H, z, at } from "./kit";
import { WorldStage } from "./WorldStage";
import { useSvgId } from "./useSvgId";

const LW = 180;
const LH = 140;

const MODULES = [
  { x: 14, y: 16, label: "API", tone: "#00b4ff" },
  { x: 94, y: 16, label: "AI", tone: "#8b5cf6" },
  { x: 14, y: 76, label: "Auth", tone: "#14b8a6" },
  { x: 94, y: 76, label: "Sync", tone: "#f59e0b" },
];

/**
 * Tech & Product Development: the product is built from modules. An exploded stack (data,
 * services, interface) assembles, modules plug into the services layer, then the desktop app,
 * mobile app and API connection light up from it.
 */
export function TechWorld({ className = "" }: { className?: string }) {
  const id = useSvgId("tp");
  const grad = id("grad");
  const ui = id("ui");
  const area = id("area");
  return (
    <WorldStage name="tp" tint="#34d399" className={className}>
      <Floor rx={210} cx={230} />
      <div className="wld-plane" style={{ "--rx": "4deg", "--ry": "-10deg" } as CSSProperties}>
        <svg className="wld-overlay" viewBox={`0 0 ${W} ${H}`} style={{ transform: z(10) }}>
          <defs>
            <linearGradient id={grad} x1="0" x2="1">
              <stop offset="0" stopColor="#10b981" />
              <stop offset="1" stopColor="#00b4ff" />
            </linearGradient>
            <linearGradient id={ui} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#34d399" />
              <stop offset="1" stopColor="#00e5ff" />
            </linearGradient>
            <linearGradient id={area} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#00b4ff" stopOpacity="0.35" />
              <stop offset="1" stopColor="#00b4ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="tp-wire">
            <path d="M170 150 C 210 130, 230 110, 262 100" />
            <path d="M200 206 C 230 220, 236 236, 252 244" />
            <path d="M380 246 C 390 246, 392 250, 396 252" />
          </g>
          <g className="tp-wire-flow">
            <path d="M170 150 C 210 130, 230 110, 262 100" />
            <path d="M200 206 C 230 220, 236 236, 252 244" />
          </g>
        </svg>

        {/* exploded architecture stack */}
        <div className="tp-stack" style={at(84, 150, LW, LH)}>
          <div className="tp-layer tp-l1">
            <svg viewBox={`0 0 ${LW} ${LH}`} width="100%" height="100%">
              <rect x="1" y="1" width={LW - 2} height={LH - 2} rx="14" className="tp-l1-bg" />
              {[0, 1, 2].map((r) =>
                [0, 1, 2, 3].map((c) => <rect key={`${r}-${c}`} x={64 + c * 27} y={24 + r * 18} width="22" height="12" rx="2.5" className="tp-cell" />),
              )}
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <circle cx={30} cy={30 + i * 32} r="13" className="tp-db" />
                  <circle cx={30} cy={30 + i * 32} r="8" fill="none" className="tp-db-ring" />
                </g>
              ))}
              <text x="64" y="110" className="tp-layer-t">DATA</text>
            </svg>
          </div>
          <div className="tp-layer tp-l2">
            <svg viewBox={`0 0 ${LW} ${LH}`} width="100%" height="100%">
              <rect x="1" y="1" width={LW - 2} height={LH - 2} rx="14" className="tp-l2-bg" />
              {MODULES.map((m) => (
                <rect key={m.label} x={m.x} y={m.y} width="72" height="48" rx="10" className="tp-socket" />
              ))}
              <text x="14" y="134" className="tp-layer-t">SERVICES</text>
            </svg>
            {MODULES.map((m, i) => (
              <div
                key={m.label}
                className="tp-module"
                style={{ ...pct(m.x, m.y, 72, 48), "--d": `${900 + i * 160}ms`, "--mx": i % 2 ? "14cqw" : "-14cqw", "--my": i < 2 ? "-8cqw" : "8cqw" } as CSSProperties}
              >
                <svg viewBox="0 0 72 48" width="100%" height="100%">
                  <rect x="0.5" y="0.5" width="71" height="47" rx="10" fill={m.tone} />
                  <rect x="0.5" y="0.5" width="71" height="47" rx="10" fill="#fff" opacity="0.12" />
                  <text x="36" y="30" textAnchor="middle" className="tp-module-t">
                    {m.label}
                  </text>
                </svg>
              </div>
            ))}
          </div>
          <div className="tp-layer tp-l3">
            <svg viewBox={`0 0 ${LW} ${LH}`} width="100%" height="100%">
              <rect x="1" y="1" width={LW - 2} height={LH - 2} rx="14" className="tp-l3-bg" stroke={`url(#${ui})`} strokeWidth="2" />
              <rect x="12" y="12" width="34" height="116" rx="7" className="wf-soft-strong" />
              <rect x="54" y="12" width="114" height="18" rx="6" className="wf-soft-strong" />
              <rect x="54" y="38" width="54" height="40" rx="7" fill={`url(#${ui})`} opacity="0.9" />
              <rect x="114" y="38" width="54" height="40" rx="7" className="wf-soft-strong" />
              <rect x="54" y="86" width="114" height="42" rx="7" className="wf-soft-strong" />
              <text x="58" y="122" className="tp-layer-t">INTERFACE</text>
            </svg>
          </div>
          <span className="tp-pulse tp-pulse-1" />
          <span className="tp-pulse tp-pulse-2" />
          <span className="tp-pulse tp-pulse-3" />
        </div>

        {/* desktop app */}
        <Card x={262} y={26} w={200} h={146} depth={40} className="tp-build tp-desktop" style={{ "--d": "1500ms" } as CSSProperties}>
          <Chrome w={200} address={false} />
          <rect x="0" y="18" width="38" height="128" className="wf-soft" />
          <rect x="10" y="28" width="18" height="6" rx="3" fill={`url(#${grad})`} />
          {[44, 56, 68, 80].map((y) => (
            <Bar key={y} x={10} y={y} w={18} h={4} />
          ))}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={46 + i * 50} y="26" width="44" height="28" rx="5" className="wf-soft-strong" />
              <Bar x={52 + i * 50} y={33} w={18} h={3} />
              <Bar x={52 + i * 50} y={41} w={28} h={6} className="wf-ink-bar" />
            </g>
          ))}
          <rect x="46" y="62" width="144" height="74" rx="6" className="wf-soft" />
          <path d="M54 124 L74 112 L94 116 L114 98 L134 102 L154 84 L182 76 L182 128 L54 128 Z" fill={`url(#${area})`} className="tp-area" />
          <path d="M54 124 L74 112 L94 116 L114 98 L134 102 L154 84 L182 76" pathLength={1} className="tp-line" />
          <Bar x={54} y={70} w={40} h={4} className="wf-ink-bar" />
        </Card>

        {/* API / code */}
        <Card x={250} y={196} w={132} h={104} depth={60} className="tp-build tp-code" style={{ "--d": "1900ms" } as CSSProperties}>
          <rect x="0" y="0" width="132" height="20" className="tp-code-head" />
          <text x="10" y="13.5" className="tp-mono tp-mono-strong">POST /leads</text>
          <circle cx="112" cy="10" r="3" fill="var(--success)" className="au-live" />
          {[
            [10, 34, 30, "#c084fc"],
            [44, 34, 46, "#38bdf8"],
            [20, 46, 40, "#34d399"],
            [64, 46, 34, "#fbbf24"],
            [20, 58, 56, "#38bdf8"],
            [20, 70, 28, "#f472b6"],
            [52, 70, 44, "#34d399"],
            [10, 82, 18, "#c084fc"],
          ].map(([x, y, w, c], i) => (
            <rect key={i} x={x as number} y={y as number} width={w as number} height="4.5" rx="2.25" fill={c as string} opacity="0.85" className="tp-code-line" style={{ "--d": `${2100 + i * 70}ms` } as CSSProperties} />
          ))}
          <rect x="34" y="80" width="2" height="9" className="tp-caret" />
        </Card>

        {/* mobile app */}
        <Card x={394} y={182} w={76} h={150} depth={90} className="tp-build tp-phone" style={{ "--d": "1700ms" } as CSSProperties}>
          <rect x="4" y="4" width="68" height="142" rx="12" className="tp-phone-screen" />
          <rect x="28" y="9" width="20" height="4" rx="2" className="wf-ink-bar" />
          <rect x="11" y="22" width="54" height="34" rx="7" fill={`url(#${ui})`} />
          <rect x="17" y="30" width="26" height="4" rx="2" fill="#fff" />
          <rect x="17" y="40" width="18" height="6" rx="3" fill="#fff" opacity="0.7" />
          {[64, 84, 104].map((y) => (
            <g key={y}>
              <rect x="11" y={y} width="54" height="16" rx="5" className="wf-soft-strong" />
              <circle cx="19" cy={y + 8} r="4" fill={`url(#${grad})`} opacity="0.8" />
              <Bar x={27} y={y + 6} w={30} h={3.5} />
            </g>
          ))}
          <rect x="11" y="128" width="54" height="10" rx="5" className="wf-soft" />
          {[22, 38, 54].map((x) => (
            <circle key={x} cx={x} cy="133" r="2.2" className="tp-tab" />
          ))}
        </Card>
      </div>
    </WorldStage>
  );
}

function pct(x: number, y: number, w: number, h: number): CSSProperties {
  return {
    left: `${(x / LW) * 100}%`,
    top: `${(y / LH) * 100}%`,
    width: `${(w / LW) * 100}%`,
    height: `${(h / LH) * 100}%`,
  };
}
