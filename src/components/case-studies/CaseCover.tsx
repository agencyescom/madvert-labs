import { useId } from "react";
import type { CaseStudyCategory } from "@/types/content";
import { categoryLabels } from "./utils";

/**
 * Branded generated cover, used whenever a case study has no real cover image.
 * Pure SVG: a layered "system" mock per category. No numbers, no claims.
 */
const palettes: Record<CaseStudyCategory, [string, string]> = {
  acquisition: ["#00b4ff", "#00e5ff"],
  seo: ["#00d6c9", "#5ee6a8"],
  branding: ["#7c8cff", "#b99bff"],
  studios: ["#ff7a59", "#ffc061"],
  automation: ["#00e5ff", "#34d399"],
  technology: ["#4d7bff", "#00c2ff"],
};

export function CaseCover({ category, className = "", label = true }: { category: CaseStudyCategory; className?: string; label?: boolean }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (s: string) => `cc${raw}${s}`;
  const [a, b] = palettes[category] ?? palettes.acquisition;
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className={`cs-cover ${className}`} role="img" aria-label={`${categoryLabels[category]} growth system illustration`}>
      <defs>
        <linearGradient id={id("bg")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b1a33" />
          <stop offset="0.55" stopColor="#0a1428" />
          <stop offset="1" stopColor="#06101f" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.72" cy="0.28" r="0.6">
          <stop offset="0" stopColor={a} stopOpacity="0.38" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("glow2")} cx="0.1" cy="1" r="0.55">
          <stop offset="0" stopColor={b} stopOpacity="0.2" />
          <stop offset="1" stopColor={b} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("acc")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={id("panel")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.13" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
        </linearGradient>
        <pattern id={id("grid")} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="#ffffff" strokeOpacity="0.05" />
        </pattern>
        <filter id={id("sh")} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000814" floodOpacity="0.55" />
        </filter>
      </defs>
      <rect width="800" height="500" fill={`url(#${id("bg")})`} />
      <rect width="800" height="500" fill={`url(#${id("grid")})`} />
      <rect width="800" height="500" fill={`url(#${id("glow")})`} />
      <rect width="800" height="500" fill={`url(#${id("glow2")})`} />
      {/* sweeping light ribbon */}
      <path d="M-40 420 C 200 330, 420 470, 840 300" fill="none" stroke={`url(#${id("acc")})`} strokeOpacity="0.35" strokeWidth="2" />
      <path d="M-40 446 C 220 360, 460 490, 840 330" fill="none" stroke={`url(#${id("acc")})`} strokeOpacity="0.16" strokeWidth="1.2" />

      <g className="cs-cover-art">
        {/* back panel for depth */}
        <rect x="236" y="70" width="440" height="290" rx="22" fill="#ffffff" fillOpacity="0.035" stroke="#ffffff" strokeOpacity="0.08" />
        <g filter={`url(#${id("sh")})`}>
          <rect x="196" y="100" width="440" height="290" rx="22" fill="#0d1d38" />
          <rect x="196" y="100" width="440" height="290" rx="22" fill={`url(#${id("panel")})`} stroke="#ffffff" strokeOpacity="0.14" />
        </g>
        <circle cx="222" cy="124" r="4" fill="#ffffff" fillOpacity="0.25" />
        <circle cx="236" cy="124" r="4" fill="#ffffff" fillOpacity="0.18" />
        <circle cx="250" cy="124" r="4" fill="#ffffff" fillOpacity="0.12" />
        <rect x="196" y="140" width="440" height="1" fill="#ffffff" fillOpacity="0.1" />
        <Art category={category} acc={`url(#${id("acc")})`} a={a} b={b} />
      </g>

      {label ? (
        <g>
          <rect x="32" y="32" width="8" height="8" rx="2" fill={a} />
          <text x="50" y="40.5" fill="#ffffff" fillOpacity="0.72" fontSize="12" fontWeight="600" letterSpacing="3">
            MADVERT LABS · CASE FILE
          </text>
        </g>
      ) : null}
    </svg>
  );
}

