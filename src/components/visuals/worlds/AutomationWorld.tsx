import type { CSSProperties, ReactNode } from "react";
import { Bar, Card, Floor, W, H, z } from "./kit";
import { WorldStage } from "./WorldStage";
import { useSvgId } from "./useSvgId";

type Node = { x: number; y: number; title: string; sub: string; tone: string; icon: ReactNode };

const NW = 110;
const NH = 64;

function nodes(g: string): Node[] {
  return [
    {
      x: 24,
      y: 50,
      title: "New lead",
      sub: "Form · ad · call",
      tone: "#00b4ff",
      icon: (
        <g>
          <circle cx="0" cy="-3" r="3.6" fill="#fff" />
          <path d="M-6.5 7 Q0 -1 6.5 7 Z" fill="#fff" />
        </g>
      ),
    },
    {
      x: 185,
      y: 50,
      title: "WhatsApp",
      sub: "Instant reply",
      tone: "#25d366",
      icon: (
        <g>
          <path d="M0 -7.5 A7.5 7.5 0 1 1 -6.2 4.3 L-7.6 8 L-3.6 6.6 A7.5 7.5 0 0 0 0 -7.5 Z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M-2.8 -2.6 q0.6 3.8 5 5.4 l1.4 -1.4 l-2 -1 l-0.8 0.8 q-1.8 -0.8 -2.4 -2.4 l0.8 -0.8 l-1 -2 z" fill="#fff" />
        </g>
      ),
    },
    {
      x: 346,
      y: 50,
      title: "AI qualify",
      sub: "Intent + fit",
      tone: `url(#${g})`,
      icon: <path d="M0 -8 C1 -2 2 -1 8 0 C2 1 1 2 0 8 C-1 2 -2 1 -8 0 C-2 -1 -1 -2 0 -8 Z" fill="#fff" />,
    },
    {
      x: 346,
      y: 164,
      title: "CRM",
      sub: "Pipeline stage",
      tone: "#6366f1",
      icon: (
        <g fill="#fff">
          <rect x="-7.5" y="-6.5" width="4" height="13" rx="1.2" />
          <rect x="-2" y="-6.5" width="4" height="9" rx="1.2" />
          <rect x="3.5" y="-6.5" width="4" height="5" rx="1.2" />
        </g>
      ),
    },
    {
      x: 185,
      y: 164,
      title: "Follow-up",
      sub: "Sequence",
      tone: "#f59e0b",
      icon: <path d="M-7.5 -1 L7.5 -7 L2 7.5 L-0.5 1.5 Z M-0.5 1.5 L7.5 -7" fill="#fff" stroke="#fff" strokeWidth="0.8" strokeLinejoin="round" />,
    },
    {
      x: 24,
      y: 164,
      title: "Booking",
      sub: "Calendar slot",
      tone: "#14b8a6",
      icon: (
        <g>
          <rect x="-7" y="-5.5" width="14" height="13" rx="2.5" fill="#fff" />
          <rect x="-7" y="-5.5" width="14" height="4" rx="1.5" fill="#fff" opacity="0.6" />
          <rect x="-3.5" y="-8.5" width="1.8" height="4" rx="0.9" fill="#fff" />
          <rect x="1.7" y="-8.5" width="1.8" height="4" rx="0.9" fill="#fff" />
        </g>
      ),
    },
  ];
}

/**
 * Automation & Revenue Systems: a live workflow canvas. One lead moves on its own from capture to
 * WhatsApp, AI qualification, CRM, follow-up and booking, and every step reports into one view.
 */
