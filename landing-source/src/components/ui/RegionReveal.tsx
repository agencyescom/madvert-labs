"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { EASE } from "./motion";
import type { VisualAsset } from "./Visual";

export type Region = {
  /** CSS inset() values: "top right bottom left" in % */
  inset: string;
  label?: string;
  /** Reveal the region top-to-bottom like rows being checked */
  sweep?: boolean;
};

/**
 * Reveals regions of a single uploaded visual in a defined order, so the
 * viewer reads the composition the way the story is meant to be understood.
 */
export function RegionReveal({
  asset,
  regions,
  sizes = "(min-width: 1024px) 70vw, 100vw",
  interval = 0.6,
  className = "",
  children,
  onDone,
}: {
  asset: VisualAsset;
  regions: Region[];
  sizes?: string;
  interval?: number;
  className?: string;
  children?: (done: boolean, revealed: boolean) => React.ReactNode;
  onDone?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useReducedMotion();
  const total = regions.length * interval + 0.4;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: reduce ? 0 : total, duration: 0.6 }}
        onAnimationComplete={() => inView && onDone?.()}
      >
        <Image src={asset.src} alt={asset.alt} width={asset.width} height={asset.height} sizes={sizes} className="h-auto w-full" />
      </motion.div>
      {!reduce &&
        regions.map((r, i) => {
          const [t, rgt, b, l] = r.inset.split(" ");
          return (
            <motion.div
              key={r.inset}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0, y: 14, clipPath: r.sweep ? `inset(${t} ${rgt} 100% ${l})` : `inset(${r.inset})` }}
              animate={inView ? { opacity: 1, y: 0, clipPath: `inset(${t} ${rgt} ${b} ${l})` } : {}}
              transition={{
                delay: i * interval,
                duration: r.sweep ? 1.1 : 0.7,
                ease: EASE,
                clipPath: { delay: i * interval, duration: r.sweep ? 1.3 : 0.01, ease: [0.4, 0, 0.2, 1] },
              }}
            >
              <Image src={asset.src} alt="" fill sizes={sizes} className="object-cover" />
            </motion.div>
          );
        })}
      {children?.(inView, inView)}
    </div>
  );
}
