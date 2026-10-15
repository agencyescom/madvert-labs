"use client";

import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { ApplyButton } from "../ui/primitives";
import { Reveal, EASE, useSequence } from "../ui/motion";
import { VISUALS, VisualFrame } from "../ui/Visual";

const KEY_POINTS = ["Ad spend included", "Complete acquisition system included", "No fixed monthly agency retainer"];
const BADGES = [
  "Meta ad spend",
  "Campaign management",
  "Creatives",
  "Landing page",
  "RFQ funnel",
  "Qualification",
  "CRM",
  "Automations",
  "Tracking",
  "Optimization",
];

export function BetaPricing() {
  const { ref, step } = useSequence(6 + BADGES.length, { interval: 260, startDelay: 200, amount: 0.3 });
  const sectionRef = useRef<HTMLElement>(null);
  const seen = useInView(sectionRef, { once: true, amount: 0.3 });
  useEffect(() => {
    if (seen) track("PricingViewed");
  }, [seen]);

  const show = (n: number) => ({
    initial: false as const,
    animate: step >= n ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(6px)" },
    transition: { duration: 0.6, ease: EASE },
  });

  return (
    <section ref={sectionRef} id="pricing" aria-labelledby="pricing-title" className="theme-dark relative overflow-clip">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="grid-texture absolute inset-0 opacity-70" />
        <div className="absolute -left-40 top-10 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(0,180,255,0.20),transparent_65%)]" />
      </div>

      <div className="container-x section-y relative">
        <div ref={ref} className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <motion.p className="eyebrow" {...show(1)}>
              Founding beta
            </motion.p>
            <h2 id="pricing-title" className="display mt-4 text-[clamp(2.1rem,4.4vw,3.6rem)]">
              <motion.span className="block" {...show(1)}>
                One simple price.
              </motion.span>
            </h2>

            <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2">
              <motion.p
                className="text-[clamp(6.5rem,17vw,11.5rem)] font-extrabold leading-[0.8] tracking-[-0.07em]"
                initial={false}
                animate={step >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.9, ease: EASE }}
                style={{ transformOrigin: "left bottom" }}
              >
                <span className="text-grad">$15</span>
              </motion.p>
              <motion.p className="pb-3 text-[clamp(1.15rem,2vw,1.6rem)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em]" {...show(3)}>
                Per accepted
                <br />
                qualified RFQ
              </motion.p>
            </div>

            <ul className="mt-8 grid gap-2.5 sm:grid-cols-3">
              {KEY_POINTS.map((k, i) => (
                <motion.li
                  key={k}
                  className="flex items-center gap-2.5 rounded-xl border border-[var(--accent-line)] bg-accent-soft px-3.5 py-3 text-[0.82rem] font-extrabold uppercase leading-tight tracking-[0.04em]"
                  {...show(4 + i)}
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-grad text-navy">
                    <Check className="h-3 w-3" strokeWidth={3.2} aria-hidden />
                  </span>
                  {k}
                </motion.li>
              ))}
            </ul>
          </div>

          <Reveal delay={0.2} className="lg:col-span-5">
            <div className="lg:[transform:perspective(1600px)_rotateY(-7deg)_rotateX(2deg)]">
              <VisualFrame asset={VISUALS.pricing} sizes="(min-width: 1024px) 40vw, 100vw" parallax={16} />
            </div>
          </Reveal>
        </div>

        {/* Everything included */}
        <div className="mt-16">
          <p className="label-tag">Included in the $15</p>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {BADGES.map((b, i) => (
              <motion.li key={b} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3" {...show(7 + i)}>
                <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={3} aria-hidden />
                <span className="text-[0.86rem] font-semibold leading-tight">
                  {b} <span className="text-subtle">included</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mt-14 grid gap-10 border-t border-line pt-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="display text-[clamp(1.6rem,3vw,2.4rem)]">
              No fixed monthly
              <br />
              <span className="text-grad">agency retainer.</span>
            </p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="space-y-4 text-[1.02rem] leading-relaxed text-muted">
              <p>
                <strong className="text-fg">You pay $15 when an accepted RFQ</strong> that meets the qualification criteria agreed before
                launch is delivered.
              </p>
              <p>Madvert Labs funds and manages the acquisition infrastructure required to generate those RFQs during the founding beta.</p>
              <p className="text-[0.85rem] text-subtle">
                Beta pricing is subject to agreed qualification standards, campaign economics, geography and volume.
              </p>
            </div>
            <ApplyButton className="mt-8 w-full sm:w-auto" onClick={() => track("HeroCTA", { location: "pricing" })}>
              Book a Discovery Call
            </ApplyButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
