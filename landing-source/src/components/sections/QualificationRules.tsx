"use client";

import { motion } from "framer-motion";
import { Minus } from "lucide-react";
import { Reveal, EASE, AnimatedCheck, useSequence } from "../ui/motion";
import { RegionReveal } from "../ui/RegionReveal";
import { ExpandButton, Lightbox, VISUALS, useLightbox } from "../ui/Visual";

const RULES = [
  {
    n: "01",
    title: "Patch category",
    body: "Only approved products count.",
    chips: ["Embroidered", "PVC", "Chenille", "Woven", "Leather", "Printed"],
  },
  {
    n: "02",
    title: "Minimum quantity",
    body: "We agree on the minimum commercial quantity that makes sense for your manufacturing operation.",
  },
  {
    n: "03",
    title: "Project details",
    body: "The RFQ can require:",
    chips: ["Quantity", "Patch Type", "Size", "Backing", "Deadline", "Project Details"],
  },
  {
    n: "04",
    title: "Artwork",
    body: "Artwork, logo or reference-file requirements can be defined according to your sales process.",
  },
  {
    n: "05",
    title: "Target customer",
    body: "Define the customers you want to quote:",
    chips: ["Geography", "Buyer Type", "Order Range", "Other criteria"],
  },
];

const ACCEPTED = ["Valid contact", "Approved patch type", "Minimum quantity met", "Deadline provided", "Artwork uploaded", "U.S. market"];
const REJECTED = ["Missing contact information", "Quantity below agreed threshold", "Unsupported geography", "No project details"];

export function QualificationRules() {
  return (
    <section id="qualified" aria-labelledby="qual-title" className="section-y relative border-t border-line bg-bg-2">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="eyebrow">Qualification policy</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 id="qual-title" className="display h2 mt-4">
                  We define <span className="text-grad">&ldquo;qualified&rdquo;</span> before we launch.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="lead mt-6">Your sales team should know exactly what it is paying for.</p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted">
                  Criteria are agreed with you <strong className="text-fg">in writing</strong> before a single campaign goes live — so
                  both sides are working to the same definition.
                </p>
              </Reveal>
            </div>
          </div>

          <ol className="relative lg:col-span-7">
            <span aria-hidden className="absolute bottom-6 left-[1.35rem] top-6 w-px bg-line" />
            {RULES.map((r, i) => (
              <Reveal as="li" key={r.n} delay={0.05 * i} className="relative pb-5 pl-16 last:pb-0">
                <span className="absolute left-0 top-1 grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface font-mono text-sm font-bold text-accent shadow-sm">
                  {r.n}
                </span>
                <div className="card card-hover p-5 sm:p-6">
                  <h3 className="text-lg font-extrabold uppercase tracking-[-0.01em]">{r.title}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{r.body}</p>
                  {r.chips && (
                    <ul className="mt-3.5 flex flex-wrap gap-1.5">
                      {r.chips.map((c) => (
                        <li key={c} className="chip">
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Accepted vs not accepted */}
        <div className="mt-20 lg:mt-28">
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h3 className="display h3 max-w-xl">Every RFQ is reviewed against the agreed criteria.</h3>
            <span className="label-tag">Example criteria · set per partner</span>
          </Reveal>

          {/* Desktop: the uploaded visual, revealed card by card */}
          <DesktopComparison />

          {/* Mobile & tablet: readable coded version */}
          <div className="grid gap-4 lg:hidden">
            <AcceptedCard />
            <RejectedCard />
          </div>
        </div>

        <Reveal className="mt-14">
          <p className="display mx-auto max-w-4xl text-center text-[clamp(1.35rem,2.6vw,2.15rem)] leading-[1.12]">
            If an inquiry clearly fails the agreed criteria, it should <span className="text-grad">not count</span> as an accepted
            qualified RFQ.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function DesktopComparison() {
  const lb = useLightbox();
  return (
    <div className="hidden lg:block">
      <div className="visual-frame">
        <div className="visual-frame-inner">
          <RegionReveal
            asset={VISUALS.qualified}
            sizes="(min-width: 1240px) 1200px, 100vw"
            interval={0.9}
            regions={[
              { inset: "0% 0% 81% 0%" },
              { inset: "19% 49% 3% 0%", sweep: true },
              { inset: "19% 0% 3% 51%", sweep: true },
            ]}
          >
            {(inView) => (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-[3.9%] top-[20.2%] h-[74.8%] w-[46.6%] rounded-[1.3%] ring-2 ring-brand-cyan"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: [0, 1, 0.55] } : {}}
                transition={{ delay: 3.4, duration: 1.4 }}
                style={{ boxShadow: "0 0 40px 4px rgba(0,229,255,0.35)" }}
              />
            )}
          </RegionReveal>
          <ExpandButton onClick={lb.show} />
        </div>
      </div>
      <Lightbox asset={VISUALS.qualified} open={lb.open} onClose={lb.hide} />
    </div>
  );
}

function AcceptedCard() {
  const { ref, step } = useSequence(ACCEPTED.length + 1, { interval: 380 });
  const done = step > ACCEPTED.length;
  return (
    <div ref={ref} className="card overflow-hidden">
      <div className={`flex items-center justify-between px-5 py-3 ${done ? "bg-accent-soft" : "bg-surface-2"}`}>
        <span className="chip chip-accent !text-[0.62rem] uppercase">Qualified</span>
        <span className="text-[0.72rem] font-semibold text-muted">Ready for delivery</span>
      </div>
      <div className="p-5">
        <p className="text-lg font-extrabold">{done ? "Accepted qualified RFQ" : "Checking agreed criteria…"}</p>
        <ul className="mt-4 grid gap-2">
          {ACCEPTED.map((a, i) => (
            <motion.li
              key={a}
              className="flex items-center gap-3 text-[0.92rem]"
              animate={{ opacity: step > i ? 1 : 0.3 }}
              transition={{ ease: EASE }}
            >
              <span className={`grid h-6 w-6 place-items-center rounded-full ${step > i ? "bg-grad text-navy" : "bg-surface-3 text-subtle"}`}>
                <AnimatedCheck show={step > i} className="h-3.5 w-3.5" />
              </span>
              <span className="font-semibold">{a}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RejectedCard() {
  const { ref, step } = useSequence(REJECTED.length, { interval: 380, startDelay: 600 });
  return (
    <div ref={ref} className="card overflow-hidden">
      <div className="flex items-center justify-between bg-surface-2 px-5 py-3">
        <span className="chip !text-[0.62rem] uppercase">Not qualified</span>
        <span className="text-[0.72rem] font-semibold text-subtle">Not delivered</span>
      </div>
      <div className="p-5">
        <p className="text-lg font-extrabold text-muted">Does not meet agreed criteria</p>
        <ul className="mt-4 grid gap-2">
          {REJECTED.map((a, i) => (
            <motion.li
              key={a}
              className="flex items-center gap-3 text-[0.92rem] text-muted"
              animate={{ opacity: step > i ? 1 : 0.25, x: step > i ? 0 : -4 }}
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-3 text-subtle">
                <Minus className="h-3.5 w-3.5" aria-hidden />
              </span>
              {a}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

