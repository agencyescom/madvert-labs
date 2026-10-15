import type { CSSProperties } from "react";
import { Bar, Card, Check, Floor, W, H, z } from "./kit";
import { WorldStage } from "./WorldStage";
import { useSvgId } from "./useSvgId";

/** Attention particles: start (x0,y0) on an ad surface, end (x1,y1) at the lead form. */
const ATTENTION = [
  [136, 62, 188, 128],
  [136, 92, 188, 140],
  [136, 122, 188, 152],
  [136, 150, 188, 164],
  [166, 222, 188, 176],
  [166, 246, 188, 188],
  [166, 270, 188, 200],
];

const v = (o: Record<string, string | number>) => o as CSSProperties;

/**
 * Client Acquisition: paid social + search create attention, which narrows into one lead,
 * gets qualified and lands as a booked call. Attention -> qualified opportunity.
 */
export function AcquisitionWorld({ className = "" }: { className?: string }) {
  const id = useSvgId("acq");
  const grad = id("grad");
  const img = id("img");
  return (
    <WorldStage name="acq" tint="#00b4ff" className={className}>
      <Floor rx={210} cy={348} />
      <div className="wld-plane" style={{ "--rx": "8deg", "--ry": "14deg" } as CSSProperties}>
        <svg className="wld-overlay" viewBox={`0 0 ${W} ${H}`} style={{ transform: z(-40) }}>
          <defs>
            <linearGradient id={grad} x1="0" x2="1">
              <stop offset="0" stopColor="#00b4ff" />
              <stop offset="1" stopColor="#00e5ff" />
            </linearGradient>
          </defs>
          <g className="acq-wire">
            <path d="M136 100 C 160 100, 166 150, 188 150" />
            <path d="M166 244 C 180 244, 176 190, 188 188" />
            <path d="M304 140 C 318 140, 316 86, 330 86" />
            <path d="M398 152 L 398 170" />
          </g>
        </svg>

        {/* A: paid social ad */}
        <Card x={16} y={22} w={120} h={156} depth={-20} className="acq-card">
          <defs>
            <linearGradient id={img} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1877f2" />
              <stop offset="1" stopColor="#5fe3ff" />
            </linearGradient>
          </defs>
          <circle cx="15" cy="15" r="7" fill="#1877f2" />
          <Bar x={27} y={9} w={44} h={4.5} className="wf-ink-bar" />
          <text x="27" y="23" className="acq-micro">Sponsored</text>
          <rect x="8" y="30" width="104" height="74" rx="5" fill={`url(#${img})`} />
          <rect x="44" y="46" width="34" height="44" rx="6" fill="#fff" opacity="0.95" />
          <circle cx="61" cy="62" r="8" fill={`url(#${img})`} />
          <rect x="51" y="76" width="20" height="3.5" rx="1.75" fill="#1877f2" opacity="0.5" />
          <Bar x={8} y={112} w={84} h={5} className="wf-ink-bar" />
          <Bar x={8} y={122} w={60} h={4} />
          <rect x="8" y="132" width="104" height="16" rx="4" className="wf-soft" />
          <rect x="66" y="135" width="42" height="10" rx="3" fill="#1877f2" />
          <rect x="74" y="139" width="26" height="2.5" rx="1.25" fill="#fff" />
        </Card>

        {/* B: search demand */}
        <Card x={16} y={196} w={150} h={98} depth={-10} className="acq-card">
          <rect x="8" y="8" width="134" height="20" rx="10" className="wf-field" />
          <circle cx="20" cy="18" r="2.4" fill="#4285f4" />
          <circle cx="27" cy="18" r="2.4" fill="#ea4335" />
          <circle cx="34" cy="18" r="2.4" fill="#fbbc05" />
          <circle cx="41" cy="18" r="2.4" fill="#34a853" />
          <Bar x={50} y={15.5} w={58} h={5} className="wf-ink-bar" />
          <circle cx="129" cy="17" r="4" fill="none" stroke="var(--ink-3)" strokeWidth="1.6" />
          <path d="M132 20 l3.5 3.5" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="8" y="38" width="17" height="10" rx="2.5" fill="none" stroke="var(--ink-2)" strokeWidth="1" />
          <text x="11" y="46" className="acq-ad">Ad</text>
          <Bar x={30} y={41} w={50} h={4} />
          <rect x="8" y="54" width="112" height="6" rx="3" fill="#3b82f6" />
          <Bar x={8} y={65} w={124} h={3.5} />
          <Bar x={8} y={72} w={96} h={3.5} />
          <g opacity="0.45">
            <Bar x={8} y={84} w={90} h={5} />
          </g>
        </Card>

        {/* C: lead capture */}
        <Card x={188} y={84} w={116} h={156} depth={20} className="acq-card">
          <text x="12" y="22" className="wt-title">Request a call</text>
          <Bar x={12} y={29} w={70} h={3.5} />
          {[40, 66, 92].map((y, i) => (
            <g key={y}>
              <Bar x={12} y={y} w={28} h={3} />
              <rect x="12" y={y + 6} width="92" height="15" rx="4" className="wf-field" />
              <rect x="17" y={y + 11.5} width={[52, 64, 44][i]} height="4" rx="2" className={`wf-ink-bar acq-type acq-type-${i + 1}`} />
            </g>
          ))}
          <g className="acq-submit">
            <rect x="12" y="124" width="92" height="20" rx="6" fill={`url(#${grad})`} />
            <text x="58" y="137.5" textAnchor="middle" className="acq-btn">Submit</text>
          </g>
        </Card>

        {/* D: qualification */}
        <Card x={330} y={24} w={136} h={128} depth={40} className="acq-card">
          <text x="12" y="22" className="wt-title">Qualification</text>
          {["Budget fit", "Timeline", "Service match"].map((t, i) => (
            <g key={t}>
              <rect x="10" y={32 + i * 22} width="116" height="18" rx="5" className="wf-soft" />
              <text x="18" y={44.5 + i * 22} className="wt-label">
                {t}
              </text>
              <Check x={114} y={41 + i * 22} r={5.5} className={`acq-check acq-check-${i + 1}`} />
            </g>
          ))}
          <g className="acq-chip acq-qualified">
            <rect x="10" y="102" width="70" height="17" rx="8.5" className="wf-success-soft" />
            <circle cx="20" cy="110.5" r="3" fill="var(--success)" />
            <text x="27" y="114" className="wt-success">Qualified</text>
          </g>
        </Card>

        {/* E: booking */}
        <Card x={322} y={170} w={144} h={128} depth={55} className="acq-card">
          <rect x="12" y="10" width="16" height="16" rx="4" fill={`url(#${grad})`} />
          <rect x="15" y="16" width="10" height="7" rx="1.5" fill="#fff" />
          <text x="34" y="22" className="wt-title">Book a call</text>
          {Array.from({ length: 21 }, (_, n) => {
            const c = n % 7;
            const r = Math.floor(n / 7);
            const off = n === 2 || n === 6 || n === 13 || n === 15;
            return (
              <rect
                key={n}
                x={12 + c * 17.8}
                y={34 + r * 15}
                width="14"
                height="11"
                rx="2.5"
                className={off ? "wf-soft acq-off" : "wf-cell"}
              />
            );
          })}
          <rect x={12 + 3 * 17.8} y={49} width="14" height="11" rx="2.5" fill={`url(#${grad})`} className="acq-slot" />
          <rect x="12" y="88" width="120" height="1" className="wf-line" />
          <circle cx="22" cy="106" r="8" className="acq-avatar" />
          <Bar x={34} y={100} w={44} h={4.5} className="wf-ink-bar" />
          <Bar x={34} y={109} w={30} h={3.5} />
          <g className="acq-chip acq-booked">
            <rect x="86" y="97" width="48" height="17" rx="8.5" className="wf-success-soft" />
            <text x="110" y="109" textAnchor="middle" className="wt-success">Booked</text>
          </g>
        </Card>

        {/* flow particles */}
        <svg className="wld-overlay" viewBox={`0 0 ${W} ${H}`} style={{ transform: z(70) }}>
          {ATTENTION.map(([x0, y0, x1, y1], i) => (
            <circle
              key={i}
              r="3"
              className="acq-dot"
              style={v({ "--x0": `${x0}px`, "--y0": `${y0}px`, "--x1": `${x1}px`, "--y1": `${y1}px`, "--d": `${i * 160}ms` })}
            />
          ))}
          <circle r="5" className="acq-lead acq-lead-1" />
          <circle r="5" className="acq-lead acq-lead-2" />
        </svg>

        {/* story strip */}
        <Card flat x={24} y={318} w={432} h={46} depth={30} className="acq-strip">
          <rect x="22" y="13" width="388" height="3" rx="1.5" className="wf-soft-strong" />
          <rect x="22" y="13" width="388" height="3" rx="1.5" fill={`url(#${grad})`} className="acq-progress" />
          {["Attention", "Lead", "Qualified", "Booked"].map((t, i) => (
            <g key={t} className={`acq-step acq-step-${i + 1}`}>
              <circle cx={22 + i * 129.3} cy="14.5" r="6.5" className="acq-step-dot" />
              <text x={22 + i * 129.3} y="40" textAnchor="middle" className="wt-step">
                {t}
              </text>
            </g>
          ))}
        </Card>
      </div>
    </WorldStage>
  );
}
