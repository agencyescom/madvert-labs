"use client";

import { motion, useReducedMotion } from "framer-motion";
import { track } from "@/lib/analytics";
import { VSL } from "@/lib/site";
import { ApplyButton } from "../ui/primitives";
import { EASE } from "../ui/motion";
import { VideoPlayer } from "../ui/VideoPlayer";

/**
 * Opening section: who this is for, the VSL, then the booking CTA.
 * Mobile type sizes are tuned so the headline and subheadline each wrap to three lines at 390px.
 */
export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-clip pt-[calc(68px+var(--bar-h))]">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-texture absolute inset-0" />
        <div className="absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(0,190,255,0.16),transparent_65%)] dark:bg-[radial-gradient(circle,rgba(0,190,255,0.20),transparent_65%)]" />
        <div className="absolute -left-60 top-1/2 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(0,102,255,0.08),transparent_65%)]" />
      </div>

      <div className="container-x pb-16 pt-8 text-center sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        <motion.p
          className="chip chip-accent mx-auto !px-3 !py-1.5 !text-[0.56rem] !tracking-[0.08em] uppercase sm:!text-[0.66rem] sm:!tracking-[0.14em]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-grad pulse-dot" aria-hidden />
          For custom patch &amp; embroidery businesses in the USA
        </motion.p>

        <h1
          id="hero-title"
          className="display mx-auto mt-5 max-w-5xl normal-case tracking-[-0.03em] [text-wrap:wrap] sm:uppercase sm:tracking-[-0.038em] sm:[text-wrap:balance] text-[clamp(1.1rem,5.35vw,1.6rem)] !leading-[1.05] sm:mt-6 sm:text-[clamp(2.2rem,6.4vw,4.9rem)] sm:!leading-[0.98]"
        >
          <motion.span
            className="block"
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", y: 20 }}
            animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          >
            Run a custom patch or embroidery business in the USA?
          </motion.span>
          <motion.span
            className="mt-1 block text-grad sm:mt-2"
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", y: 20 }}
            animate={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          >
            You&rsquo;re in the right place.
          </motion.span>
        </h1>

        <motion.p
          className="mx-auto mt-4 max-w-3xl text-[0.86rem] leading-[1.5] text-muted sm:mt-6 sm:text-[clamp(1.05rem,1.5vw,1.3rem)] sm:leading-relaxed"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
        >
          We build and run the system that turns U.S. buyers into a daily flow of pre-qualified patch order requests for your sales
          team.
        </motion.p>

        {/* VSL */}
        <motion.div
          className="relative mx-auto mt-8 max-w-4xl text-left sm:mt-10"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.55 }}
        >
          <div aria-hidden className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(0,190,255,0.22),transparent_70%)] blur-2xl" />
          <div className="visual-frame">
            <div className="flex items-center gap-2 px-2 pb-2 pt-1">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </span>
              <span className="ml-2 min-w-0 truncate font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/55">
                Watch: how the Patches Partnership works · {VSL.duration}
              </span>
            </div>
            <VideoPlayer location="hero" preload="metadata" className="rounded-[0.85rem]" />
          </div>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col items-center gap-3 sm:mt-10"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
        >
          <ApplyButton
            className="cta-glow w-full !min-h-16 !px-10 !text-[1.08rem] sm:w-auto"
            onClick={() => track("HeroCTA", { location: "hero" })}
          />
          <p className="text-[0.8rem] text-subtle">Founding beta · $15 per accepted qualified RFQ · Meta ad spend included</p>
        </motion.div>
      </div>
    </section>
  );
}