export function AutomationWorld({ className = "" }: { className?: string }) {
  const id = useSvgId("au");
  const grad = id("grad");
  const ai = id("ai");
  const dots = id("dots");
  const list = nodes(ai);
  return (
    <WorldStage name="au" tint="#00e5ff" className={className}>
      <Floor rx={215} cy={356} />
      <div className="wld-plane" style={{ "--rx": "10deg", "--ry": "-8deg" } as CSSProperties}>
        <Card x={8} y={12} w={464} h={346} depth={-12} className="au-canvas">
          <defs>
            <pattern id={dots} width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" className="au-dot" />
            </pattern>
            <linearGradient id={grad} x1="0" x2="1">
              <stop offset="0" stopColor="#00b4ff" />
              <stop offset="1" stopColor="#00e5ff" />
            </linearGradient>
            <linearGradient id={ai} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#00e5ff" />
            </linearGradient>
          </defs>
          <rect width="464" height="346" fill={`url(#${dots})`} />
          <text x="16" y="24" className="wt-title">Lead workflow</text>
          <circle cx="111" cy="20" r="3" fill="var(--success)" className="au-live" />
          <text x="118" y="23.5" className="wt-micro">Running</text>
        </Card>

        {/* edges (just under the node plane so they meet node edges) */}
        <svg className="wld-overlay" viewBox={`0 0 ${W} ${H}`} style={{ transform: z(18) }}>
          <g className="au-edge">
            <path d="M134 82 H185" />
            <path d="M295 82 H346" />
            <path d="M401 114 V164" />
            <path d="M346 196 H295" />
            <path d="M185 196 H134" />
            <path d="M79 228 C 79 270, 92 304, 120 304" />
            <path d="M401 228 C 401 270, 388 304, 360 304" className="au-edge-soft" />
          </g>
          <g className="au-flow">
            <path d="M134 82 H185" />
            <path d="M295 82 H346" />
            <path d="M401 114 V164" />
            <path d="M346 196 H295" />
            <path d="M185 196 H134" />
            <path d="M79 228 C 79 270, 92 304, 120 304" />
          </g>
        </svg>

        {list.map((n, i) => (
          <Card key={n.title} x={n.x} y={n.y} w={NW} h={NH} depth={20} className="au-node">
            <rect x="0.75" y="0.75" width={NW - 1.5} height={NH - 1.5} rx="10" className={`au-ring au-ring-${i + 1}`} />
            <rect x="10" y="10" width="26" height="26" rx="8" fill={n.tone} />
            <g transform="translate(23 23)">{n.icon}</g>
            <text x="44" y="22" className="wt-title">
              {n.title}
            </text>
            <text x="44" y="34" className="wt-micro">
              {n.sub}
            </text>
            <rect x="10" y="46" width="90" height="4" rx="2" className="wf-soft-strong" />
            <rect x="10" y="46" width="90" height="4" rx="2" fill={`url(#${grad})`} className={`au-bar au-bar-${i + 1}`} />
            <circle cx="98" cy="12" r="3.2" className={`au-status au-status-${i + 1}`} />
          </Card>
        ))}

        {/* reporting */}
        <Card x={120} y={270} w={240} h={74} depth={20} className="au-node">
          <rect x="0.75" y="0.75" width="238.5" height="72.5" rx="10" className="au-ring au-ring-7" />
          <text x="12" y="20" className="wt-title">Reporting</text>
          <text x="12" y="32" className="wt-micro">Source to booking</text>
          {[18, 26, 22, 32, 30, 40, 46].map((h, i) => (
            <rect key={i} x={112 + i * 17} y={62 - h} width="10" height={h} rx="2.5" fill={`url(#${grad})`} opacity={0.45 + i * 0.08} className="au-rep" style={{ "--d": `${i * 60}ms` } as CSSProperties} />
          ))}
          <Bar x={12} y={46} w={70} h={4} className="wf-ink-bar" />
          <Bar x={12} y={55} w={52} h={3.5} />
        </Card>

        {/* context pop-ups */}
        <Card flat x={200} y={122} w={108} h={30} depth={50} className="au-pop au-pop-wa">
          <path d="M14 6 l4 -6 l6 6 z" className="au-wa-bubble" />
          <rect x="0" y="5" width="108" height="24" rx="12" className="au-wa-bubble" />
          <rect x="12" y="12" width="56" height="4" rx="2" className="wf-ink-bar" />
          <rect x="12" y="19" width="36" height="3.5" rx="1.75" className="wf-line" />
          <text x="98" y="20" textAnchor="end" className="wt-micro">now</text>
        </Card>
        <Card flat x={360} y={118} w={80} h={22} depth={60} className="au-pop au-pop-q">
          <rect x="0" y="0" width="80" height="20" rx="10" className="wf-success-solid" />
          <text x="40" y="13.8" textAnchor="middle" className="wt-on-success">Qualified</text>
        </Card>
        <Card flat x={38} y={232} w={70} h={22} depth={60} className="au-pop au-pop-b">
          <rect x="0" y="0" width="70" height="20" rx="10" className="wf-success-solid" />
          <text x="35" y="13.8" textAnchor="middle" className="wt-on-success">Booked</text>
        </Card>

        {/* the lead */}
        <svg className="wld-overlay" viewBox={`0 0 ${W} ${H}`} style={{ transform: z(22) }}>
          <g className="au-token">
            <circle r="11" className="au-token-halo" />
            <circle r="6.5" fill={`url(#${grad})`} stroke="#fff" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </WorldStage>
  );
}
