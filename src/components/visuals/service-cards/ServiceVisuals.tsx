import { useId, type ReactNode } from "react";

/**
 * Service card artwork. Each visual is a small, layered UI story drawn in SVG.
 * Idle state = the finished story (readable as a still). On card hover / focus, or when the card is in view on
 * touch devices (.scv-live, set by <ServiceCardsLive />), the story replays as a CSS loop. See src/styles/service-cards.css.
 * Every gradient / filter id is derived from useId so the visuals can render more than once per page.
 */

const META = "#0866FF";

function useSid() {
  return "scv" + useId().replace(/[^a-zA-Z0-9]/g, "");
}

function Frame({ id, name, children }: { id: string; name: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 280 156" className={`scv scv-${name}`} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={`${id}sh`} x="-25%" y="-25%" width="150%" height="170%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" className="scv-shc" />
        </filter>
        <filter id={`${id}glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id={`${id}g`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#00b4ff" />
          <stop offset="1" stopColor="#00e5ff" />
        </linearGradient>
        <linearGradient id={`${id}fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#00b4ff" stopOpacity=".35" />
          <stop offset="1" stopColor="#00b4ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="scv-loop k">{children}</g>
    </svg>
  );
}

/** Window / card surface with optional browser dots. */
function Win({ id, x, y, w, h, r = 9, tone = "p", dots = false, className = "" }: { id: string; x: number; y: number; w: number; h: number; r?: number; tone?: "p" | "p2"; dots?: boolean; className?: string }) {
  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx={r} className={`f-${tone} s-st`} strokeWidth=".8" filter={`url(#${id}sh)`} />
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={r - 0.5} fill="none" className="s-hi" strokeWidth=".8" />
      {dots ? (
        <g>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={x + 8 + i * 6} cy={y + 7} r="1.7" className="f-mu2" />
          ))}
        </g>
      ) : null}
    </g>
  );
}

function Bar({ x, y, w, h = 4, tone = "mu" }: { x: number; y: number; w: number; h?: number; tone?: "mu" | "mu2" | "ink" }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} className={`f-${tone}`} />;
}

export function MetaMark({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M3 8c0-3.3 1.7-6 4-6 2.1 0 3.6 2.2 5 4.6C13.4 4.2 14.9 2 17 2c2.3 0 4 2.7 4 6s-1.4 6-3.6 6c-2.2 0-3.6-2.2-5.4-5.4C10.2 11.8 8.8 14 6.6 14 4.4 14 3 11.3 3 8z" fill="none" stroke={META} strokeWidth="2.6" strokeLinejoin="round" />
    </g>
  );
}

