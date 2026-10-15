"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Check, ChevronDown, Megaphone, Route, SquareKanban } from "lucide-react";
import { useState } from "react";
import { Reveal, EASE } from "../ui/motion";

const CLUSTERS = [
  {
    n: "01",
    title: "Acquisition",
    icon: Megaphone,
    summary: "Meta campaigns, funded and run by Madvert Labs.",
    items: [
      "Meta Ad Spend",
      "Meta Ads Management",
      "Campaign Strategy",
      "Audience Testing",
      "Campaign Optimization",
      "Ad Creatives",
      "Ad Copy",
      "Offer Positioning",
    ],
    callout: "Meta ad spend is included in the $15 beta RFQ price.",
  },
  {
    n: "02",
    title: "Conversion",
    icon: Route,
    summary: "A branded RFQ funnel that captures quote-ready detail.",
    items: [
      "Custom Landing Page",
      "Branded RFQ Funnel",
      "Multi-Step Form",
      "Patch Type Selection",
      "Quantity Capture",
      "Size Capture",
      "Backing Selection",
      "Deadline Capture",
      "Artwork Upload",
      "Lead Qualification",
    ],
  },
  {
    n: "03",
    title: "Sales infrastructure",
    icon: SquareKanban,
    summary: "CRM, pipeline and routing so nothing waits.",
    items: [
      "CRM Setup",
      "Pipeline Setup",
      "Contact Records",
      "Opportunity Creation",
      "Lead Routing",
      "Instant Notifications",
      "Sales Stage Tracking",
      "Artwork Access",
      "Email / SMS / supported integrations",
    ],
  },
  {
    n: "04",
    title: "Optimization & reporting",
    icon: BarChart3,
    summary: "Tracking the quality of every RFQ, not just the volume.",
    items: [
      "Campaign Tracking",
      "UTM Attribution",
      "Lead Quality Tracking",
      "RFQ Reporting",
      "Conversion Monitoring",
      "Creative Testing",
      "Funnel Optimization",
      "Ongoing Campaign Optimization",
    ],
  },
];

export function SystemStack() {
  const [open, setOpen] = useState<Set<string>>(new Set(["01"]));
  const toggle = (n: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  return (
    <section id="included" aria-labelledby="included-title" className="section-y relative border-t border-line">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">Complete acquisition infrastructure</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 id="included-title" className="display h2 mt-4">
                One partnership.
                <br />
                <span className="text-grad">The full system.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="lead">
              Four connected layers — built, run and improved by Madvert Labs. Open any layer to see exactly what&rsquo;s inside.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {CLUSTERS.map((c, i) => {
            const isOpen = open.has(c.n);
            const panelId = `cluster-${c.n}`;
            return (
              <Reveal key={c.n} delay={0.06 * i} className="h-fit">
                <div className={`card overflow-hidden transition-[border-color,box-shadow] duration-300 ${isOpen ? "border-[var(--accent-line)] shadow-md" : ""}`}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(c.n)}
                  >
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${
                        isOpen ? "bg-grad text-navy" : "bg-surface-2 text-accent"
                      }`}
                    >
                      <c.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[0.7rem] font-bold text-subtle">{c.n}</span>
                        <span className="text-lg font-extrabold uppercase tracking-[-0.01em] sm:text-xl">{c.title}</span>
                      </span>
                      <span className="mt-0.5 block text-[0.9rem] text-muted">{c.summary}</span>
                    </span>
                    <span className="hidden text-xs font-semibold text-subtle sm:block">{c.items.length} components</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown className="h-5 w-5 text-subtle" aria-hidden />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-line px-5 pb-6 pt-5 sm:px-6">
                          <ul className="grid gap-x-5 gap-y-2.5 sm:grid-cols-2">
                            {c.items.map((it, k) => (
                              <motion.li
                                key={it}
                                className="flex items-start gap-2.5 text-[0.93rem]"
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.04 * k + 0.1 }}
                              >
                                <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                                </span>
                                <span className={it === "Meta Ad Spend" ? "font-bold" : "font-medium"}>{it}</span>
                              </motion.li>
                            ))}
                          </ul>
                          {c.callout && (
                            <p className="mt-5 rounded-xl border border-[var(--accent-line)] bg-accent-soft px-4 py-3 text-[0.82rem] font-extrabold uppercase tracking-[0.06em] text-accent">
                              {c.callout}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* No separate fees */}
        <Reveal className="mt-14">
          <div className="theme-dark relative overflow-hidden rounded-[1.5rem] border border-line p-7 sm:p-10">
            <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(0,200,255,0.22),transparent_65%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <ul className="grid gap-2 sm:grid-cols-3 sm:gap-4">
                {["No separate ad budget.", "No separate agency retainer.", "No separate funnel fee."].map((t) => (
                  <li key={t} className="text-[1.05rem] font-extrabold uppercase tracking-[-0.01em] text-fg/85 sm:text-lg">
                    {t}
                  </li>
                ))}
              </ul>
              <p className="display text-[clamp(1.4rem,2.6vw,2rem)] lg:text-right">
                One accepted qualified RFQ <span className="text-grad">= $15</span>
                <span className="mt-1 block text-[0.45em] font-bold tracking-[0.14em] text-muted">During the founding beta</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
