"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useInView } from "@/animations/useActiveStep";

const STATES = [
  { key: "broken", label: "A broken process", note: "Work drops through the cracks." },
  { key: "faster", label: "Add AI to it", note: "The broken process just gets faster." },
  { key: "fixed", label: "Fix the process", note: "Every step connects to the next." },
  { key: "leverage", label: "Then give it intelligence", note: "Now speed compounds instead of leaks." },
] as const;

const GAPS = [
  [196, 236],
  [356, 396],
];

function Conveyor({ state }: { state: number }) {
  const broken = state < 2;
  const ai = state === 1 || state === 3;
  const dur = broken ? (ai ? 1.5 : 3.2) : ai ? 1.7 : 3.6;
  const boxes = ai ? 7 : 5;
  return (
    <svg viewBox="0 0 600 280" className="h-auto w-full" role="img" aria-label={`${STATES[state].label}. ${STATES[state].note}`}>
      <defs>
        <linearGradient id="cv-belt" x1="0" x2="1">
          <stop offset="0" stopColor="var(--surface-2)" />
          <stop offset="1" stopColor="var(--surface)" />
        </linearGradient>
        <radialGradient id="cv-engine" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#00e5ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#00b4ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* AI engine */}
      <g transform="translate(70 40)">
        <circle r="44" fill="url(#cv-engine)" className="transition-opacity duration-500" opacity={ai ? 0.55 : 0} />
        <rect x="-30" y="-24" width="60" height="48" rx="12" fill="var(--surface)" stroke={ai ? "#00e5ff" : "var(--line-strong)"} className="transition-[stroke] duration-500" />
        <text y="5" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="var(--font-display)" fill={ai ? "var(--accent-text)" : "var(--ink-3)"}>
          AI
        </text>
        <path d="M0 24 V 92" stroke={ai ? "#00e5ff" : "var(--line-strong)"} strokeDasharray="3 4" />
      </g>

      {/* belt */}
      <rect x="40" y="152" width="520" height="16" rx="8" fill="url(#cv-belt)" stroke="var(--line-strong)" />
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={56 + i * 37} cy="160" r="3" fill="var(--line-strong)" />
      ))}
      {/* gaps, bridged when fixed */}
      {GAPS.map(([a, b]) => (
        <g key={a}>
          <rect x={a} y="148" width={b - a} height="24" fill="var(--bg)" />
          <rect
            x={a - 2}
            y="152"
            width={b - a + 4}
            height="16"
            rx="3"
            fill="rgb(0 200 255 / 0.25)"
            stroke="#00e5ff"
            className="transition-[opacity,transform] duration-700"
            style={{ opacity: broken ? 0 : 1, transform: broken ? "translateY(26px)" : "none", transformBox: "fill-box" }}
          />
        </g>
      ))}

      {/* outcome bin */}
      <g transform="translate(520 116)">
        <rect width="64" height="34" rx="9" fill={broken ? "var(--surface)" : "rgb(0 200 255 / 0.12)"} stroke={broken ? "var(--line-strong)" : "#00e5ff"} className="transition-colors duration-500" />
        <text x="32" y="21.5" textAnchor="middle" fontSize="11" fontWeight="600" fill={broken ? "var(--ink-3)" : "var(--accent-text)"}>
          Revenue
        </text>
      </g>

      {/* work items */}
      <g key={`${state}`}>
        {Array.from({ length: boxes }).map((_, i) => (
          <rect
            key={i}
            x="40"
            y="134"
            width="18"
            height="18"
            rx="4"
            fill={broken ? "#7dd3fc" : "#e0fbff"}
            className={broken ? "cv-fall" : "cv-flow"}
            style={{
              ["--fx" as string]: `${i % 2 === 0 ? 166 : 326}px`,
              animationDuration: `${dur}s`,
              animationDelay: `${(i * dur) / boxes}s`,
            }}
          />
        ))}
      </g>
      <text x="40" y="250" fontSize="12" fill="var(--ink-3)">
        {broken ? "Dropped: missed follow ups, lost data, slow replies" : "Delivered: every enquiry moves to the next step"}
      </text>
    </svg>
  );
}

export function AiLeverage() {
  const [state, setState] = useState(0);
  const [manual, setManual] = useState(false);
  const reduce = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!inView || manual || reduce) return;
    const t = setInterval(() => setState((s) => (s + 1) % STATES.length), 3600);
    return () => clearInterval(t);
  }, [inView, manual, reduce]);

  return (
    <section className="section relative overflow-hidden" aria-labelledby="ai-title">
      <div className="container-x grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 id="ai-title" data-reveal className="t-h1">
            AI Is Not the Strategy. <span className="t-grad">Leverage Is.</span>
          </h2>
          <p data-reveal style={{ ["--reveal-delay" as string]: 80 }} className="t-lead mt-7">
            We are not interested in adding AI because the label looks impressive.
          </p>
          <ul data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="mt-6 space-y-1.5 text-[16.5px] text-ink-2">
            <li className="text-ink">We use it when it removes friction.</li>
            <li>When it responds faster.</li>
            <li>When it qualifies better.</li>
            <li>When it reads data quicker.</li>
            <li>When it follows up consistently.</li>
            <li>When it gives your team hours back.</li>
          </ul>
        </div>

        <div ref={ref} data-reveal="fade" className="lg:col-span-7">
          <div className="panel p-5 sm:p-8">
            <Conveyor state={state} />
            <div role="group" aria-label="Process states" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATES.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={state === i}
                  onClick={() => {
                    setManual(true);
                    setState(i);
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left text-[12.5px] leading-snug transition-colors ${
                    state === i ? "border-[rgb(0_200_255/0.5)] bg-accent-soft text-ink" : "border-line text-ink-3 hover:text-ink"
                  }`}
                >
                  <span className="block font-display text-[11px] font-semibold tracking-[0.14em] text-ink-3">0{i + 1}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-x mt-24 md:mt-28">
        <div className="mx-auto max-w-[940px] text-center">
          <p data-reveal className="t-h1">Adding AI to a Broken Process Just Makes the Broken Process Faster.</p>
          <p data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-h3 t-grad mx-auto mt-6 inline-block">
            Fix the process first. Then give it intelligence.
          </p>
        </div>
      </div>
    </section>
  );
}