export function GoogleG({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  // 48 x 48 source box
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 48})`}>
      <path fill="#FBBC05" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" />
      <path fill="#EA4335" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#34A853" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#4285F4" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" />
    </g>
  );
}

/* ───────── Meta Ads: campaign launches → creative serves → lead arrives → qualified ───────── */
function MetaVisual() {
  const id = useSid();
  return (
    <Frame id={id} name="meta">
      {/* Ads manager panel */}
      <Win id={id} x={8} y={12} w={120} h={132} />
      <MetaMark x={14} y={18} s={0.85} />
      <text x="36" y="28" className="scv-t f-ink2" fontSize="7.5" fontWeight="600">Ads Manager</text>
      <line x1="8" x2="128" y1="35.5" y2="35.5" className="s-st" strokeWidth=".8" />
      <text x="15" y="51" className="scv-t f-ink" fontSize="8" fontWeight="700">Lead campaign</text>
      <rect x="80" y="43" width="22" height="11" rx="5.5" className="m-track k" fill={META} />
      <circle cx="96.5" cy="48.5" r="4" fill="#fff" className="m-knob k" />
      <rect x="15" y="59" width="66" height="13" rx="6.5" className="f-accsoft" />
      <text x="21" y="68.2" className="scv-t f-acc" fontSize="6.8" fontWeight="700">Objective · Leads</text>
      <text x="15" y="88" className="scv-t f-ink3" fontSize="6.8">Delivery</text>
      <circle cx="64" cy="85.6" r="2.4" className="f-succ m-live k" />
      <text x="69" y="88" className="scv-t f-succ" fontSize="6.8" fontWeight="700">Active</text>
      <path d="M15 134 C 30 132, 40 124, 54 121 S 80 108, 92 104 S 110 96, 120 93 L120 138 L15 138Z" fill={`url(#${id}fade)`} className="m-area k" />
      <path d="M15 134 C 30 132, 40 124, 54 121 S 80 108, 92 104 S 110 96, 120 93" fill="none" stroke={META} strokeWidth="1.8" strokeLinecap="round" pathLength={1} className="m-line k" />

      {/* Feed ad creative */}
      <g className="m-ad k">
        <Win id={id} x={110} y={22} w={88} h={122} tone="p2" />
        <circle cx="122" cy="35" r="6" fill={`url(#${id}g)`} />
        <Bar x={132} y={30} w={38} h={4} tone="mu2" />
        <text x="132" y="42" className="scv-t f-ink3" fontSize="5.8">Sponsored</text>
        <rect x="116" y="48" width="76" height="54" rx="5" fill={META} />
        <rect x="116" y="48" width="76" height="54" rx="5" fill={`url(#${id}g)`} opacity=".55" />
        <circle cx="176" cy="88" r="15" fill="#fff" opacity=".16" />
        <circle cx="184" cy="60" r="7" fill="#fff" opacity=".12" />
        <rect x="123" y="58" width="42" height="5" rx="2.5" fill="#fff" opacity=".95" />
        <rect x="123" y="67" width="30" height="5" rx="2.5" fill="#fff" opacity=".6" />
        <rect x="123" y="84" width="22" height="8" rx="4" fill="#fff" opacity=".9" />
        <Bar x={116} y={108} w={54} h={4} />
        <g className="m-cta k">
          <rect x="116" y="118" width="76" height="17" rx="5" fill={META} />
          <text x="154" y="129.4" textAnchor="middle" className="scv-t" fill="#fff" fontSize="7.4" fontWeight="700">Get Quote</text>
        </g>
      </g>

      {/* incoming lead packet */}
      <circle cx="194" cy="126" r="3.6" className="m-pkt k" fill="#00e5ff" />

      {/* Lead card */}
      <g className="m-lead k">
        <Win id={id} x={192} y={38} w={80} h={88} />
        <circle cx="201" cy="49" r="2.5" fill="#00e5ff" />
        <text x="207" y="51.8" className="scv-t f-ink" fontSize="7.5" fontWeight="700">New lead</text>
        <circle cx="207" cy="69" r="8.5" className="f-mu" />
        <circle cx="207" cy="66.5" r="3.2" className="f-ink3" opacity=".6" />
        <path d="M201.5 75 a5.5 4.2 0 0 1 11 0" className="f-ink3" opacity=".6" />
        <Bar x={220} y={63} w={42} h={4.5} tone="mu2" />
        <Bar x={220} y={72} w={30} />
        <Bar x={200} y={85} w={62} />
        <Bar x={200} y={93} w={46} />
        <g className="m-qual k">
          <rect x="200" y="102" width="64" height="16" rx="8" className="f-succsoft s-succ" strokeWidth=".8" />
          <path d="M207 110 l2.6 2.6 4.6 -5" fill="none" className="s-succ" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <text x="218" y="112.8" className="scv-t f-succ" fontSize="7.5" fontWeight="700">Qualified</text>
        </g>
      </g>
    </Frame>
  );
}

