"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Reveal, EASE } from "../ui/motion";
import { VISUALS, VisualFrame } from "../ui/Visual";
import { JourneyScreen, PhoneShell } from "./JourneyScreens";

const STEPS = [
  { t: "Customer sees your ad", d: "Madvert Labs runs Meta campaigns around your brand." },
  { t: "Customer opens your branded funnel", d: "The experience looks like your business — not Madvert Labs." },
  { t: "Customer selects patch type", d: "Embroidered, PVC, chenille, woven, leather, printed — or “not sure”." },
  { t: "Customer selects quantity", d: "From 25–49 up to 1,000+ pieces, so order value is visible upfront." },
  { t: "Customer adds size + backing", d: "Width, height and backing: iron on, velcro, sew on, adhesive or other." },
  { t: "Customer uploads artwork", d: "Drag-and-drop logos, artwork or reference files before quotation." },
  { t: "Customer selects deadline", d: "ASAP, within 2 weeks, within 1 month or a specific date." },
  { t: "Customer submits contact details", d: "Name, business, email, phone and preferred contact method." },
  { t: "RFQ is qualified", d: "The agreed criteria are applied before anything reaches you." },
  { t: "Your sales team receives it", d: "CRM, email, SMS, WhatsApp where supported, and mobile notification." },
];

export function CustomerJourney() {
  return (
    <section id="how-it-works" aria-labelledby="journey-title" className="relative border-t border-line">
      <div className="container-x section-y !pb-12 lg:!pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="eyebrow justify-center">How it works</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="journey-title" className="display h2 mt-4">
              From ad click to quote request.
              <br />
              <span className="text-grad">One connected system.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mx-auto mt-6 max-w-2xl">
              Every stage is built, run and connected by Madvert Labs — so the buyer moves from interest to a complete quote request
              without friction, and your team only steps in to quote.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mx-auto mt-12 max-w-6xl">
          <div className="-mx-5 overflow-x-auto px-5 pb-2 md:mx-0 md:overflow-visible md:px-0 md:pb-0 no-scrollbar">
            <VisualFrame
              asset={VISUALS.journey}
              label="Six connected stages"
              sizes="(min-width: 1240px) 1150px, 100vw"
              className="min-w-[760px] md:min-w-0"
            />
          </div>
          <p className="mt-3 text-center text-xs text-subtle md:hidden">Swipe to see all six stages →</p>
        </Reveal>
      </div>

      <JourneyScroller />

      <div className="container-x pb-24 pt-6 lg:pb-32">
        <Reveal>
          <p className="display mx-auto max-w-3xl text-center text-[clamp(1.6rem,3.2vw,2.6rem)]">
            We create and qualify the opportunity.
            <br />
            <span className="text-grad">You quote and close.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** Sticky, scroll-driven walkthrough: one RFQ travels through all ten steps. */
function JourneyScroller() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length * 0.999)));
    setActive((prev) => (prev === i ? prev : i));
  });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const dotTop = useTransform(scrollYProgress, [0, 1], ["6%", "92%"]);

  return (
    <div ref={ref} className="relative" style={{ height: `calc(100svh + ${STEPS.length * 42}svh)` }}>
      <div className="sticky top-[68px] flex h-[calc(100svh-68px)] items-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] lg:left-[70%]" />
        </div>
        <div className="container-x grid w-full items-center gap-6 lg:grid-cols-12 lg:gap-12">
          {/* Desktop step list */}
          <ol className="relative hidden lg:col-span-6 lg:block" aria-label="Customer journey steps">
            <span aria-hidden className="absolute bottom-3 left-[1.05rem] top-3 w-[2px] rounded bg-line">
              <motion.span className="absolute inset-x-0 top-0 rounded bg-grad" style={{ height: fill }} />
            </span>
            {STEPS.map((s, i) => {
              const isActive = i === active;
              const isDone = i < active;
              return (
                <li key={s.t} className="relative flex gap-4 py-[0.42rem] pl-0" aria-current={isActive ? "step" : undefined}>
                  <span
                    className={`relative z-10 grid h-[2.15rem] w-[2.15rem] shrink-0 place-items-center rounded-full border font-mono text-[0.7rem] font-bold transition-all duration-300 ${
                      isActive
                        ? "scale-110 border-transparent bg-grad text-navy shadow-[0_0_0_6px_var(--accent-soft),0_8px_24px_-6px_rgba(0,190,255,0.7)]"
                        : isDone
                          ? "border-[var(--accent-line)] bg-surface text-accent"
                          : "border-line bg-surface text-subtle"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 pt-1.5">
                    <p className={`text-[0.98rem] font-bold leading-tight transition-colors ${isActive ? "text-fg" : isDone ? "text-muted" : "text-subtle"}`}>
                      {s.t}
                    </p>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.p
                          className="overflow-hidden text-[0.9rem] leading-relaxed text-muted"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        >
                          <span className="block pt-1">{s.d}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Mobile/tablet current step */}
          <div className="text-center lg:hidden" aria-live="polite">
            <p className="label-tag !text-accent">
              Step {String(active + 1).padStart(2, "0")} / {STEPS.length}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <p className="mt-1.5 text-[1.15rem] font-extrabold leading-tight sm:text-xl">{STEPS[active].t}</p>
                <p className="mx-auto mt-1 max-w-sm text-[0.85rem] leading-snug text-muted">{STEPS[active].d}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Device */}
          <div className="flex flex-col items-center lg:col-span-6">
            <div className="relative">
              <PhoneShell className="w-[236px] sm:w-[268px] lg:w-[300px]">
                <div className="relative h-[352px] sm:h-[392px] lg:h-[410px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active}
                      className="absolute inset-0"
                      initial={reduce ? false : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      <JourneyScreen index={active} active />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </PhoneShell>
              {/* The travelling RFQ object */}
              <motion.span
                aria-hidden
                className="absolute -right-3 top-8 hidden h-3.5 w-3.5 rounded-full bg-brand-cyan shadow-[0_0_18px_6px_rgba(0,229,255,0.55)] sm:block"
                style={{ top: dotTop }}
              />
            </div>
            {/* Progress dots */}
            <div className="mt-5 flex items-center gap-1.5 lg:hidden" aria-hidden>
              {STEPS.map((s, i) => (
                <span
                  key={s.t}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-grad" : i < active ? "w-1.5 bg-[var(--accent-line)]" : "w-1.5 bg-line-strong"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
