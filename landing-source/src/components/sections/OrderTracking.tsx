"use client";

import { motion } from "framer-motion";
import { Check, Headphones, Image as ImageIcon } from "lucide-react";
import { Reveal, EASE, useSequence } from "../ui/motion";

const STAGES = ["Order confirmed", "Artwork received", "Proof approved", "In production", "Quality check", "Shipping", "Delivered"];
const CURRENT = 3; // "In production" — the demo deliberately stops here

export function OrderTracking() {
  const { ref, step } = useSequence(CURRENT + 1, { interval: 650, startDelay: 400 });
  const reached = step - 1;
  const pct = Math.max(0, reached) / (STAGES.length - 1);

  return (
    <section aria-labelledby="tracking-title" className="section-y relative border-t border-line">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow">Customer order tracking</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="tracking-title" className="display h2 mt-4">
              After the sale, <span className="text-grad">your customer can track progress too.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mt-6">
              Where appropriate, Madvert Labs can provide an order-status framework that helps manufacturers reduce repetitive
              &ldquo;Where is my order?&rdquo; follow-ups.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-7 text-xl font-extrabold leading-snug">
              Your sales team gets the pipeline.
              <br />
              <span className="text-muted">Your customer gets visibility.</span>
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md border-l-2 border-line-strong pl-4 text-[0.85rem] leading-relaxed text-subtle">
              Order tracking depends on your production workflow and available integrations. Stages are updated by your team unless
              an integration is in place.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="lg:col-span-7">
          <div className="card overflow-hidden shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-5 py-4 sm:px-6">
              <div>
                <p className="label-tag">Customer portal · example</p>
                <p className="mt-1 font-mono text-lg font-bold">ORDER #CP10284</p>
              </div>
              <span className="chip chip-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan pulse-dot" aria-hidden /> In production
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-[0.9rem] text-muted">Apex Apparel Co. · 500 embroidered patches · 3.5&Prime; · Iron on</p>

              {/* Horizontal stepper (sm+) */}
              <div className="relative mt-8 hidden sm:block">
                <div className="absolute left-[calc(100%/14)] right-[calc(100%/14)] top-4 h-[3px] rounded bg-surface-3">
                  <motion.div className="h-full origin-left rounded bg-grad" initial={{ scaleX: 0 }} animate={{ scaleX: pct }} transition={{ duration: 0.6, ease: EASE }} />
                </div>
                <ol className="relative grid grid-cols-7">
                  {STAGES.map((s, i) => (
                    <li key={s} className="flex flex-col items-center gap-2 px-1 text-center">
                      <Node i={i} reached={reached} />
                      <span className={`text-[0.7rem] font-semibold leading-tight ${i <= reached ? "text-fg" : "text-subtle"}`}>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Vertical stepper (mobile) */}
              <ol className="relative mt-6 grid gap-3.5 sm:hidden">
                <span className="absolute bottom-4 left-4 top-4 w-[3px] -translate-x-1/2 rounded bg-surface-3">
                  <motion.span className="block w-full origin-top rounded bg-grad" style={{ height: "100%" }} initial={{ scaleY: 0 }} animate={{ scaleY: pct }} transition={{ duration: 0.6, ease: EASE }} />
                </span>
                {STAGES.map((s, i) => (
                  <li key={s} className="relative flex items-center gap-3">
                    <Node i={i} reached={reached} />
                    <span className={`text-[0.92rem] font-semibold ${i <= reached ? "text-fg" : "text-subtle"}`}>{s}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                <span className="btn btn-secondary btn-sm !justify-center" aria-hidden>
                  <ImageIcon className="h-4 w-4" /> View artwork
                </span>
                <span className="btn btn-secondary btn-sm !justify-center" aria-hidden>
                  <Headphones className="h-4 w-4" /> Contact support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Node({ i, reached }: { i: number; reached: number }) {
  const done = i < reached || (i === reached && i < CURRENT);
  const current = i === CURRENT && reached >= CURRENT;
  return (
    <motion.span
      className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${
        done ? "border-transparent bg-grad text-navy" : current ? "border-brand-blue bg-surface" : "border-line-strong bg-surface"
      }`}
      animate={current ? { scale: [1, 1.12, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      {done ? (
        <Check className="h-4 w-4" strokeWidth={3} aria-label="complete" />
      ) : current ? (
        <span className="h-2.5 w-2.5 rounded-full bg-brand-blue pulse-dot" aria-label="current" />
      ) : (
        <span className="sr-only">pending</span>
      )}
    </motion.span>
  );
}
