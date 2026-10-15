import type { ReactNode } from "react";
import { AnalyticsMark, GoogleG, MetaMark, SystemGlyph } from "./BrandMarks";

export type PlatformKind = "meta" | "google" | "search" | "analytics" | "crm" | "ai" | "website" | "sales";

/**
 * A small layered "3D" platform tile: brand badge, label and a mini mock-up of the system.
 * Mock-ups are illustrative only: no numbers, no performance claims.
 * Colours come from --hvp-* tokens defined in src/styles/hero.css (both themes).
 */
export function PlatformTile({ kind, label, uid }: { kind: PlatformKind; label: string; uid: string }) {
  const id = `${uid}-${kind}`;
  return (
    <div className="hvp-tile">
      <div className="hvp-head">
        <span className="hvp-badge">{badge(kind, id)}</span>
        <span className="hvp-label">{label}</span>
        {chip(kind)}
      </div>
      <div className="hvp-body">
        <svg viewBox="0 0 120 56" className="hvp-mock" aria-hidden="true">
          {mock(kind, id)}
        </svg>
      </div>
    </div>
  );
}

function badge(kind: PlatformKind, id: string): ReactNode {
  switch (kind) {
    case "meta":
      return <MetaMark uid={id} className="w-[78%]" />;
    case "google":
      return <GoogleG className="w-[62%]" />;
    case "analytics":
      return <AnalyticsMark className="w-[62%]" />;
    default:
      return <SystemGlyph kind={kind} uid={id} className="w-[66%]" />;
  }
}

function chip(kind: PlatformKind): ReactNode {
  if (kind === "crm") return <span className="hvp-chip">Qualified</span>;
  if (kind === "sales")
    return (
      <span className="hvp-chip hvp-chip--ok">
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <rect x="1.5" y="2.5" width="9" height="8" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M1.5 5h9M4 1.5v2M8 1.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        Booked
      </span>
    );
  return <span className="hvp-dot" />;
}

const SK = "var(--hvp-sk)";
const SK2 = "var(--hvp-sk-2)";
const WELL = "var(--hvp-well)";