/* ───────── Google Ads: query → sponsored result → click → landing page → lead ───────── */
function GoogleVisual() {
  const id = useSid();
  return (
    <Frame id={id} name="google">
      <Win id={id} x={8} y={10} w={168} h={136} />
      <rect x="15" y="17" width="154" height="20" rx="10" className="f-p2 s-st" strokeWidth=".8" />
      <GoogleG x={20} y={21} s={12} />
      <text x="38" y="30.2" className="scv-t f-ink" fontSize="8">plumber near me</text>
      <rect x="37" y="21" width="64" height="13" className="f-p2 g-type k" />
      <rect x="37" y="22" width="1.2" height="11" fill="#00b4ff" className="g-caret k" />
      <circle cx="157" cy="26.5" r="3.6" fill="none" stroke="#4285F4" strokeWidth="1.4" />
      <path d="M159.6 29.2 l2.6 2.6" stroke="#4285F4" strokeWidth="1.4" strokeLinecap="round" />

      <g className="g-results k">
        <g className="g-ad k">
          <rect x="12" y="43" width="160" height="42" rx="6" className="g-adbg" />
          <text x="17" y="52" className="scv-t f-ink" fontSize="6.6" fontWeight="700">Sponsored</text>
          <circle cx="21" cy="60" r="4" fill={`url(#${id}g)`} />
          <text x="28" y="62.4" className="scv-t f-ink3" fontSize="6.4">yourbusiness.com</text>
          <text x="17" y="74" className="scv-t f-link" fontSize="9" fontWeight="600">Same Day Plumbing Help</text>
          <rect x="17" y="74.8" width="98" height=".9" className="f-link g-ul k" />
          <Bar x={17} y={79} w={120} h={3.5} />
        </g>
        {[93, 119].map((y) => (
          <g key={y}>
            <circle cx="21" cy={y + 3} r="3.6" className="f-mu2" />
            <Bar x={28} y={y + 1} w={44} h={3.5} />
            <Bar x={17} y={y + 10} w={y === 93 ? 104 : 88} h={5} tone="mu2" />
            <Bar x={17} y={y + 18} w={y === 93 ? 126 : 110} h={3.5} />
          </g>
        ))}
      </g>

      {/* Landing page */}
      <g className="g-land k">
        <Win id={id} x={150} y={32} w={122} h={114} dots />
        <rect x="174" y="36" width="80" height="7" rx="3.5" className="f-p2" />
        <circle cx="179" cy="39.5" r="1.6" className="f-succ" />
        <rect x="157" y="50" width="108" height="34" rx="5" fill={`url(#${id}g)`} opacity=".16" />
        <Bar x={163} y={57} w={62} h={5} tone="ink" />
        <Bar x={163} y={66} w={44} h={4} tone="mu2" />
        <rect x="157" y="90" width="108" height="11" rx="3" className="f-p2 s-st g-f1 k" strokeWidth=".8" />
        <rect x="157" y="104" width="108" height="11" rx="3" className="f-p2 s-st g-f2 k" strokeWidth=".8" />
        <Bar x={161} y={94} w={30} h={3} tone="mu2" />
        <Bar x={161} y={108} w={40} h={3} tone="mu2" />
        <g className="g-btn k">
          <rect x="157" y="120" width="108" height="16" rx="5" fill={`url(#${id}g)`} />
          <text x="211" y="130.6" textAnchor="middle" className="scv-t" fill="#03101d" fontSize="7.2" fontWeight="700">Request a Call</text>
        </g>
      </g>

      {/* Cursor */}
      <g className="g-cursor k">
        <circle cx="92" cy="72" r="7" fill="#00b4ff" opacity=".25" className="g-ripple k" />
        <path d="M92 72 l0 12 l3.2 -3 l2.4 5 l2 -1 l-2.4 -5 l4.4 -.4z" fill="#fff" stroke="#0a1020" strokeWidth=".9" strokeLinejoin="round" />
      </g>

      <g className="g-toast k">
        <rect x="186" y="10" width="86" height="18" rx="9" className="f-p s-succ" strokeWidth=".8" filter={`url(#${id}sh)`} />
        <circle cx="196" cy="19" r="4.6" className="f-succ" />
        <path d="M194 19 l1.5 1.5 2.8 -3" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="204" y="21.6" className="scv-t f-ink" fontSize="7" fontWeight="700">Lead received</text>
      </g>
    </Frame>
  );
}

/* ───────── SEO: a result climbing from the bottom of the page to the top ───────── */
function SeoVisual() {
  const id = useSid();
  const rowY = (i: number) => 42 + i * 21;
  const others = [
    { w: 132, cls: "s-a" },
    { w: 118, cls: "s-b" },
    { w: 140, cls: "s-c" },
    { w: 110, cls: "s-d" },
  ];
  return (
    <Frame id={id} name="seo">
      <Win id={id} x={8} y={8} w={264} h={140} />
      <rect x="16" y="15" width="176" height="17" rx="8.5" className="f-p2 s-st" strokeWidth=".8" />
      <circle cx="25" cy="23.2" r="3.2" fill="none" className="s-ink3" strokeWidth="1.2" />
      <path d="M27.4 25.6 l2.2 2.2" className="s-ink3" strokeWidth="1.2" strokeLinecap="round" />
      <text x="34" y="26" className="scv-t f-ink" fontSize="7.4">commercial cleaning services</text>
      <text x="202" y="26" className="scv-t f-ink3" fontSize="6.4">All   Maps   News</text>
      <rect x="202" y="29" width="8" height="1.4" rx=".7" fill="#00b4ff" />
      <line x1="8" x2="272" y1="36.5" y2="36.5" className="s-st" strokeWidth=".8" />
      {others.map((o, i) => (
        <g key={o.cls} className={`${o.cls} k`}>
          <circle cx="22" cy={rowY(i + 1) + 3} r="3.4" className="f-mu2" />
          <Bar x={29} y={rowY(i + 1) + 1.2} w={46} h={3.4} />
          <Bar x={18} y={rowY(i + 1) + 9} w={o.w} h={5} tone="mu2" />
        </g>
      ))}
      <g className="s-you k">
        <rect x="12" y={rowY(0) - 4} width="256" height="21" rx="6" className="f-accsoft" />
        <rect x="12" y={rowY(0) - 4} width="256" height="21" rx="6" fill="none" stroke={`url(#${id}g)`} strokeWidth=".9" />
        <circle cx="22" cy={rowY(0) + 3} r="3.6" fill={`url(#${id}g)`} />
        <text x="29" y={rowY(0) + 5.2} className="scv-t f-acc" fontSize="6.4" fontWeight="600">yourbrand.com</text>
        <text x="18" y={rowY(0) + 14} className="scv-t f-ink" fontSize="8" fontWeight="700">Commercial Cleaning You Can Rely On</text>
        <g className="s-arrow k">
          <circle cx="255" cy={rowY(0) + 6.5} r="7" fill={`url(#${id}g)`} />
          <path d={`M255 ${rowY(0) + 10} v-7 m-3 3 l3 -3.2 3 3.2`} fill="none" stroke="#03101d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </Frame>
  );
}

