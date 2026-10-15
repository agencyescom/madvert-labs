"use client";

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const EASE = [0.2, 0.7, 0.2, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** Fade-and-slide reveal, once, when entering the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "p" | "span";
}) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/** Clip-path mask reveal for headlines and visuals. */
export function MaskReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.2 }}
      whileInView={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Drives a sequential "story" animation: returns the current step, advancing
 * once the element is in view. Reduced-motion users get the final state.
 */
export function useSequence(total: number, { interval = 600, startDelay = 250, loop = false, amount = 0.35 } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: !loop, amount });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setStep(total);
      return;
    }
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setStep(i);
      if (i < total) t = setTimeout(tick, interval);
    };
    t = setTimeout(tick, startDelay);
    return () => clearTimeout(t);
  }, [inView, reduce, total, interval, startDelay]);

  return { ref, step, done: step >= total, replay: () => setStep(0) };
}

/** Animated checkmark (stroke draw). */
export function AnimatedCheck({ show = true, className = "h-4 w-4", delay = 0 }: { show?: boolean; className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <motion.path
        d="M5 12.5l4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: show ? 1 : 0 }}
        transition={{ duration: 0.45, ease: "easeOut", delay }}
      />
    </svg>
  );
}

/** Count-up number used for sample metrics and arithmetic. */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.2,
  className,
  format = (n: number) => Math.round(n).toLocaleString("en-US"),
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const run = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      setVal(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to, duration]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(val)}
      {suffix}
    </span>
  );
}
