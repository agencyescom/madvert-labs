"use client";

import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { Reveal } from "../ui/motion";
import { RegionReveal } from "../ui/RegionReveal";
import { ExpandButton, Lightbox, VISUALS, useLightbox } from "../ui/Visual";

const COLUMNS = [
  {
    title: "In-house team",
    sub: "Build and manage internally",
    lead: "Potential requirements:",
    items: ["Media Buyer", "Designer", "Copywriter", "Funnel Developer", "CRM / Automation Support", "Training", "Management", "Salaries & Overhead"],
  },
  {
    title: "Traditional agency",
    sub: "Outsource to a marketing agency",
    lead: "A typical model may include:",
    items: ["Monthly Retainer", "Separate Ad Spend", "Possible Setup Fees", "Campaign Management Fees", "Fixed Commitment", "Performance Risk Remains With Client"],
  },
  {
    title: "Madvert Labs Capacity Partnership",
    sub: "A performance-based growth system",
    lead: "Founding beta:",
    items: [
      "$15 Per Accepted Qualified RFQ During Beta",
      "Meta Ad Spend Included",
      "Complete Acquisition System Included",
      "Qualification Defined Upfront",
      "No Traditional Fixed Agency Retainer",
      "Scale With Production Capacity",
    ],
    featured: true,
  },
];

export function ModelComparison() {
  const lb = useLightbox();
  return (
    <section aria-labelledby="compare-title" className="section-y relative border-t border-line">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow justify-center">Business model comparison</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="compare-title" className="display h2 mt-4">
              A simpler way <span className="text-grad">to build customer acquisition.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mx-auto mt-5">Three common ways patch businesses generate new opportunities. Typical models shown — individual teams and agencies vary.</p>
          </Reveal>
        </div>

        {/* Desktop: the uploaded comparison, revealed In-house → Agency → Capacity Partnership */}
        <div className="mx-auto mt-14 hidden max-w-6xl lg:block">
          <div className="visual-frame">
            <div className="visual-frame-inner">
              <RegionReveal
                asset={VISUALS.comparison}
                sizes="(min-width: 1240px) 1150px, 100vw"
                interval={0.75}
                regions={[
                  { inset: "0% 0% 79% 0%" },
                  { inset: "21% 66% 13% 0%", sweep: true },
                  { inset: "21% 35.6% 13% 34.2%", sweep: true },
                  { inset: "21% 0% 13% 64.6%", sweep: true },
                  { inset: "86.5% 0% 0% 0%" },
                ]}
              >
                {(inView) => (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute left-[64.9%] top-[21.8%] h-[64.4%] w-[33%] rounded-[2%]"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: [0, 1, 0.5] } : {}}
                    transition={{ delay: 3.2, duration: 1.6 }}
                    style={{ boxShadow: "0 0 0 2px rgba(0,229,255,0.9), 0 0 60px 8px rgba(0,200,255,0.35)" }}
                  />
                )}
              </RegionReveal>
              <ExpandButton onClick={lb.show} />
            </div>
          </div>
          <Lightbox asset={VISUALS.comparison} open={lb.open} onClose={lb.hide} />
        </div>

        {/* Mobile / tablet: stacked cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:hidden">
          {COLUMNS.map((c, i) => (
            <Reveal key={c.title} delay={0.15 * i}>
              <div
                className={`h-full rounded-[1.25rem] border p-5 ${
                  c.featured ? "theme-dark border-[var(--accent-line)] shadow-[0_30px_80px_-30px_rgba(0,190,255,0.6)]" : "card"
                }`}
              >
                <p className={`text-lg font-extrabold uppercase leading-tight tracking-[-0.01em] ${c.featured ? "text-grad" : ""}`}>{c.title}</p>
                <p className="mt-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-subtle">{c.sub}</p>
                <p className="mt-4 text-[0.8rem] text-muted">{c.lead}</p>
                <ul className="mt-2 grid gap-2">
                  {c.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-[0.92rem] font-semibold">
                      {c.featured ? (
                        <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-grad text-navy">
                          <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                        </span>
                      ) : (
                        <Circle className="mt-1 h-3 w-3 shrink-0 text-subtle" aria-hidden />
                      )}
                      <span className={c.featured ? "" : "text-muted"}>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 lg:hidden">
          <p className="display text-center text-[clamp(1.5rem,4vw,2.4rem)]">
            One clear unit of value:
            <br />
            <span className="text-grad">an accepted qualified RFQ.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