/* ───────── AI Search: a business question, an answer, and the brand surfaced as a cited source ───────── */
function AiVisual() {
  const id = useSid();
  const star = (cx: number, cy: number, r: number) => `M${cx} ${cy - r} C ${cx + r * 0.18} ${cy - r * 0.18}, ${cx + r * 0.18} ${cy - r * 0.18}, ${cx + r} ${cy} C ${cx + r * 0.18} ${cy + r * 0.18}, ${cx + r * 0.18} ${cy + r * 0.18}, ${cx} ${cy + r} C ${cx - r * 0.18} ${cy + r * 0.18}, ${cx - r * 0.18} ${cy + r * 0.18}, ${cx - r} ${cy} C ${cx - r * 0.18} ${cy - r * 0.18}, ${cx - r * 0.18} ${cy - r * 0.18}, ${cx} ${cy - r}Z`;
  return (
    <Frame id={id} name="ai">
      <Win id={id} x={8} y={8} w={264} h={140} />
      <circle cx="22" cy="21" r="7.5" fill={`url(#${id}g)`} />
      <path d={star(22, 21, 4.6)} fill="#fff" />
      <text x="34" y="23.8" className="scv-t f-ink" fontSize="8" fontWeight="700">AI Assistant</text>
      <rect x="226" y="15" width="38" height="12" rx="6" className="f-p2 s-st" strokeWidth=".8" />
      <text x="245" y="23.2" textAnchor="middle" className="scv-t f-ink3" fontSize="6">Search</text>
      <line x1="8" x2="272" y1="33.5" y2="33.5" className="s-st" strokeWidth=".8" />

      <g className="a-q k">
        <rect x="112" y="40" width="152" height="20" rx="10" className="a-user" />
        <text x="121" y="52.6" className="scv-t f-ink" fontSize="7.4">Who should we hire for B2B lead gen?</text>
      </g>

      <circle cx="20" cy="73" r="5.5" fill={`url(#${id}g)`} />
      <path d={star(20, 73, 3.2)} fill="#fff" />
      <g className="a-dots k">
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={32 + i * 6} cy="73" r="2" className={`f-ink3 a-dot a-dot${i} k`} />
        ))}
      </g>
      <g className="a-ans k">
        <Bar x={30} y={67} w={176} h={4.5} tone="mu2" />
        <Bar x={30} y={76} w={150} h={4.5} />
      </g>

      <g className="a-cite k">
        <rect x="30" y="86" width="190" height="31" rx="8" fill={`url(#${id}g)`} opacity=".45" filter={`url(#${id}glow)`} className="a-glow k" />
        <rect x="30" y="86" width="190" height="31" rx="8" className="f-p2" />
        <rect x="30" y="86" width="190" height="31" rx="8" fill="none" stroke={`url(#${id}g)`} strokeWidth="1.1" />
        <rect x="37" y="93" width="17" height="17" rx="5" fill={`url(#${id}g)`} />
        <path d="M41.5 105 l4 -7.5 4 7.5" fill="none" stroke="#03101d" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <text x="60" y="100.5" className="scv-t f-ink" fontSize="8" fontWeight="700">Your Brand</text>
        <Bar x={60} y={105} w={92} h={3.6} />
        <rect x="178" y="94" width="34" height="13" rx="6.5" className="f-accsoft" />
        <text x="195" y="102.8" textAnchor="middle" className="scv-t f-acc" fontSize="6.4" fontWeight="700">Cited [1]</text>
      </g>

      <g className="a-src k">
        <text x="30" y="133.5" className="scv-t f-ink3" fontSize="6.2">Sources</text>
        <rect x="58" y="126" width="60" height="11" rx="5.5" className="f-accsoft" />
        <rect x="58" y="126" width="60" height="11" rx="5.5" fill="none" stroke={`url(#${id}g)`} strokeWidth=".8" />
        <circle cx="64" cy="131.5" r="2.4" fill={`url(#${id}g)`} />
        <text x="69" y="133.6" className="scv-t f-acc" fontSize="5.8" fontWeight="600">yourbrand.com</text>
        <rect x="122" y="126" width="38" height="11" rx="5.5" className="f-mu" />
        <rect x="164" y="126" width="30" height="11" rx="5.5" className="f-mu" />
      </g>
    </Frame>
  );
}