function mock(kind: PlatformKind, id: string): ReactNode {
  switch (kind) {
    /* Meta: a sponsored feed post with creative + CTA */
    case "meta":
      return (
        <>
          <defs>
            <linearGradient id={`${id}-img`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#0866FF" stopOpacity="0.85" />
              <stop offset="1" stopColor="#00E5FF" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <rect x="0.5" y="0.5" width="119" height="55" rx="7" fill={WELL} stroke="var(--hvp-hair)" />
          <circle cx="9" cy="8" r="3.6" fill="#0866FF" opacity="0.85" />
          <rect x="16" y="5" width="30" height="3" rx="1.5" fill={SK2} />
          <rect x="16" y="9.6" width="18" height="2.4" rx="1.2" fill={SK} />
          <rect x="5" y="15" width="110" height="24" rx="4" fill={`url(#${id}-img)`} />
          <circle cx="94" cy="27" r="7" fill="#fff" opacity="0.28" />
          <path d="M5 35 L30 24 L46 31 L64 21 L115 35 V39 H5Z" fill="#fff" opacity="0.16" />
          <rect x="5" y="44" width="40" height="3" rx="1.5" fill={SK2} />
          <rect x="5" y="49" width="26" height="2.4" rx="1.2" fill={SK} />
          <rect x="82" y="43" width="33" height="9" rx="4.5" fill="#0866FF" />
          <rect x="88" y="46.6" width="21" height="1.8" rx="0.9" fill="#fff" opacity="0.9" />
        </>
      );
    /* Google: search bar + a sponsored result */
    case "google":
      return (
        <>
          <rect x="0.5" y="0.5" width="119" height="17" rx="8.5" fill={WELL} stroke="var(--hvp-hair)" />
          <circle cx="10" cy="9" r="3.2" fill="none" stroke={SK2} strokeWidth="1.4" />
          <path d="m12.4 11.4 2.2 2.2" stroke={SK2} strokeWidth="1.4" strokeLinecap="round" />
          <rect x="19" y="7.6" width="46" height="2.8" rx="1.4" fill={SK2} />
          <rect x="66" y="5.5" width="0.9" height="7" fill="var(--accent)" className="hvp-caret" />
          <circle cx="98" cy="9" r="1.5" fill="#4285F4" />
          <circle cx="102.5" cy="9" r="1.5" fill="#EA4335" />
          <circle cx="107" cy="9" r="1.5" fill="#FBBC05" />
          <circle cx="111.5" cy="9" r="1.5" fill="#34A853" />
          <rect x="2" y="25" width="17" height="4.6" rx="1.2" fill="none" stroke={SK2} strokeWidth="0.8" />
          <rect x="4.5" y="26.6" width="12" height="1.6" rx="0.8" fill={SK2} />
          <rect x="22" y="26" width="28" height="2.6" rx="1.3" fill={SK} />
          <rect x="2" y="34" width="70" height="3.6" rx="1.8" fill="var(--hvp-link)" />
          <rect x="2" y="42" width="104" height="2.4" rx="1.2" fill={SK} />
          <rect x="2" y="47.5" width="82" height="2.4" rx="1.2" fill={SK} />
        </>
      );
    /* Search: SERP with one result lifted and highlighted */
    case "search":
      return (
        <>
          {[0, 1, 2].map((i) => {
            const y = i * 19;
            const hi = i === 1;
            return (
              <g key={i} opacity={hi ? 1 : 0.75}>
                {hi && <rect x="0.5" y={y + 0.5} width="119" height="17" rx="5" fill="var(--hvp-hi-bg)" stroke="var(--hvp-hi-line)" />}
                {hi && <rect x="0.5" y={y + 4} width="2" height="10" rx="1" fill="var(--accent)" />}
                <circle cx="9" cy={y + 6} r="2.6" fill={hi ? "var(--accent)" : SK2} />
                <rect x="14" y={y + 4.8} width="26" height="2.4" rx="1.2" fill={hi ? "var(--hvp-ok)" : SK} />
                <rect x="6" y={y + 10} width={hi ? 64 : 56} height="3.4" rx="1.7" fill={hi ? "var(--hvp-link)" : SK2} />
                {hi && <path d={`M107 ${y + 11.5} l4 -4.5 l4 4.5 M111 ${y + 7.2} v7`} fill="none" stroke="var(--hvp-ok)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
              </g>
            );
          })}
        </>
      );
    /* Analytics: area trend with live point */
    case "analytics":
      return (
        <>
          <defs>
            <linearGradient id={`${id}-area`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#00B4FF" stopOpacity="0.38" />
              <stop offset="1" stopColor="#00B4FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0.5" y="0.5" width="119" height="55" rx="7" fill={WELL} stroke="var(--hvp-hair)" />
          {[14, 26, 38].map((y) => (
            <path key={y} d={`M6 ${y}H114`} stroke="var(--hvp-hair)" strokeDasharray="2 3" />
          ))}
          <path d="M6 44 C 18 42, 22 36, 32 37 S 48 30, 58 31 S 74 22, 84 23 S 100 12, 110 10 V50 H6Z" fill={`url(#${id}-area)`} />
          <path d="M6 44 C 18 42, 22 36, 32 37 S 48 30, 58 31 S 74 22, 84 23 S 100 12, 110 10" fill="none" stroke="#00B4FF" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="110" cy="10" r="5" fill="#00E5FF" opacity="0.22" className="hvp-ping" />
          <circle cx="110" cy="10" r="2.4" fill="#00E5FF" stroke="var(--hvp-card)" strokeWidth="1" />
          {[10, 26, 42, 58, 74, 90].map((x) => (
            <rect key={x} x={x} y="51" width="8" height="1.6" rx="0.8" fill={SK} />
          ))}
        </>
      );
    /* CRM: contacts moving through stages */
    case "crm": {
      const rows = [
        { c: "#7C8BA6", w: 34, stage: SK2, sw: 16 },
        { c: "#00B4FF", w: 40, stage: "var(--accent)", sw: 20 },
        { c: "#34D399", w: 30, stage: "var(--hvp-ok)", sw: 18 },
      ];
      return (
        <>
          {rows.map((r, i) => {
            const y = i * 19;
            return (
              <g key={i}>
                <rect x="0.5" y={y + 0.5} width="119" height="16" rx="5" fill={i === 1 ? "var(--hvp-hi-bg)" : WELL} stroke={i === 1 ? "var(--hvp-hi-line)" : "var(--hvp-hair)"} />
                <circle cx="9.5" cy={y + 8.5} r="4.4" fill={r.c} opacity="0.85" />
                <circle cx="9.5" cy={y + 7.3} r="1.6" fill="#fff" opacity="0.85" />
                <path d={`M6.6 ${y + 11.4} q2.9 -2.6 5.8 0`} fill="#fff" opacity="0.85" />
                <rect x="18" y={y + 5} width={r.w} height="2.8" rx="1.4" fill={SK2} />
                <rect x="18" y={y + 10} width={r.w * 0.6} height="2.2" rx="1.1" fill={SK} />
                <rect x={112 - r.sw} y={y + 5.5} width={r.sw} height="6" rx="3" fill={r.stage} opacity={i === 0 ? 1 : 0.9} />
              </g>
            );
          })}
        </>
      );
    }
    /* AI: assistant conversation */
    case "ai":
      return (
        <>
          <rect x="52" y="0.5" width="67.5" height="13" rx="6.5" fill={WELL} stroke="var(--hvp-hair)" />
          <rect x="59" y="5.6" width="48" height="2.6" rx="1.3" fill={SK2} />
          <rect x="0.5" y="18" width="92" height="23" rx="7" fill="var(--hvp-hi-bg)" stroke="var(--hvp-hi-line)" />
          <path d="M9 23.5c.4 2.4 1.6 3.6 4 4-2.4.4-3.6 1.6-4 4-.4-2.4-1.6-3.6-4-4 2.4-.4 3.6-1.6 4-4Z" fill="var(--accent)" />
          <rect x="18" y="24" width="64" height="2.6" rx="1.3" fill="var(--hvp-sk-2)" />
          <rect x="18" y="29.6" width="52" height="2.6" rx="1.3" fill={SK} />
          <rect x="18" y="35" width="34" height="2.6" rx="1.3" fill={SK} />
          <g className="hvp-typing">
            <circle cx="8" cy="50" r="1.9" fill="var(--accent)" />
            <circle cx="14" cy="50" r="1.9" fill="var(--accent)" />
            <circle cx="20" cy="50" r="1.9" fill="var(--accent)" />
          </g>
        </>
      );
    /* Website: browser frame with hero + CTA */
    case "website":
      return (
        <>
          <rect x="0.5" y="0.5" width="119" height="55" rx="6" fill={WELL} stroke="var(--hvp-hair)" />
          <path d="M0.5 9.5H119.5" stroke="var(--hvp-hair)" />
          <circle cx="6" cy="5" r="1.5" fill="#FF6159" opacity="0.85" />
          <circle cx="10.5" cy="5" r="1.5" fill="#FFBD2E" opacity="0.85" />
          <circle cx="15" cy="5" r="1.5" fill="#28C840" opacity="0.85" />
          <rect x="34" y="3.2" width="52" height="3.6" rx="1.8" fill={SK} />
          <rect x="7" y="17" width="48" height="4" rx="2" fill={SK2} />
          <rect x="7" y="24" width="38" height="4" rx="2" fill={SK2} />
          <rect x="7" y="32" width="44" height="2.2" rx="1.1" fill={SK} />
          <rect x="7" y="41" width="26" height="8" rx="4" fill="#00B4FF" />
          <rect x="12" y="44.2" width="16" height="1.6" rx="0.8" fill="#03101d" opacity="0.75" />
          <rect x="64" y="15" width="49" height="34" rx="4" fill="var(--hvp-hi-bg)" stroke="var(--hvp-hi-line)" />
          <path d="M70 43 l9 -10 l7 6 l8 -9 l13 13Z" fill="var(--accent)" opacity="0.35" />
          <circle cx="102" cy="22" r="3" fill="var(--accent)" opacity="0.5" />
        </>
      );
    /* Sales: pipeline stages with a deal arriving at the last stage */
    case "sales": {
      const cols = [3, 2, 2, 1];
      return (
        <>
          {cols.map((n, ci) => {
            const x = ci * 30.3;
            const last = ci === 3;
            return (
              <g key={ci}>
                <rect x={x + 0.5} y="0.5" width="28" height="55" rx="5" fill={WELL} stroke="var(--hvp-hair)" />
                <rect x={x + 4} y="4" width={last ? 14 : 18} height="2.4" rx="1.2" fill={last ? "var(--hvp-ok)" : SK2} />
                {Array.from({ length: n }).map((_, k) => (
                  <rect
                    key={k}
                    x={x + 3.5}
                    y={10 + k * 14}
                    width="21"
                    height="11"
                    rx="2.5"
                    fill={last ? "var(--hvp-ok-bg)" : "var(--hvp-card)"}
                    stroke={last ? "var(--hvp-ok)" : "var(--hvp-hair)"}
                    strokeWidth={last ? 0.9 : 1}
                  />
                ))}
              </g>
            );
          })}
          <path d="M100.5 15.5 l2.4 2.4 l4.6 -4.6" fill="none" stroke="var(--hvp-ok)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    }
  }
}
