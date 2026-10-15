"use client";

import { useId } from "react";
import type { CSSProperties } from "react";
import { useActiveStep, useInView, useInViewOnce } from "@/animations/useActiveStep";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Glyph } from "@/components/ui/Icon3D";
import "@/styles/owned-demand.css";

/*
 * Demand story: one illustrated scene told in four phases.
 * 0 Ads on → 1 Ad paused → 2 The real problem (no owned demand) → 3 Build both.
 * Desktop: a sticky stage beside the steps, driven by the step in view or the phase tabs.
 * Mobile: every phase is its own stacked block with a compact visual (no pinning).
 * All values are an illustrative shape only. No numbers are shown anywhere.
 */

type Phase = 0 | 1 | 2 | 3;

const PHASES = [
  {
    tab: "Ads on",
    label: "Phase 1 · Paid ads on",
    title: "The campaign is live. It feels like growth.",
    body: "Budget is running, paid traffic arrives and new opportunities climb week after week.",
  },
  {
    tab: "Ad paused",
    label: "Phase 2 · Ad paused",
    title: "Then the budget stops.",
    body: "The paid signal fades almost overnight, and new opportunities slow down sharply with it.",
  },
  {
    tab: "The real problem",
    label: "Phase 3 · The real problem",
    title: "Nothing was holding demand underneath.",
    body: "Search visibility is low. Organic traffic is weak. Few people discover the brand on their own, AI answers do not mention it, and there is not enough content or authority to earn trust.",
  },
  {
    tab: "Build both",
    label: "Phase 4 · Build both",
    title: "Owned demand plugs in under the paid curve.",
    body: "SEO, AI search, content and digital PR build a steadier base that keeps working between campaigns. Paid adds speed on top of it.",
  },
] as const;

