"use client";

import { StickyStory } from "@/components/story/StickyStory";
import { Glyph, type IconName } from "@/components/ui/Icon3D";

export const loopStages: { name: string; line: string; icon: IconName }[] = [
  { name: "Diagnose", line: "We look beneath the visible symptom.", icon: "seo" },
  { name: "Build", line: "We create what the business actually needs.", icon: "development" },
  { name: "Connect", line: "We make the pieces talk to each other.", icon: "systems" },
  { name: "Compound", line: "We measure what works and strengthen it.", icon: "growth" },
];

export function LoopDiagram({ active, className = "" }: { active: number; className?: string }) {
  // Four stations on a circle; the arc fills up to the active station.
  const R = 150;
  const C = 200;
  const pts = loopStages.map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 2;
    return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
  });
  const circ = 2 * Math.PI * R;
  const progress = (active + 1) / loopStages.length;
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[460px] ${className}`}>
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="loop-g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#00b4ff" />
            <stop offset="1" stopColor="#00e5ff" />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--line-strong)" strokeWidth="2" />
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="url(#loop-g)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          transform={`rotate(-90 ${C} ${C})`}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.16,1,.3,1)", filter: "drop-shadow(0 0 6px rgb(0 200 255 / .6))" }}
        />
        <circle cx={C} cy={C} r="86" fill="var(--surface)" stroke="var(--line)" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="t-label">Madvert Growth Loop</p>
          <p className="mt-2 font-display text-[26px] font-semibold tracking-tight text-ink">{loopStages[active].name}</p>
        </div>
      </div>
      {pts.map((p, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(p.x / 400) * 100}%`, top: `${(p.y / 400) * 100}%` }}
        >
          <span
            className={`grid h-14 w-14 place-items-center rounded-2xl border bg-surface transition-[border-color,box-shadow,transform] duration-500 ${
              i <= active ? "border-[#00e5ff] shadow-[0_0_0_6px_rgb(0_200_255/0.08),0_0_28px_rgb(0_200_255/0.35)]" : "border-line-strong"
            } ${i === active ? "scale-110" : ""}`}
          >
            <Glyph name={loopStages[i].icon} size={28} />
          </span>
        </div>
      ))}
    </div>
  );
}

export function GrowthLoop() {
  const steps = loopStages.map((s, i) => (
    <div key={s.name}>
      <p className="font-display text-[13px] font-semibold tracking-[0.2em] text-accent-text">0{i + 1}</p>
      <h3 className="t-h1 mt-3">{s.name}</h3>
      <p className="t-lead mt-4">{s.line}</p>
    </div>
  ));
  return <StickyStory steps={steps} stage={(a) => <LoopDiagram active={a} />} stageSide="left" />;
}