/* ───────── Full Stack Development: web app + mobile app + API + product UI ───────── */
function DevVisual() {
  const id = useSid();
  return (
    <Frame id={id} name="dev">
      <Win id={id} x={8} y={14} w={176} h={124} dots />
      <rect x="13" y="27" width="26" height="106" rx="5" className="f-p2" />
      <rect x="18" y="33" width="16" height="16" rx="4" fill={`url(#${id}g)`} />
      {[56, 66, 76, 86].map((y, i) => (
        <rect key={y} x="18" y={y} width="16" height="4" rx="2" className={i === 0 ? "f-acc" : "f-mu2"} opacity={i === 0 ? 0.9 : 1} />
      ))}
      {[44, 90, 136].map((x, i) => (
        <g key={x} className={`d-kpi d-kpi${i} k`}>
          <rect x={x} y="27" width="42" height="24" rx="5" className="f-p2 s-st" strokeWidth=".8" />
          <Bar x={x + 5} y={32} w={18} h={3} />
          <Bar x={x + 5} y={39} w={26} h={6} tone="mu2" />
          <circle cx={x + 35} cy="34" r="2.6" className={i === 2 ? "f-succ" : "f-acc"} opacity=".9" />
        </g>
      ))}
      <rect x="44" y="56" width="92" height="77" rx="5" className="f-p2 s-st" strokeWidth=".8" />
      <Bar x={50} y={62} w={34} h={3.5} tone="mu2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={51 + i * 11.5} y={126 - (14 + i * 6.5)} width="7" height={14 + i * 6.5} rx="2" fill={`url(#${id}g)`} opacity={0.45 + i * 0.08} className={`d-bar k`} style={{ animationDelay: `${i * 70}ms` }} />
      ))}
      <rect x="140" y="56" width="40" height="77" rx="5" className="f-p2 s-st" strokeWidth=".8" />
      {[64, 76, 88, 100, 112, 124].map((y, i) => (
        <g key={y}>
          <circle cx="146" cy={y + 1.5} r="2.4" className={i === 1 ? "f-succ" : "f-mu2"} />
          <Bar x={151} y={y} w={i % 2 ? 20 : 24} h={3} />
        </g>
      ))}

      {/* Mobile app */}
      <g className="d-phone k">
        <rect x="204" y="30" width="62" height="118" rx="12" className="f-p s-st" strokeWidth=".9" filter={`url(#${id}sh)`} />
        <rect x="226" y="34" width="18" height="4" rx="2" className="f-mu2" />
        <rect x="210" y="43" width="50" height="28" rx="6" fill={`url(#${id}g)`} />
        <Bar x={215} y={50} w={26} h={4} tone="ink" />
        <rect x="215" y="59" width="18" height="6" rx="3" fill="#fff" opacity=".85" />
        {[78, 94, 110].map((y, i) => (
          <g key={y} className={`d-row d-row${i} k`}>
            <rect x="210" y={y} width="50" height="13" rx="4" className="f-p2" />
            <circle cx="217" cy={y + 6.5} r="3.6" className={i === 0 ? "f-acc" : "f-mu2"} />
            <Bar x={224} y={y + 3.5} w={26} h={2.8} tone="mu2" />
            <Bar x={224} y={y + 7.6} w={18} h={2.4} />
          </g>
        ))}
        <line x1="210" x2="260" y1="130" y2="130" className="s-st" strokeWidth=".8" />
        {[218, 230, 242, 254].map((x, i) => (
          <circle key={x} cx={x} cy="138" r="2.3" className={i === 0 ? "f-acc" : "f-mu2"} />
        ))}
      </g>

      {/* API card */}
      <g className="d-api k">
        <rect x="120" y="112" width="80" height="36" rx="7" className="f-p s-st" strokeWidth=".9" filter={`url(#${id}sh)`} />
        <rect x="126" y="118" width="21" height="10" rx="3" className="f-succsoft" />
        <text x="136.5" y="125.3" textAnchor="middle" className="scv-t f-succ" fontSize="5.6" fontWeight="700">POST</text>
        <text x="151" y="125.6" className="scv-t scv-mono f-ink" fontSize="6.4">/api/leads</text>
        <rect x="126" y="132" width="21" height="10" rx="3" className="f-accsoft" />
        <text x="136.5" y="139.3" textAnchor="middle" className="scv-t f-acc" fontSize="5.6" fontWeight="700">GET</text>
        <text x="151" y="139.6" className="scv-t scv-mono f-ink" fontSize="6.4">/api/crm</text>
      </g>
      <circle cx="200" cy="124" r="2.6" fill="#00e5ff" className="d-pkt d-pkt0 k" />
      <circle cx="160" cy="112" r="2.6" fill="#00e5ff" className="d-pkt d-pkt1 k" />

      {/* Product UI component */}
      <g className="d-ui k">
        <rect x="190" y="8" width="76" height="17" rx="8.5" fill={`url(#${id}g)`} filter={`url(#${id}sh)`} />
        <circle cx="200" cy="16.5" r="4" fill="#03101d" opacity=".2" />
        <text x="232" y="19" textAnchor="middle" className="scv-t" fill="#03101d" fontSize="6.8" fontWeight="700">Book a call</text>
      </g>
    </Frame>
  );
}

