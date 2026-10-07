"use client";

import { useEffect, type RefObject } from "react";
import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

export const media = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 1024px)",
  mobile: "(max-width: 1023px)",
} as const;

type Conditions = { motion: boolean; reduce: boolean; desktop: boolean; mobile: boolean };
type Kit = { gsap: typeof GSAP; ScrollTrigger: typeof ST };

let kit: Promise<Kit> | null = null;

/** GSAP is loaded on demand after hydration so it never sits on the critical path. */
function loadGsap(): Promise<Kit> {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return kit;
}

/**
 * Scoped GSAP scene. Runs `setup` inside gsap.matchMedia so reduced motion and breakpoints
 * are handled declaratively, and reverts everything on unmount.
 */
export function useScrollScene(
  scope: RefObject<HTMLElement | null>,
  setup: (c: Conditions, el: HTMLElement, k: Kit) => void | (() => void),
  deps: unknown[] = [],
) {
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    let cancelled = false;
    let mm: ReturnType<typeof GSAP.matchMedia> | null = null;
    void loadGsap().then((k) => {
      if (cancelled) return;
      mm = k.gsap.matchMedia(el);
      mm.add(media, (ctx) => setup(ctx.conditions as Conditions, el, k));
      k.ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      mm?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
