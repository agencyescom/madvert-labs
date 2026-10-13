"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { track } from "@/lib/analytics";
import { ApplyButton } from "../ui/primitives";
import { Reveal } from "../ui/motion";
import { asset } from "@/lib/paths";

export function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);
  const glow = useTransform(scrollYProgress, [0.2, 0.55], [0.06, 0.2]);

  return (
    <section ref={ref} aria-labelledby="final-title" className="theme-dark relative overflow-clip">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="grid-texture absolute inset-0 opacity-60" />
        <motion.div style={{ y, opacity: glow }} className="absolute left-1/2 top-1/2 w-[min(820px,130vw)] -translate-x-1/2 -translate-y-1/2 blur-[2px]">
          <Image src={asset("/brand/mark-glow.webp")} alt="" width={600} height={600} className="h-auto w-full mix-blend-screen" />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--bg)_75%)]" />
      </div>
      <div className="container-x relative py-28 text-center sm:py-36 lg:py-44">
        <Reveal>
          <h2 id="final-title" className="display mx-auto max-w-4xl text-[clamp(2.4rem,6vw,5.2rem)]">
            If you have production capacity,
            <br />
            <span className="text-grad">let&rsquo;s put it to work.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead mx-auto mt-7 max-w-2xl">
            Apply to see whether Madvert Labs can build a pre-qualified RFQ pipeline around your custom patch or embroidery business.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mt-10 flex flex-col items-center gap-5">
          <ApplyButton className="w-full sm:w-auto" onClick={() => track("HeroCTA", { location: "final" })} />
          <p className="max-w-md text-[0.88rem] leading-relaxed text-subtle">
            No pressure. We&rsquo;ll first determine whether the market, economics and production capacity make sense for both sides.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