/* ───────── Branding: identity cards, type + colour sheet, packaging ───────── */
function BrandMark({ x, y, s = 1, color = "#fff" }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 14 C 4 4, 10 4, 12 10 S 20 16, 24 6" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="24" cy="6" r="2.6" fill="#ff7a59" />
    </g>
  );
}

function BrandVisual() {
  const id = useSid();
  return (
    <Frame id={id} name="brand">
      {/* Identity: stacked business cards */}
      <g className="b-id k">
        <g transform="rotate(-9 58 66)">
          <rect x="12" y="38" width="94" height="56" rx="6" fill="#0b1a33" filter={`url(#${id}sh)`} />
          <BrandMark x={44} y={56} s={1.1} />
        </g>
        <g transform="rotate(4 70 104)">
          <rect x="22" y="78" width="94" height="56" rx="6" fill="#ffffff" stroke="rgb(10 35 70 / .12)" strokeWidth=".8" filter={`url(#${id}sh)`} />
          <BrandMark x={30} y={88} s={0.75} color="#0b1a33" />
          <text x="30" y="118" fill="#0b1a33" fontSize="7.4" fontWeight="800" letterSpacing="1.4" className="scv-t scv-display">YOUR BRAND</text>
          <rect x="30" y="122" width="40" height="2.6" rx="1.3" fill="#0b1a33" opacity=".25" />
        </g>
      </g>

      {/* Typography + colour sheet */}
      <g className="b-type k">
        <Win id={id} x={112} y={12} w={84} h={132} />
        <text x="120" y="30" className="scv-t f-ink3" fontSize="5.8" letterSpacing=".6">TYPEFACE</text>
        <text x="119" y="62" className="scv-t scv-display f-ink" fontSize="32" fontWeight="700">Aa</text>
        <Bar x={120} y={72} w={64} h={6} tone="ink" />
        <Bar x={120} y={83} w={52} h={4} tone="mu2" />
        <Bar x={120} y={91} w={58} h={3} />
        <text x="120" y="108" className="scv-t f-ink3" fontSize="5.8" letterSpacing=".6">COLOUR</text>
        {["#0b1a33", "#00b4ff", "#00e5ff", "#ff7a59"].map((c, i) => (
          <rect key={c} x={120 + i * 17} y="114" width="14" height="22" rx="4" fill={c} stroke="rgb(255 255 255 / .2)" strokeWidth=".6" className={`b-sw b-sw${i} k`} />
        ))}
      </g>

      {/* Packaging: shopping bag */}
      <g className="b-bag k">
        <path d="M216 44 c0 -14, 26 -14, 26 0" fill="none" className="s-ink3" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="204" y="42" width="66" height="102" rx="6" fill="#0b1a33" filter={`url(#${id}sh)`} />
        <rect x="204" y="42" width="66" height="102" rx="6" fill={`url(#${id}g)`} opacity=".14" />
        <rect x="204" y="42" width="66" height="8" rx="3" fill="#000" opacity=".22" />
        <path d="M216 50 v4 M242 50 v4" className="s-ink3" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="216" cy="49" r="1.8" fill="#ffffff" opacity=".5" />
        <circle cx="242" cy="49" r="1.8" fill="#ffffff" opacity=".5" />
        <g className="b-mark k">
          <BrandMark x={223} y={80} s={1.15} />
        </g>
        <text x="237" y="118" textAnchor="middle" fill="#fff" fontSize="6.4" fontWeight="800" letterSpacing="1.2" className="scv-t scv-display">YOUR BRAND</text>
      </g>
    </Frame>
  );
}

