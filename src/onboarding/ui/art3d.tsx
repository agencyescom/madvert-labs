"use client";

import { useId, type ReactNode } from "react";
import { Icon } from "./kit";

/**
 * Madvert 3D icon set: layered, lit SVG objects (clay / glass style) in the brand blues.
 * Vector, so they stay sharp at any size and weigh almost nothing. They float gently and
 * tilt on hover; motion is disabled under prefers-reduced-motion.
 */

export type ArtName = "business" | "access" | "assets" | "offer" | "kickoff" | "crm";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0" stopColor="#5fb2ff" />
        <stop offset="0.45" stopColor="#1f7bff" />
        <stop offset="1" stopColor="#0a3fb8" />
      </linearGradient>
      <linearGradient id={`${id}-blueDeep`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0d4fd6" />
        <stop offset="1" stopColor="#072a7a" />
      </linearGradient>
      <linearGradient id={`${id}-cyan`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#b8fbff" />
        <stop offset="0.4" stopColor="#3fe6ff" />
        <stop offset="1" stopColor="#00a6e6" />
      </linearGradient>
      <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#cfdbe8" />
        <stop offset="1" stopColor="#8ea3ba" />
      </linearGradient>
      <linearGradient id={`${id}-white`} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#dbe7f3" />
      </linearGradient>
      <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7fd8ff" />
        <stop offset="1" stopColor="#e6f8ff" />
      </linearGradient>
      <linearGradient id={`${id}-flame`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.35" stopColor="#7ff3ff" />
        <stop offset="1" stopColor="#0a8cff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#00e5ff" stopOpacity="0.9" />
        <stop offset="1" stopColor="#00e5ff" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <filter id={`${id}-drop`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0a3fb8" floodOpacity="0.35" />
      </filter>
    </defs>
  );
}

const Shadow = ({ id }: { id: string }) => <ellipse cx="60" cy="110" rx="34" ry="6" fill="#0a3fb8" opacity="0.28" filter={`url(#${id}-soft)`} />;

const ART: Record<ArtName, (id: string) => ReactNode> = {
  business: (id) => (
    <>
      <Shadow id={id} />
      <g filter={`url(#${id}-drop)`}>
        {/* handle */}
        <path d="M44 40v-8a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v8" fill="none" stroke={`url(#${id}-silver)`} strokeWidth="7" strokeLinecap="round" />
        {/* thickness */}
        <rect x="14" y="44" width="92" height="60" rx="15" fill={`url(#${id}-blueDeep)`} />
        {/* body */}
        <rect x="14" y="38" width="92" height="60" rx="15" fill={`url(#${id}-blue)`} />
        <rect x="14" y="62" width="92" height="10" fill="#0a3fb8" opacity="0.35" />
        <path d="M14 66h92" stroke="#9fd2ff" strokeOpacity="0.5" strokeWidth="1.5" />
        {/* clasp */}
        <rect x="52" y="58" width="16" height="18" rx="5" fill={`url(#${id}-cyan)`} />
        <circle cx="60" cy="67" r="12" fill={`url(#${id}-glow)`} opacity="0.6" />
        {/* shine */}
        <path d="M24 42h50a6 6 0 0 1 0 6H30c-4 0-8 3-9 7l-2 6c-1-9 1-19 5-19Z" fill={`url(#${id}-shine)`} />
      </g>
    </>
  ),
  access: (id) => (
    <>
      <Shadow id={id} />
      <g filter={`url(#${id}-drop)`}>
        {/* open shackle */}
        <path d="M40 54V38a20 20 0 0 1 39-6" fill="none" stroke={`url(#${id}-silver)`} strokeWidth="10" strokeLinecap="round" />
        <path d="M44 52V38a16 16 0 0 1 31-5" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="24" y="56" width="72" height="50" rx="15" fill={`url(#${id}-blueDeep)`} />
        <rect x="24" y="50" width="72" height="50" rx="15" fill={`url(#${id}-blue)`} />
        <circle cx="60" cy="72" r="16" fill={`url(#${id}-glow)`} opacity="0.7" />
        <circle cx="60" cy="70" r="7.5" fill="#062a6e" />
        <path d="M57 74h6l2 12h-10Z" fill="#062a6e" />
        <circle cx="60" cy="69" r="3.2" fill={`url(#${id}-cyan)`} />
        <path d="M32 54h40a5 5 0 0 1 0 6H38c-3 0-6 2-7 5l-1 3c-2-7-1-14 2-14Z" fill={`url(#${id}-shine)`} />
      </g>
      {/* sparkles */}
      <path d="M96 22c.8 4.6 3.4 7.2 8 8-4.6.8-7.2 3.4-8 8-.8-4.6-3.4-7.2-8-8 4.6-.8 7.2-3.4 8-8Z" fill={`url(#${id}-cyan)`} className="ob-twinkle" />
    </>
  ),
  assets: (id) => (
    <>
      <Shadow id={id} />
      <g filter={`url(#${id}-drop)`}>
        <g transform="rotate(-14 60 64)">
          <rect x="24" y="30" width="70" height="58" rx="10" fill={`url(#${id}-blueDeep)`} />
        </g>
        <g transform="rotate(-4 60 64)">
          <rect x="22" y="30" width="72" height="60" rx="10" fill={`url(#${id}-blue)`} />
        </g>
        <g transform="rotate(7 60 64)">
          <rect x="22" y="30" width="76" height="62" rx="11" fill={`url(#${id}-white)`} />
          <rect x="28" y="36" width="64" height="44" rx="7" fill={`url(#${id}-sky)`} />
          <circle cx="78" cy="48" r="6.5" fill="#ffd35c" />
          <path d="M28 74l18-20 12 13 9-8 25 21v0a7 7 0 0 1-7 0H35a7 7 0 0 1-7-6Z" fill="#1f7bff" />
          <path d="M28 76l14-14 10 10 8-6 16 14H35a7 7 0 0 1-7-4Z" fill="#0a3fb8" opacity="0.65" />
          <rect x="28" y="84" width="34" height="3.5" rx="1.75" fill="#b9cbe0" />
        </g>
      </g>
    </>
  ),
  offer: (id) => (
    <>
      <Shadow id={id} />
      <g filter={`url(#${id}-drop)`}>
        {/* box */}
        <rect x="22" y="56" width="76" height="50" rx="10" fill={`url(#${id}-blueDeep)`} />
        <rect x="22" y="52" width="76" height="50" rx="10" fill={`url(#${id}-blue)`} />
        {/* lid */}
        <rect x="16" y="40" width="88" height="20" rx="8" fill="#1a63e6" />
        <rect x="16" y="36" width="88" height="20" rx="8" fill={`url(#${id}-blue)`} />
        {/* ribbon */}
        <rect x="52" y="36" width="16" height="66" fill={`url(#${id}-cyan)`} />
        <rect x="52" y="36" width="5" height="66" fill="#ffffff" opacity="0.45" />
        {/* bow */}
        <path d="M60 36c-6-14-26-18-26-6 0 8 14 8 26 6Z" fill={`url(#${id}-cyan)`} />
        <path d="M60 36c6-14 26-18 26-6 0 8-14 8-26 6Z" fill={`url(#${id}-cyan)`} />
        <circle cx="60" cy="35" r="5" fill="#b8fbff" />
        <path d="M24 39h24v4H30c-3 0-5 2-6 4Z" fill={`url(#${id}-shine)`} />
      </g>
      <circle cx="60" cy="36" r="22" fill={`url(#${id}-glow)`} opacity="0.35" />
      <path d="M100 16c.8 4.6 3.4 7.2 8 8-4.6.8-7.2 3.4-8 8-.8-4.6-3.4-7.2-8-8 4.6-.8 7.2-3.4 8-8Z" fill={`url(#${id}-cyan)`} className="ob-twinkle" />
      <path d="M16 20c.5 2.8 2 4.3 4.8 4.8-2.8.5-4.3 2-4.8 4.8-.5-2.8-2-4.3-4.8-4.8 2.8-.5 4.3-2 4.8-4.8Z" fill="#7fdcff" className="ob-twinkle" style={{ animationDelay: "0.8s" }} />
    </>
  ),
  kickoff: (id) => (
    <>
      <ellipse cx="60" cy="112" rx="22" ry="5" fill="#0a3fb8" opacity="0.25" filter={`url(#${id}-soft)`} />
      <g transform="rotate(35 60 60)">
        {/* flame */}
        <path d="M50 88c0 12 10 26 10 26s10-14 10-26Z" fill={`url(#${id}-flame)`} className="ob-flame" />
        {/* fins */}
        <path d="M42 66 28 84l16 2Z" fill={`url(#${id}-blue)`} />
        <path d="M78 66l14 18-16 2Z" fill={`url(#${id}-blueDeep)`} />
        {/* body */}
        <path d="M60 8c16 12 22 32 20 56l-4 24H44l-4-24C38 40 44 20 60 8Z" fill={`url(#${id}-white)`} filter={`url(#${id}-drop)`} />
        <path d="M60 8c-8 6-14 16-17 28h34C74 24 68 14 60 8Z" fill={`url(#${id}-blue)`} />
        {/* window */}
        <circle cx="60" cy="52" r="11" fill="#0a3fb8" />
        <circle cx="60" cy="52" r="8" fill={`url(#${id}-cyan)`} />
        <path d="M55 48a6 6 0 0 1 6-3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <rect x="44" y="84" width="32" height="6" rx="3" fill={`url(#${id}-blueDeep)`} />
        <path d="M48 34c-2 10-2 30 0 46" stroke="#fff" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      <circle cx="22" cy="30" r="2" fill="#7fdcff" className="ob-twinkle" />
      <circle cx="98" cy="20" r="1.6" fill="#7fdcff" className="ob-twinkle" style={{ animationDelay: "0.6s" }} />
      <circle cx="102" cy="74" r="2.2" fill="#b8fbff" className="ob-twinkle" style={{ animationDelay: "1.2s" }} />
    </>
  ),
  crm: (id) => (
    <>
      <Shadow id={id} />
      <g filter={`url(#${id}-drop)`}>
        <rect x="18" y="30" width="84" height="72" rx="16" fill={`url(#${id}-blueDeep)`} />
        <rect x="18" y="24" width="84" height="72" rx="16" fill={`url(#${id}-blue)`} />
        <circle cx="44" cy="52" r="10" fill={`url(#${id}-white)`} />
        <path d="M28 80c2-10 8-15 16-15s14 5 16 15Z" fill={`url(#${id}-white)`} />
        <rect x="66" y="44" width="26" height="6" rx="3" fill={`url(#${id}-cyan)`} />
        <rect x="66" y="56" width="20" height="6" rx="3" fill="#9fd2ff" />
        <rect x="66" y="68" width="24" height="6" rx="3" fill="#9fd2ff" opacity="0.7" />
        <path d="M28 28h52a6 6 0 0 1 0 6H34c-4 0-7 2-8 6l-1 3c-2-9 0-15 3-15Z" fill={`url(#${id}-shine)`} />
      </g>
    </>
  ),
};

export function Art3D({ name, size = 72, className = "", float = true }: { name: ArtName; size?: number; className?: string; float?: boolean }) {
  const id = `a3${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <span className={`ob-art ${float ? "ob-art-float" : ""} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <Defs id={id} />
        {ART[name](id)}
      </svg>
    </span>
  );
}

/** A glossy 3D app-icon tile around a glyph. Use for small icons. */
export function Tile3D({ icon, size = 44, tone = "blue", className = "" }: { icon: string; size?: number; tone?: "blue" | "cyan" | "navy" | "violet"; className?: string }) {
  const bg = {
    blue: "linear-gradient(150deg,#6fb8ff 0%,#1f7bff 45%,#0a3fb8 100%)",
    cyan: "linear-gradient(150deg,#b8fbff 0%,#2fd8ff 45%,#0090d6 100%)",
    navy: "linear-gradient(150deg,#26406e 0%,#101827 60%,#060a14 100%)",
    violet: "linear-gradient(150deg,#c4b5fd 0%,#7c5cff 50%,#4c2fd6 100%)",
  }[tone];
  return (
    <span className={`ob-tile3d ${className}`} style={{ width: size, height: size, background: bg, borderRadius: size * 0.3 }} aria-hidden="true">
      <span className="ob-tile3d-shine" style={{ borderRadius: size * 0.3 }} />
      <Icon name={icon} size={Math.round(size * 0.48)} stroke={2.1} className="relative drop-shadow-[0_2px_2px_rgb(0_20_60/0.45)]" />
    </span>
  );
}
