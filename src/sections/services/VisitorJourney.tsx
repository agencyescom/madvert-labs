"use client";

import { useEffect, useState } from "react";
import { useInViewOnce } from "@/animations/useActiveStep";

const frictions = ["Slow page.", "Confusing headline.", "Weak proof.", "Too many buttons.", "Long form.", "Bad mobile experience."];

/** One visitor, one page. With friction they leave; without it they act. Illustrative, not client data. */
export function VisitorJourney() {
  const [fixed, setFixed] = useState(false);
  const [touched, setTouched] = useState(false);
  const { ref, seen } = useInViewOnce<HTMLDivElement>(0.45);
  useEffect(() => {
    if (!seen || touched) return;
    const t = setTimeout(() => setFixed(true), 3200);
    return () => clearTimeout(t);
  }, [seen, touched]);

  return (
    <div ref={ref} className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
      <div className="lg:col-span-5">
        <div role="group" aria-label="Journey state" className="inline-flex rounded-full border border-line bg-glass p-1">
          {[
            ["With friction", false],
            ["Friction removed", true],
          ].map(([label, v]) => (
            <button
              key={String(label)}
              type="button"
              aria-pressed={fixed === v}
              onClick={() => {
                setTouched(true);
                setFixed(v as boolean);
              }}
              className={`rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors ${fixed === v ? "bg-[linear-gradient(100deg,#00b4ff,#00e5ff)] text-on-accent" : "text-ink-3 hover:text-ink"}`}
            >
              {label as string}
            </button>
          ))}
        </div>
        <ul className="mt-8 space-y-2.5">
          {frictions.map((f) => (
            <li key={f} className="flex items-center gap-3 text-[16.5px]">
              <span className={`grid h-6 w-6 place-items-center rounded-full border transition-colors duration-500 ${fixed ? "border-[#00e5ff] text-accent-text" : "border-[color:var(--danger)] text-danger"}`} aria-hidden="true">
                {fixed ? "✓" : "!"}
              </span>
              <span className={`transition-colors duration-500 ${fixed ? "text-ink-3 line-through decoration-[color:var(--line-strong)]" : "text-ink"}`}>{f}</span>
            </li>
          ))}
        </ul>
        <p className="t-h3 mt-8" aria-live="polite">
          {fixed ? "Same visitor. One clear next step." : "They do not complain. They simply leave."}
        </p>
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        <div className="panel relative overflow-hidden p-4 sm:p-5">
          <div className="flex items-center gap-1.5 border-b border-line pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--line-strong)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--line-strong)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--line-strong)]" />
            <span className="ml-3 h-5 flex-1 rounded-md bg-bg" />
          </div>
          <div className="relative h-1 overflow-hidden bg-transparent">
            <span className={`absolute inset-y-0 left-0 bg-[var(--danger)] transition-all duration-700 ${fixed ? "w-0 opacity-0" : "w-1/3 opacity-80"}`} />
          </div>
          <div className="relative space-y-4 p-4 sm:p-6">
            {/* headline */}
            {fixed ? (
              <div className="space-y-2">
                <div className="h-5 w-4/5 rounded bg-ink/80" />
                <div className="h-3 w-3/5 rounded bg-[var(--line-strong)]" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-[var(--line-strong)]" />
                <div className="h-3 w-11/12 rounded bg-[var(--line-strong)]" />
                <div className="h-3 w-10/12 rounded bg-[var(--line-strong)]" />
                <Flag>Confusing headline</Flag>
              </div>
            )}
            {/* proof */}
            <div className="flex items-center gap-2">
              {Array.from({ length: fixed ? 4 : 1 }).map((_, i) => (
                <span key={i} className={`h-7 flex-1 rounded-md ${fixed ? "bg-accent-soft" : "bg-[var(--line)]"}`} />
              ))}
              {!fixed ? <Flag>Weak proof</Flag> : null}
            </div>
            {/* buttons */}
            <div className="flex flex-wrap gap-2">
              {fixed ? (
                <span className="relative h-10 w-44 rounded-full bg-[linear-gradient(100deg,#00b4ff,#00e5ff)]">
                  <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-white shadow-[0_0_14px_#00e5ff] journey-dot" aria-hidden="true" />
                </span>
              ) : (
                <>
                  {["", "", "", "", ""].map((_, i) => (
                    <span key={i} className="h-9 w-20 rounded-full border border-line-strong" />
                  ))}
                  <Flag>Too many buttons</Flag>
                </>
              )}
            </div>
            {/* form */}
            <div className="space-y-2">
              {Array.from({ length: fixed ? 2 : 7 }).map((_, i) => (
                <span key={i} className="block h-8 rounded-lg border border-line bg-bg" />
              ))}
              {!fixed ? <Flag>Long form</Flag> : null}
            </div>
            {!fixed ? <span className="journey-exit absolute right-5 top-1/2 h-4 w-4 rounded-full bg-white/80" aria-hidden="true" /> : null}
          </div>
        </div>
        <p className="mt-3 text-[12px] text-ink-3">Illustration of a typical journey. Not client data.</p>
      </div>
    </div>
  );
}

function Flag({ children }: { children: string }) {
  return <span className="inline-block rounded-full border border-[color:var(--danger)] px-2 py-0.5 text-[11px] font-medium text-danger">{children}</span>;
}
