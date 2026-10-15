import type { CSSProperties } from "react";
import { Bar, Card, Floor } from "./kit";
import { WorldStage } from "./WorldStage";
import { useSvgId } from "./useSvgId";

const TICKS = Array.from({ length: 23 }, (_, i) => i);
const WAVE = Array.from({ length: 52 }, (_, i) => 3 + Math.abs(Math.sin(i * 0.9) * 6 + Math.sin(i * 0.37) * 4));

/**
 * Madvert Studios: an edit suite. A cinematic shot on the monitor, a multi-track timeline with a
 * moving playhead, a short-form vertical cut on the phone and a rotating deck of ad creatives.
 */
export function StudiosWorld({ className = "" }: { className?: string }) {
  const id = useSvgId("st");
  const sky = id("sky");
  const reel = id("reel");
  const clip = id("clip");
  const warm = id("warm");
  const cool = id("cool");
  const mg = id("mg");
  return (
    <WorldStage name="st" tint="#f59e0b" className={className}>
      <Floor rx={210} />
      <div className="wld-plane wld-sway" style={{ "--rx": "8deg", "--ry": "-11deg" } as CSSProperties}>
        {/* cinematic monitor */}
        <Card x={26} y={18} w={304} h={166} depth={-10} className="st-monitor">
          <defs>
            <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a1f74" />
              <stop offset="0.5" stopColor="#d9467c" />
              <stop offset="1" stopColor="#ffb35c" />
            </linearGradient>
            <linearGradient id={warm} x1="0" x2="1">
              <stop offset="0" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#fb7185" />
            </linearGradient>
            <linearGradient id={cool} x1="0" x2="1">
              <stop offset="0" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#e879f9" />
            </linearGradient>
            <linearGradient id={mg} x1="0" x2="1">
              <stop offset="0" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#00b4ff" />
            </linearGradient>
            <clipPath id={clip}>
              <rect x="8" y="8" width="288" height="128" rx="5" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clip})`}>
            <rect x="8" y="8" width="288" height="128" fill={`url(#${sky})`} />
            <circle cx="196" cy="104" r="24" fill="#ffe3a6" className="st-sun" />
            <g className="st-par-1">
              <path d="M-20 120 L40 82 L84 104 L132 70 L190 108 L250 78 L330 116 L330 140 L-20 140 Z" fill="#7a3a8e" opacity="0.85" />
            </g>
            <g className="st-par-2">
              <path d="M-20 128 L30 104 L90 122 L150 96 L210 124 L270 100 L330 126 L330 140 L-20 140 Z" fill="#43246a" />
            </g>
            <g className="st-par-3">
              <path d="M-30 136 C 40 118, 110 128, 160 124 S 280 114, 340 130 L340 140 L-30 140 Z" fill="#1a1433" />
              {/* lone figure for the hero shot */}
              <g transform="translate(116 106)">
                <circle cx="0" cy="0" r="3.4" fill="#1a1433" />
                <path d="M-4 4 Q0 2 4 4 L5 20 L-5 20 Z" fill="#1a1433" />
              </g>
            </g>
            {/* letterbox */}
            <rect x="8" y="8" width="288" height="14" fill="#05060b" />
            <rect x="8" y="122" width="288" height="14" fill="#05060b" />
            <g stroke="#fff" strokeOpacity="0.16" strokeWidth="0.8">
              <path d="M104 22 V122 M200 22 V122 M8 55 H296 M8 89 H296" />
            </g>
            <path d="M138 58 h-8 v8 M166 58 h8 v8 M138 86 h-8 v-8 M166 86 h8 v-8" stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.8" />
            <circle cx="20" cy="15" r="3" fill="#ff3b4e" className="st-rec" />
            <text x="27" y="18.5" className="st-hud">REC</text>
            <text x="286" y="18.5" textAnchor="end" className="st-hud st-mono">00:00:12:08</text>
          </g>
          {/* transport */}
          <path d="M14 146 L14 156 L22 151 Z" fill="#fff" opacity="0.9" />
          <rect x="32" y="149.5" width="230" height="3" rx="1.5" fill="#fff" opacity="0.14" />
          <rect x="32" y="149.5" width="230" height="3" rx="1.5" fill={`url(#${warm})`} className="st-scrub" />
          <Bar x={272} y={149} w={20} h={4} className="st-hud-bar" />
        </Card>

        {/* short-form vertical */}
        <Card x={352} y={30} w={108} h={204} depth={60} className="st-phone">
          <defs>
            <linearGradient id={reel} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor="#7c3aed" />
              <stop offset="0.55" stopColor="#ec4899" />
              <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="98" height="194" rx="14" fill={`url(#${reel})`} />
          <circle cx="54" cy="96" r="44" fill="#fff" opacity="0.08" className="st-pulse" />
          <circle cx="54" cy="84" r="13" fill="#fde6ff" opacity="0.95" />
          <path d="M30 140 Q54 102 78 140 Z" fill="#fde6ff" opacity="0.95" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={12 + i * 29} y="14" width="26" height="2.6" rx="1.3" fill="#fff" opacity="0.35" />
              <rect x={12 + i * 29} y="14" width="26" height="2.6" rx="1.3" fill="#fff" className={`st-seg st-seg-${i + 1}`} />
            </g>
          ))}
          <rect x="14" y="146" width="64" height="11" rx="3" fill="#0a1020" className="st-cap st-cap-1" />
          <rect x="18" y="149.5" width="56" height="4" rx="2" fill="#fde047" className="st-cap st-cap-1" />
          <rect x="14" y="160" width="46" height="11" rx="3" fill="#fff" className="st-cap st-cap-2" />
          <rect x="18" y="163.5" width="38" height="4" rx="2" fill="#0a1020" className="st-cap st-cap-2" />
          <circle cx="92" cy="120" r="6" fill="#fb7185" />
          <circle cx="92" cy="138" r="6" fill="#fff" opacity="0.85" />
          <circle cx="92" cy="156" r="6" fill="#fff" opacity="0.85" />
          <circle cx="16" cy="185" r="5" fill="#fff" />
          <rect x="25" y="183" width="36" height="4" rx="2" fill="#fff" opacity="0.85" />
        </Card>

        {/* motion graphics curve */}
        <Card x={256} y={140} w={88} h={58} depth={85} className="st-curve">
          <text x="9" y="15" className="wt-micro">Motion</text>
          <path d="M10 48 C 40 48, 44 18, 78 18" pathLength={1} className="st-curve-path" />
          <path d="M10 48 L 36 48 M78 18 L 52 18" stroke="var(--ink-3)" strokeWidth="0.8" />
          <circle cx="36" cy="48" r="2.6" fill="#e879f9" />
          <circle cx="52" cy="18" r="2.6" fill="#e879f9" />
          <rect x="6.5" y="44.5" width="7" height="7" transform="rotate(45 10 48)" fill="#f59e0b" />
          <rect x="74.5" y="14.5" width="7" height="7" transform="rotate(45 78 18)" fill="#f59e0b" />
        </Card>

        {/* edit timeline */}
        <Card x={108} y={206} w={268} h={134} depth={40} className="st-timeline">
          <rect x="0" y="0" width="268" height="20" className="wf-chrome" />
          {TICKS.map((i) => (
            <rect key={i} x={30 + i * 10.2} y={i % 4 === 0 ? 10 : 14} width="0.9" height={i % 4 === 0 ? 10 : 6} className="wf-tick" />
          ))}
          {["V2", "V1", "T1", "A1"].map((t, i) => (
            <text key={t} x="9" y={36 + i * 25} className="wt-micro">
              {t}
            </text>
          ))}
          {/* V2 motion graphics */}
          <rect x="44" y="26" width="64" height="16" rx="3.5" fill={`url(#${cool})`} />
          <rect x="138" y="26" width="86" height="16" rx="3.5" fill={`url(#${cool})`} opacity="0.85" />
          {[54, 92, 150, 210].map((x) => (
            <rect key={x} x={x - 2.5} y="31.5" width="5" height="5" transform={`rotate(45 ${x} 34)`} fill="#fff" opacity="0.9" />
          ))}
          {/* V1 video clips with thumbs */}
          {[
            [30, 70],
            [102, 58],
            [162, 92],
          ].map(([x, w], i) => (
            <g key={x}>
              <rect x={x} y="50" width={w} height="20" rx="3.5" fill={`url(#${warm})`} opacity={1 - i * 0.12} />
              <rect x={x + 3} y="53" width="18" height="14" rx="2" fill={`url(#${sky})`} />
              <rect x={x + 25} y="58" width={w - 32} height="3" rx="1.5" fill="#fff" opacity="0.55" />
            </g>
          ))}
          {/* T1 titles */}
          <rect x="62" y="76" width="40" height="14" rx="3.5" fill={`url(#${mg})`} />
          <rect x="176" y="76" width="54" height="14" rx="3.5" fill={`url(#${mg})`} opacity="0.85" />
          {/* A1 waveform */}
          <rect x="30" y="98" width="228" height="22" rx="3.5" className="st-audio-bg" />
          {WAVE.map((h, i) => (
            <rect key={i} x={33 + i * 4.3} y={109 - h / 2} width="2.2" height={h} rx="1.1" className="st-wave" />
          ))}
          {/* playhead */}
          <g className="st-playhead">
            <path d="M132 6 h10 v6 l-5 5 l-5 -5 z" fill="#ff3b4e" />
            <rect x="136.4" y="14" width="1.4" height="114" fill="#ff3b4e" />
          </g>
        </Card>

        {/* ad creative deck */}
        <Card x={30} y={216} w={78} h={98} depth={60} className="st-ad st-ad-1">
          <rect width="78" height="98" fill={`url(#${warm})`} />
          <circle cx="56" cy="30" r="16" fill="#fff" opacity="0.22" />
          <rect x="22" y="30" width="34" height="34" rx="8" fill="#fff" opacity="0.95" />
          <circle cx="39" cy="47" r="9" fill="#fb7185" />
          <rect x="9" y="72" width="50" height="6" rx="3" fill="#fff" />
          <rect x="9" y="82" width="28" height="9" rx="4.5" fill="#0a1020" />
          <text x="70" y="13" textAnchor="end" className="st-tag">1:1</text>
        </Card>
        <Card x={30} y={216} w={78} h={98} depth={60} className="st-ad st-ad-2">
          <rect width="78" height="98" fill={`url(#${cool})`} />
          <path d="M0 70 Q39 40 78 64 V98 H0Z" fill="#fff" opacity="0.18" />
          <rect x="9" y="22" width="56" height="8" rx="4" fill="#fff" />
          <rect x="9" y="34" width="38" height="8" rx="4" fill="#fff" opacity="0.75" />
          <rect x="9" y="80" width="30" height="9" rx="4.5" fill="#fde047" />
          <text x="70" y="13" textAnchor="end" className="st-tag">4:5</text>
        </Card>
        <Card x={30} y={216} w={78} h={98} depth={60} className="st-ad st-ad-3">
          <rect width="78" height="98" fill={`url(#${mg})`} />
          <circle cx="39" cy="46" r="18" fill="#fff" opacity="0.95" />
          <path d="M34 38 L47 46 L34 54 Z" fill="#00b4ff" />
          <rect x="9" y="76" width="44" height="6" rx="3" fill="#fff" />
          <text x="70" y="13" textAnchor="end" className="st-tag">9:16</text>
        </Card>
      </div>
    </WorldStage>
  );
}
