"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scrollytelling driver: returns the index of the step element currently crossing
 * the reading line (default: 55% down the viewport). Works the same on mobile and desktop
 * because the stage uses CSS position: sticky rather than scroll hijacking.
 */
export function useActiveStep<T extends HTMLElement = HTMLDivElement>(count: number, line = 0.55) {
  const refs = useRef<(T | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = refs.current.slice(0, count).filter(Boolean) as T[];
    if (!els.length) return;
    const margin = `-${Math.round(line * 100)}% 0px -${Math.round((1 - line) * 100)}% 0px`;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = els.indexOf(e.target as T);
            if (i >= 0) setActive(i);
          }
        }
      },
      { rootMargin: margin, threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [count, line]);

  const bind = (i: number) => (el: T | null) => {
    refs.current[i] = el;
  };

  return { active, bind, setActive };
}

/** True once the element has been in view (for one-shot autoplay of explanatory animations). */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return { ref, seen };
}

/** True while the element is on screen. Used to pause looping visuals off screen. */
export function useInView<T extends HTMLElement = HTMLDivElement>(rootMargin = "0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return { ref, inView };
}