/* ───────── Short form video: vertical edit, timeline, final social video ───────── */
function ShortVisual() {
  const id = useSid();
  const clips = [
    { x: 98, w: 40 },
    { x: 140, w: 32 },
    { x: 174, w: 48 },
    { x: 224, w: 38 },
  ];
  return (
    <Frame id={id} name="short">
      <Win id={id} x={8} y={8} w={264} h={140} />
      {/* phone preview */}
      <g>
        <rect x="18" y="16" width="62" height="110" rx="9" fill="#0a1a33" filter={`url(#${id}sh)`} />
        <rect x="18" y="16" width="62" height="110" rx="9" fill={`url(#${id}g)`} opacity=".42" />
        <circle cx="49" cy="56" r="11" fill="#d7efff" opacity=".9" />
        <path d="M30 104 c0 -18, 38 -18, 38 0 v22 h-38z" fill="#d7efff" opacity=".85" />
        <rect x="23" y="21" width="52" height="2" rx="1" fill="#fff" opacity=".3" />
        <rect x="23" y="21" width="52" height="2" rx="1" fill="#fff" className="v-prog k" />
        <g className="v-cap v-cap0 k">
          <rect x="26" y="88" width="46" height="11" rx="3" fill="#fff" />
          <text x="49" y="95.8" textAnchor="middle" fill="#0a1020" fontSize="6" fontWeight="800" className="scv-t scv-display">WAIT FOR IT</text>
        </g>
        <g className="v-cap v-cap1 k">
          <rect x="26" y="88" width="46" height="11" rx="3" fill="#00e5ff" />
          <text x="49" y="95.8" textAnchor="middle" fill="#03101d" fontSize="6" fontWeight="800" className="scv-t scv-display">HERE IS WHY</text>
        </g>
        <g fill="#fff" opacity=".9">
          <path d="M73 62 c-2.4 -2.6 -6 -.4 -4 2.4 l4 3.8 4 -3.8 c2 -2.8 -1.6 -5 -4 -2.4z" className="v-heart k" />
          <circle cx="73" cy="76" r="3" fill="none" stroke="#fff" strokeWidth="1.2" />
          <path d="M70.5 86 l5 2.5 -5 2.5z" />
        </g>
      </g>
      {/* inspector */}
      <text x="90" y="25" className="scv-t f-ink" fontSize="7.4" fontWeight="700">Edit · Reel</text>
      <rect x="138" y="17" width="24" height="11" rx="5.5" className="f-accsoft" />
      <text x="150" y="25" textAnchor="middle" className="scv-t f-acc" fontSize="6.2" fontWeight="700">9:16</text>
      {[38, 50].map((y, i) => (
        <g key={y}>
          <Bar x={90} y={y} w={32} h={3} />
          <rect x="128" y={y} width="134" height="3" rx="1.5" className="f-mu" />
          <rect x="128" y={y} width={i ? 60 : 92} height="3" rx="1.5" fill={`url(#${id}g)`} />
          <circle cx={128 + (i ? 60 : 92)} cy={y + 1.5} r="3" className="f-p s-st" strokeWidth="1" />
        </g>
      ))}
      {/* timeline */}
      <line x1="88" x2="264" y1="64.5" y2="64.5" className="s-st" strokeWidth=".8" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={98 + i * 14} y="67" width=".8" height={i % 3 ? 2.4 : 4} className="f-ink3" opacity=".7" />
      ))}
      <text x="88" y="84" className="scv-t f-ink3" fontSize="5.8" fontWeight="700">V1</text>
      <text x="88" y="100" className="scv-t f-ink3" fontSize="5.8" fontWeight="700">T1</text>
      <text x="88" y="117" className="scv-t f-ink3" fontSize="5.8" fontWeight="700">A1</text>
      {clips.map((c, i) => (
        <g key={c.x} className={`v-clip k`} style={{ animationDelay: `${i * 90}ms` }}>
          <rect x={c.x} y="76" width={c.w} height="12" rx="3" fill={`url(#${id}g)`} opacity={0.55 + (i % 2) * 0.25} />
          <rect x={c.x + 2} y="78" width="8" height="8" rx="1.5" fill="#fff" opacity=".35" />
        </g>
      ))}
      {[{ x: 102, w: 30 }, { x: 150, w: 26 }, { x: 196, w: 36 }].map((c) => (
        <rect key={c.x} x={c.x} y="95" width={c.w} height="7" rx="2.5" className="f-ink" opacity=".75" />
      ))}
      {Array.from({ length: 40 }).map((_, i) => {
        const h = 3 + Math.abs(Math.sin(i * 1.7) * 8) + (i % 5 === 0 ? 3 : 0);
        return <rect key={i} x={98 + i * 4.1} y={115 - h / 2} width="2.2" height={h} rx="1.1" fill="#00b4ff" opacity=".55" />;
      })}
      <g className="v-head k">
        <rect x="97.4" y="66" width="1.4" height="58" fill="#ff7a59" />
        <path d="M94.6 64 h7 v4 l-3.5 3 -3.5 -3z" fill="#ff7a59" />
      </g>
      <g className="v-exp k">
        <rect x="190" y="128" width="74" height="13" rx="6.5" className="f-succsoft s-succ" strokeWidth=".8" />
        <path d="M197 134.5 l2 2 3.6 -4" fill="none" className="s-succ" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="206" y="137" className="scv-t f-succ" fontSize="6.4" fontWeight="700">Exported 9:16</text>
      </g>
    </Frame>
  );
}

