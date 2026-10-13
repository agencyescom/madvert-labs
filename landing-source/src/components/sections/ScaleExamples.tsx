"use client";

import { CountUp, Reveal } from "../ui/motion";

const ROWS = [100, 200, 300, 500];
const FACTORS = ["Market demand", "Geography", "Qualification criteria", "Campaign performance", "Production capacity", "Sales response speed"];

export function ScaleExamples() {
  return (
    <section aria-labelledby="scale-title" className="section-y relative border-t border-line">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow">Simple arithmetic</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="scale-title" className="display h2 mt-4">
              Scale with your <span className="text-grad">production capacity.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mt-6">Not packages. Not tiers. Just the number of accepted qualified RFQs multiplied by the beta price.</p>
          </Reveal>
          <Reveal delay={0.15} className="mt-8">
            <p className="text-[0.85rem] font-semibold text-muted">Actual available volume depends on:</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {FACTORS.map((f) => (
                <li key={f} className="chip">
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.82rem] text-subtle">Volume is not guaranteed.</p>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-surface-2 px-5 py-3.5 sm:px-6">
              <span className="text-[0.75rem] font-extrabold uppercase tracking-[0.12em]">Illustrative cost examples</span>
              <span className="label-tag">Not a volume forecast</span>
            </div>
            <ul>
              {ROWS.map((n, i) => (
                <Reveal as="li" key={n} delay={0.1 * i} className="grid grid-cols-[1fr_auto_auto_auto] items-baseline gap-3 border-b border-line px-5 py-5 last:border-b-0 sm:gap-6 sm:px-6">
                  <span className="font-mono text-[clamp(1.2rem,2.6vw,1.65rem)] font-bold">
                    <CountUp to={n} />
                    <span className="mt-0.5 block font-sans text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-subtle sm:ml-2 sm:mt-0 sm:inline">accepted RFQs</span>
                  </span>
                  <span className="font-mono text-[clamp(1rem,2vw,1.25rem)] text-muted">× $15</span>
                  <span className="font-mono text-[clamp(1rem,2vw,1.25rem)] text-subtle">=</span>
                  <span className="text-right font-mono text-[clamp(1.3rem,2.8vw,1.9rem)] font-bold">
                    <CountUp to={n * 15} prefix="$" className="text-grad" />
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