/* ───────── illustrative shapes (0–100, no units) ───────── */
const paidRise = [8, 22, 36, 48, 58, 66, 72, 77];
const paidDrop = [77, 38, 15, 8, 5];
const ownedFlat = [3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const ownedGrow = [6, 12, 19, 26, 33, 40, 47, 53, 59, 64, 69, 74];
const paidShare = [8, 18, 26, 30, 32, 32, 30, 28, 26, 24, 22, 20];
const total = ownedGrow.map((v, i) => v + paidShare[i]);

/* opportunities per month (0–10, no units) */
const oppPaid = [1.2, 2, 2.8, 3.6, 4.4, 5.2, 5.8, 6.4, 3, 1.2, 0.7, 0.5];
const oppMixPaid = [1, 1.8, 2.2, 2.4, 2.5, 2.5, 2.4, 2.2, 2.1, 2, 1.9, 1.8];
const oppMixOwned = [0.6, 1, 1.5, 2, 2.6, 3.2, 3.8, 4.2, 4.7, 5.1, 5.5, 5.9];

const DIAGS = [
  { k: "Search visibility", weak: "Low", seg: 1, grow: 4, mod: "SEO", better: "Rising" },
  { k: "Organic traffic", weak: "Weak", seg: 1, grow: 4, mod: "Content", better: "Growing" },
  { k: "Brand discovery", weak: "Weak", seg: 1, grow: 3, mod: "Digital PR", better: "Growing" },
  { k: "AI visibility", weak: "Absent", seg: 0, grow: 3, mod: "AI Search", better: "Emerging" },
  { k: "Authority", weak: "Insufficient", seg: 1, grow: 4, mod: "Digital PR", better: "Building" },
] as const;

const MODULES = [
  { k: "SEO", g: "seo", d: "Rank where buyers search" },
  { k: "AI Search", g: "aiAgents", d: "Get cited in AI answers" },
  { k: "Content", g: "studios", d: "Answer real questions" },
  { k: "Digital PR", g: "branding", d: "Earn authority and mentions" },
] as const;

/* ───────── Campaign card ───────── */
function CampaignCard({ phase }: { phase: Phase }) {
  const on = phase === 0 || phase === 3;
  return (
    <div className={`od-card od-camp ${on ? "is-on" : "is-off"}`}>
      <div className="od-camp-head">
        <span className="od-camp-logo" aria-hidden="true">
          <Glyph name="paidMedia" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="od-k">Campaign</p>
          <p className="od-camp-name">Lead generation</p>
        </div>
        <span className="od-toggle" data-on={on} aria-hidden="true">
          <span />
        </span>
      </div>
      <div className="od-camp-status">
        {on ? (
          <span className="od-pill od-pill-on">
            <i className="od-dot-live" /> Active · Delivering
          </span>
        ) : (
          <span className="od-pill od-pill-off" key="paused">
            <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true">
              <rect x="1.5" y="1" width="2.4" height="8" rx="0.8" fill="currentColor" />
              <rect x="6.1" y="1" width="2.4" height="8" rx="0.8" fill="currentColor" />
            </svg>
            AD PAUSED
          </span>
        )}
      </div>
      <div className="od-camp-rows">
        {["Search ads", "Social ads"].map((r, i) => (
          <div key={r} className="od-camp-row">
            <span>{r}</span>
            <span className="od-track">
              <span className="od-fill" style={{ width: on ? `${i ? 58 : 74}%` : "4%" }} />
            </span>
            <span className="od-camp-state">{on ? "Delivering" : "Not delivering"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Traffic particles ───────── */
function Flow({ phase, vertical = false }: { phase: Phase; vertical?: boolean }) {
  const mode = phase === 0 ? "paid" : phase === 3 ? "both" : "off";
  return (
    <div className={`od-flow ${vertical ? "od-flow-v" : "od-flow-h"}`} data-mode={mode} aria-hidden="true">
      <span className="od-flow-track" />
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="od-flow-p" style={{ "--i": i, animationDelay: `${i * -0.45}s` } as CSSProperties}>
          <i className={mode === "both" && i % 2 ? "is-owned" : ""} />
        </span>
      ))}
    </div>
  );
}

/* ───────── Opportunities (bars, no numbers) ───────── */
function OppsCard({ phase }: { phase: Phase }) {
  const status = ["Climbing", "Slowing sharply", "Stalled", "Steadier"][phase];
  return (
    <div className="od-card od-opps">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="od-k">Pipeline</p>
          <p className="od-camp-name">New opportunities</p>
        </div>
        <span className={`od-trend ${phase === 1 || phase === 2 ? "is-bad" : "is-good"}`}>
          <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
            <path d={phase === 1 || phase === 2 ? "M2 3l4 6 4-6" : "M2 9l4-6 4 6"} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {status}
        </span>
      </div>
      <div className="od-bars">
        {oppPaid.map((v, i) => {
          const future = phase === 0 && i > 7;
          const paid = phase === 3 ? oppMixPaid[i] : future ? 0 : v;
          const owned = phase === 3 ? oppMixOwned[i] : 0;
          return (
            <span key={i} className={`od-bar ${future ? "is-future" : ""}`}>
              <span className="od-bar-paid" style={{ height: `${paid * 10}%`, transitionDelay: `${i * 30}ms` }} />
              <span className="od-bar-owned" style={{ height: `${owned * 10}%`, transitionDelay: `${i * 30}ms` }} />
            </span>
          );
        })}
      </div>
      <div className="od-opps-legend">
        <span>
          <i className="od-sw od-sw-paid" /> From paid
        </span>
        <span className={phase === 3 ? "" : "opacity-40"}>
          <i className="od-sw od-sw-owned" /> From owned demand
        </span>
      </div>
    </div>
  );
}

/* ───────── 12-month curve ───────── */
function Curve({ phase, play, W = 600, H = 200 }: { phase: Phase; play: boolean; W?: number; H?: number }) {
  const uid = useId().replace(/:/g, "");
  const padL = 14;
  const padR = 14;
  const top = 26;
  const bottom = H - 26;
  const X = (i: number) => padL + (i * (W - padL - padR)) / 11;
  const Y = (v: number) => bottom - (v / 100) * (bottom - top);
  const line = (vals: number[], start = 0) => vals.map((v, i) => `${i ? "L" : "M"}${X(i + start).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const area = (upper: number[], lower: number[] = upper.map(() => 0)) =>
    `${line(upper)} ${lower
      .map((_, k) => {
        const i = lower.length - 1 - k;
        return `L${X(i).toFixed(1)} ${Y(lower[i]).toFixed(1)}`;
      })
      .join(" ")} Z`;

  const show = (on: boolean): CSSProperties => ({ strokeDashoffset: play && on ? 0 : 1 });
  const fade = (on: boolean) => (play && on ? 1 : 0);
  const pre = phase < 3;
  const paused = phase === 1 || phase === 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="od-curve block h-auto w-full" role="img" aria-label={["Paid demand rising while ads run.", "After the ad is paused, paid demand drops sharply.", "Owned demand underneath is almost flat: there was nothing holding demand.", "Owned demand grows steadily under the paid curve, so demand holds."][phase]}>
      <defs>
        <linearGradient id={`${uid}-own`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--od-owned)" stopOpacity="0.38" />
          <stop offset="1" stopColor="var(--od-owned)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={`${uid}-drop`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--od-paid)" />
          <stop offset="0.5" stopColor="var(--danger)" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={padL} x2={W - padR} y1={top + (i * (bottom - top)) / 3} y2={top + (i * (bottom - top)) / 3} stroke="var(--line)" />
      ))}
      <text x={padL} y={H - 6} className="od-axis">
        Month 1
      </text>
      <text x={W - padR} y={H - 6} textAnchor="end" className="od-axis">
        Month 12
      </text>

      {/* pause marker */}
      <g className="od-fade" opacity={fade(paused)}>
        <line x1={X(7)} x2={X(7)} y1={top - 8} y2={bottom} stroke="var(--danger)" strokeOpacity="0.55" strokeDasharray="3 5" />
        <rect x={X(7) + 6} y={top - 18} width="78" height="20" rx="10" fill="var(--od-bad-soft)" />
        <text x={X(7) + 45} y={top - 4} textAnchor="middle" className="od-axis od-axis-bad">
          AD PAUSED
        </text>
      </g>

      {/* phase 4: owned base + paid on top */}
      <path d={area(ownedGrow)} fill={`url(#${uid}-own)`} className="od-fade" opacity={fade(phase === 3)} />
      <path d={area(total, ownedGrow)} fill="var(--od-paid)" className="od-fade" opacity={play && phase === 3 ? 0.13 : 0} />
      <path d={line(ownedGrow)} pathLength={1} className="od-draw" stroke="var(--od-owned)" strokeWidth="3" style={show(phase === 3)} />
      <path d={line(total)} pathLength={1} className="od-draw" stroke="var(--od-paid)" strokeWidth="2.4" style={{ ...show(phase === 3), transitionDelay: "0.25s" }} />

      {/* phases 1–3: owned demand absent */}
      <path d={line(ownedFlat)} fill="none" stroke={phase === 2 ? "var(--danger)" : "var(--ink-3)"} strokeWidth={phase === 2 ? 2.4 : 1.6} strokeDasharray="4 5" className="od-fade" opacity={fade(pre) * (phase === 2 ? 1 : 0.55)} />

      {/* paid curve */}
      <path d={line(paidRise)} pathLength={1} className="od-draw" stroke="var(--od-paid)" strokeWidth="2.8" style={show(pre)} />
      <path d={line(paidDrop, 7)} pathLength={1} className="od-draw" stroke={`url(#${uid}-drop)`} strokeWidth="2.8" style={{ ...show(paused), transitionDelay: paused ? "0.15s" : "0s" }} />

      {/* "now" marker while ads run */}
      <g className="od-fade" opacity={fade(phase === 0)}>
        <circle cx={X(7)} cy={Y(paidRise[7])} r="12" fill="var(--od-paid)" opacity="0.18" className="od-ping" />
        <circle cx={X(7)} cy={Y(paidRise[7])} r="4.5" fill="var(--od-paid)" />
      </g>

      {/* labels */}
      <g className="od-fade" opacity={fade(phase === 0)}>
        <text x={X(7) - 10} y={Y(paidRise[7]) - 14} textAnchor="end" className="od-lbl" fill="var(--od-paid-text)">
          Paid demand
        </text>
      </g>
      <g className="od-fade" opacity={fade(phase === 2)}>
        <text x={X(1.6)} y={Y(4) - 10} className="od-lbl" fill="var(--danger)">
          Owned demand: barely there
        </text>
      </g>
      <g className="od-fade" opacity={fade(phase === 3)}>
        <text x={X(11)} y={Y(total[11]) - 12} textAnchor="end" className="od-lbl" fill="var(--od-paid-text)">
          Paid on top
        </text>
        <text x={X(11)} y={Y(ownedGrow[11]) + 32} textAnchor="end" className="od-lbl" fill="var(--od-owned-text)">
          Owned demand
        </text>
      </g>
    </svg>
  );
}

/* ───────── Diagnostics ───────── */
function Diagnostics({ phase, compact = false }: { phase: Phase; compact?: boolean }) {
  const hidden = phase < 2;
  const fixed = phase === 3;
  return (
    <div className={`od-card od-diag ${hidden ? "is-hidden" : ""} ${fixed ? "is-fixed" : "is-weak"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="od-k">Owned demand check</p>
        <span className={`od-badge ${fixed ? "is-good" : hidden ? "" : "is-bad"}`}>{hidden ? "Not visible yet" : fixed ? "Building" : "No owned demand"}</span>
      </div>
      <ul className="od-diag-list">
        {DIAGS.map((d, i) => {
          const segs = fixed ? d.grow : d.seg;
          return (
            <li key={d.k} style={{ transitionDelay: `${i * 70}ms` } as CSSProperties}>
              <span className="od-diag-k">{d.k}</span>
              <span className="od-meter" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((s) => (
                  <i key={s} className={s < segs ? "is-on" : ""} style={{ transitionDelay: `${i * 70 + s * 40}ms` }} />
                ))}
              </span>
              <span className="od-diag-v">
                {fixed && !compact ? <em className="od-plug">+ {d.mod}</em> : null}
                {fixed ? d.better : d.weak}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ───────── Organic modules ───────── */
function Modules({ phase }: { phase: Phase }) {
  const on = phase === 3;
  return (
    <div className={`od-mods ${on ? "is-on" : ""} ${phase === 2 ? "is-missing" : ""}`}>
      {MODULES.map((m, i) => (
        <div key={m.k} className="od-mod" style={{ transitionDelay: on ? `${120 + i * 110}ms` : "0ms" }}>
          <span className="od-mod-socket" aria-hidden="true" />
          <span className="od-mod-ic" aria-hidden="true">
            <Glyph name={m.g} size={22} />
          </span>
          <span className="min-w-0">
            <span className="od-mod-k">{m.k}</span>
            <span className="od-mod-d">{on ? m.d : "Not in place"}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───────── Desktop stage ───────── */
function Stage({ phase, onPick }: { phase: Phase; onPick: (i: number) => void }) {
  const reduce = usePrefersReducedMotion();
  const { ref, seen } = useInViewOnce<HTMLDivElement>(0.25);
  const { ref: liveRef, inView } = useInView<HTMLDivElement>();
  const play = seen || reduce;
  return (
    <div ref={ref}>
      <div ref={liveRef} className={`od-scope od-stage panel ${inView ? "is-live" : ""}`} data-phase={phase}>
        <div role="group" aria-label="Story phases" className="od-tabs">
          {PHASES.map((p, i) => (
            <button key={p.tab} type="button" aria-pressed={phase === i} onClick={() => onPick(i)} className={`od-tab ${phase === i ? "is-active" : ""} ${i < phase ? "is-done" : ""}`}>
              <span className="od-tab-n">{i + 1}</span>
              {p.tab}
            </button>
          ))}
        </div>
        <div className="od-row1">
          <CampaignCard phase={phase} />
          <Flow phase={phase} />
          <OppsCard phase={phase} />
        </div>
        <div className="od-card od-chart">
          <div className="mb-1 flex items-center justify-between gap-3">
            <p className="od-k">Demand over 12 months</p>
            <span className="od-legend">
              <span>
                <i className="od-sw od-sw-paid" /> Paid
              </span>
              <span>
                <i className="od-sw od-sw-owned" /> Owned
              </span>
            </span>
          </div>
          <Curve phase={phase} play={play} W={740} H={160} />
        </div>
        <div className="od-row3">
          <Diagnostics phase={phase} />
          <Modules phase={phase} />
        </div>
      </div>
      <p className="mt-3 text-[12px] text-ink-3">Illustrative pattern, not client data.</p>
    </div>
  );
}

/* ───────── Mobile compact visual for one phase ───────── */
function CompactVisual({ phase }: { phase: Phase }) {
  const reduce = usePrefersReducedMotion();
  const { ref, seen } = useInViewOnce<HTMLDivElement>(0.3);
  const { ref: liveRef, inView } = useInView<HTMLDivElement>();
  const play = seen || reduce;
  // Before the block is seen, the card shows the previous state so the change plays on arrival.
  const shown: Phase = play ? phase : phase === 1 ? 0 : phase;
  return (
    <div ref={ref}>
      <div ref={liveRef} className={`od-scope od-compact ${inView ? "is-live" : ""}`}>
        {phase === 0 && (
          <>
            <CampaignCard phase={0} />
            <Flow phase={0} vertical />
            <OppsCard phase={0} />
          </>
        )}
        {phase === 1 && (
          <>
            <CampaignCard phase={shown} />
            <div className="od-card od-chart">
              <p className="od-k mb-1">Demand over 12 months</p>
              <Curve phase={1} play={play} W={360} H={170} />
            </div>
          </>
        )}
        {phase === 2 && (
          <>
            <Diagnostics phase={play ? 2 : 1} compact />
          </>
        )}
        {phase === 3 && (
          <>
            <Modules phase={play ? 3 : 2} />
            <div className="od-card od-chart">
              <p className="od-k mb-1">Demand over 12 months</p>
              <Curve phase={3} play={play} W={360} H={170} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function DemandStory() {
  const { active, bind, setActive } = useActiveStep<HTMLLIElement>(PHASES.length, 0.5);
  const reduce = usePrefersReducedMotion();
  const base = useId().replace(/:/g, "");
  const phase = active as Phase;

  const pick = (i: number) => {
    setActive(i);
    document.getElementById(`${base}-step-${i}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <div className="od-story relative grid grid-cols-1 lg:grid-cols-12 lg:gap-12">
      <ol className="relative lg:col-span-4">
        {PHASES.map((p, i) => (
          <li
            key={p.tab}
            id={`${base}-step-${i}`}
            ref={bind(i)}
            aria-current={active === i ? "step" : undefined}
            className={`od-step py-10 first:pt-0 lg:flex lg:min-h-[74vh] lg:items-center lg:py-12 lg:transition-opacity lg:duration-500 lg:first:pt-12 ${active === i ? "" : "lg:opacity-35"}`}
          >
            <div className="w-full">
              <p className={`od-step-label ${i === 2 ? "is-bad" : i === 3 ? "is-good" : ""}`}>{p.label}</p>
              <h3 className="t-h3 mt-3">{p.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-2">{p.body}</p>
              {i === 3 && (
                <p className="mt-5 text-[18px] font-semibold leading-snug text-ink">
                  Paid gets you there faster. <span className="t-grad">Organic helps you stay there.</span>
                </p>
              )}
              <div className="mt-6 lg:hidden">
                <CompactVisual phase={i as Phase} />
                {i === 3 && <p className="mt-3 text-[12px] text-ink-3">Illustrative pattern, not client data.</p>}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="hidden lg:col-span-8 lg:block">
        <div className="od-sticky">
          <Stage phase={phase} onPick={pick} />
        </div>
      </div>
    </div>
  );
}