/* ───────── Motion graphics: frames on a motion path, keyframes, kinetic type, final render ───────── */
function MotionVisual() {
  const id = useSid();
  const ghosts = [
    { x: 34, y: 92 },
    { x: 66, y: 82 },
    { x: 98, y: 54 },
    { x: 130, y: 42 },
  ];
  return (
    <Frame id={id} name="motion">
      <Win id={id} x={8} y={8} w={264} h={140} />
      {/* stage */}
      <rect x="16" y="16" width="162" height="90" rx="6" className="f-p2" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={16 + (i + 1) * 18} x2={16 + (i + 1) * 18} y1="16" y2="106" className="s-st" strokeWidth=".5" opacity=".7" />
      ))}
      <path d="M34 92 C 60 96, 70 56, 98 54 S 140 34, 162 32" fill="none" stroke="#00b4ff" strokeWidth="1.2" strokeDasharray="2 3" pathLength={1} className="mo-path" />
      {[{ x: 34, y: 92 }, { x: 98, y: 54 }, { x: 162, y: 32 }].map((p) => (
        <rect key={p.x} x={p.x - 3} y={p.y - 3} width="6" height="6" transform={`rotate(45 ${p.x} ${p.y})`} fill="#00e5ff" stroke="#03101d" strokeWidth=".6" />
      ))}
      {ghosts.map((g, i) => (
        <rect key={g.x} x={g.x - 7} y={g.y - 7} width="14" height="14" rx="4" fill="#00b4ff" fillOpacity={0.14 + i * 0.12} className={`mo-ghost mo-ghost${i} k`} />
      ))}
      <g className="mo-obj k">
        <rect x="155" y="25" width="14" height="14" rx="4" fill={`url(#${id}g)`} filter={`url(#${id}sh)`} />
      </g>
      {/* final frame */}
      <rect x="186" y="16" width="78" height="90" rx="6" fill="#0a1a33" filter={`url(#${id}sh)`} />
      <rect x="186" y="16" width="78" height="90" rx="6" fill={`url(#${id}g)`} opacity=".22" />
      <text x="192" y="28" fill="#fff" opacity=".6" fontSize="5.4" letterSpacing=".6" className="scv-t">FINAL FRAME</text>
      <text x="193" y="52" fill="#fff" fontSize="12" fontWeight="800" className="scv-t scv-display mo-l mo-l0 k">MAKE</text>
      <text x="193" y="66" fill="#fff" fontSize="12" fontWeight="800" className="scv-t scv-display mo-l mo-l1 k">IT</text>
      <text x="193" y="86" fill="#00e5ff" fontSize="19" fontWeight="800" className="scv-t scv-display mo-l mo-l2 k">MOVE</text>
      <rect x="193" y="91" width="40" height="2.4" rx="1.2" fill="#00e5ff" className="mo-under k" />
      <rect x="238" y="54" width="16" height="16" rx="5" fill="#ff7a59" opacity=".9" className="mo-shape k" />
      {/* timeline */}
      <line x1="16" x2="264" y1="113.5" y2="113.5" className="s-st" strokeWidth=".8" />
      <text x="18" y="125" className="scv-t f-ink3" fontSize="5.8" fontWeight="700">Shape</text>
      <text x="18" y="139" className="scv-t f-ink3" fontSize="5.8" fontWeight="700">Type</text>
      <rect x="44" y="120" width="216" height="6" rx="3" className="f-mu" />
      <rect x="44" y="134" width="216" height="6" rx="3" className="f-mu" />
      {[52, 108, 168].map((x) => (
        <rect key={x} x={x - 3} y="120" width="6" height="6" transform={`rotate(45 ${x} 123)`} fill="#00b4ff" />
      ))}
      {[150, 186, 214, 246].map((x) => (
        <rect key={x} x={x - 3} y="134" width="6" height="6" transform={`rotate(45 ${x} 137)`} fill="#00e5ff" />
      ))}
      <path d="M52 123 C 80 123, 84 123, 108 123" stroke="#00b4ff" strokeWidth=".8" opacity=".6" />
      <g className="mo-head k">
        <rect x="51.4" y="114" width="1.4" height="30" fill="#ff7a59" />
        <circle cx="52.1" cy="115" r="2.4" fill="#ff7a59" />
      </g>
      <g className="mo-render k">
        <rect x="216" y="98" width="44" height="13" rx="6.5" className="f-succsoft s-succ" strokeWidth=".8" />
        <path d="M222 104.5 l2 2 3.6 -4" fill="none" className="s-succ" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="230" y="107.2" className="scv-t f-succ" fontSize="6.2" fontWeight="700">Render</text>
      </g>
    </Frame>
  );
}

export const serviceVisuals = {
  meta: MetaVisual,
  google: GoogleVisual,
  seo: SeoVisual,
  ai: AiVisual,
  dev: DevVisual,
  brand: BrandVisual,
  short: ShortVisual,
  motion: MotionVisual,
} as const;

export type ServiceVisualKey = keyof typeof serviceVisuals;

export function ServiceVisual({ name }: { name: ServiceVisualKey }) {
  const V = serviceVisuals[name];
  return (
    <div className="scv-box" data-scv>
      <V />
    </div>
  );
}