function Art({ category, acc, a, b }: { category: CaseStudyCategory; acc: string; a: string; b: string }) {
  const t = { fill: "#ffffff", fillOpacity: 0.6, fontSize: 12, fontWeight: 600, letterSpacing: 1.5 } as const;
  switch (category) {
    case "seo":
      return (
        <g>
          <rect x="226" y="160" width="380" height="38" rx="19" fill="#ffffff" fillOpacity="0.07" stroke={a} strokeOpacity="0.5" />
          <circle cx="250" cy="179" r="7" fill="none" stroke={a} strokeWidth="2" />
          <path d="M255 184l6 6" stroke={a} strokeWidth="2" strokeLinecap="round" />
          <rect x="272" y="175" width="150" height="8" rx="4" fill="#ffffff" fillOpacity="0.25" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(226 ${216 + i * 40})`}>
              <rect width="380" height="30" rx="10" fill={i === 0 ? a : "#ffffff"} fillOpacity={i === 0 ? 0.16 : 0.05} stroke={i === 0 ? a : "none"} strokeOpacity="0.6" />
              <rect x="14" y="9" width={i === 0 ? 170 : 200 - i * 26} height="5" rx="2.5" fill={i === 0 ? b : "#ffffff"} fillOpacity={i === 0 ? 0.9 : 0.25} />
              <rect x="14" y="18" width={120 - i * 12} height="4" rx="2" fill="#ffffff" fillOpacity="0.14" />
              {i === 0 ? <path d="M352 20l8-9 8 9" fill="none" stroke={b} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /> : null}
            </g>
          ))}
        </g>
      );
    case "branding":
      return (
        <g>
          <rect x="226" y="164" width="150" height="150" rx="20" fill={acc} fillOpacity="0.9" />
          <path d="M262 278V200l39 46 39-46v78" fill="none" stroke="#06101f" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <text x="400" y="232" fill="#ffffff" fillOpacity="0.9" fontSize="64" fontWeight="700">
            Aa
          </text>
          <rect x="400" y="252" width="200" height="6" rx="3" fill="#ffffff" fillOpacity="0.25" />
          <rect x="400" y="266" width="150" height="6" rx="3" fill="#ffffff" fillOpacity="0.14" />
          {[a, b, "#ffffff", "#0a1020"].map((c, i) => (
            <rect key={i} x={226 + i * 96} y="332" width="84" height="38" rx="10" fill={c} fillOpacity={c === "#ffffff" ? 0.85 : 1} stroke="#ffffff" strokeOpacity="0.16" />
          ))}
        </g>
      );
    case "studios":
      return (
        <g>
          <rect x="226" y="162" width="380" height="150" rx="14" fill={acc} fillOpacity="0.22" />
          <path d="M226 290 L320 230 L380 270 L460 200 L606 290 V312 H226Z" fill={acc} fillOpacity="0.35" />
          <circle cx="416" cy="237" r="28" fill="#ffffff" fillOpacity="0.92" />
          <path d="M408 223v28l22-14z" fill="#0a1020" />
          <rect x="226" y="330" width="380" height="8" rx="4" fill="#ffffff" fillOpacity="0.1" />
          <rect x="226" y="330" width="150" height="8" rx="4" fill={acc} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={226 + i * 78} y="350" width="68" height="24" rx="6" fill="#ffffff" fillOpacity={i === 2 ? 0.2 : 0.07} stroke={i === 2 ? b : "none"} />
          ))}
        </g>
      );
    case "automation": {
      const nodes = [
        { x: 270, y: 210, l: "LEAD" },
        { x: 416, y: 180, l: "CRM" },
        { x: 562, y: 210, l: "REPLY" },
        { x: 416, y: 320, l: "BOOKED" },
      ];
      return (
        <g>
          <path d="M270 210 C 330 150, 360 180, 416 180 S 520 160, 562 210 M562 210 C 560 290, 470 320, 416 320 M270 210 C 280 290, 360 320, 416 320" fill="none" stroke={acc} strokeWidth="2.4" strokeOpacity="0.8" strokeDasharray="6 7" />
          {nodes.map((n, i) => (
            <g key={n.l} transform={`translate(${n.x} ${n.y})`}>
              <rect x="-50" y="-22" width="100" height="44" rx="14" fill={i === 3 ? a : "#0f2442"} fillOpacity={i === 3 ? 0.25 : 1} stroke={i === 3 ? b : "#ffffff"} strokeOpacity={i === 3 ? 0.9 : 0.2} />
              <circle cx="-30" cy="0" r="5" fill={i === 3 ? b : a} />
              <text x="-18" y="4.5" {...t}>
                {n.l}
              </text>
            </g>
          ))}
        </g>
      );
    }
    case "technology":
      return (
        <g>
          <rect x="226" y="160" width="100" height="210" rx="12" fill="#ffffff" fillOpacity="0.05" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="240" y={178 + i * 30} width={i === 1 ? 72 : 60} height="10" rx="5" fill={i === 1 ? a : "#ffffff"} fillOpacity={i === 1 ? 0.9 : 0.18} />
          ))}
          <rect x="342" y="160" width="264" height="96" rx="12" fill={acc} fillOpacity="0.2" stroke={a} strokeOpacity="0.4" />
          <path d="M360 236 C 400 230, 420 196, 460 204 S 540 180, 590 178" fill="none" stroke={b} strokeWidth="2.6" strokeLinecap="round" />
          <rect x="342" y="272" width="126" height="98" rx="12" fill="#ffffff" fillOpacity="0.06" />
          <rect x="480" y="272" width="126" height="98" rx="12" fill="#ffffff" fillOpacity="0.06" />
          <text x="358" y="300" {...t} fontSize="10">
            {"</>"}
          </text>
          <rect x="358" y="316" width="90" height="6" rx="3" fill="#ffffff" fillOpacity="0.2" />
          <rect x="358" y="330" width="64" height="6" rx="3" fill="#ffffff" fillOpacity="0.12" />
          <rect x="496" y="292" width="40" height="40" rx="10" fill={acc} />
          <rect x="496" y="344" width="90" height="6" rx="3" fill="#ffffff" fillOpacity="0.16" />
        </g>
      );
    default: {
      const stages = ["REACH", "ENGAGED", "QUALIFIED", "BOOKED"];
      return (
        <g>
          {stages.map((l, i) => {
            const w = 360 - i * 70;
            const x = 416 - w / 2;
            return (
              <g key={l}>
                <rect x={x} y={164 + i * 52} width={w} height="40" rx="12" fill={i === 3 ? a : "#ffffff"} fillOpacity={i === 3 ? 0.3 : 0.06 + i * 0.03} stroke={i === 3 ? b : "#ffffff"} strokeOpacity={i === 3 ? 0.9 : 0.14} />
                <text x={x + 18} y={164 + i * 52 + 24.5} {...t} fillOpacity={i === 3 ? 0.95 : 0.6}>
                  {l}
                </text>
                <circle cx={x + w - 20} cy={164 + i * 52 + 20} r="5" fill={i === 3 ? b : a} fillOpacity={i === 3 ? 1 : 0.6} />
              </g>
            );
          })}
        </g>
      );
    }
  }
}
