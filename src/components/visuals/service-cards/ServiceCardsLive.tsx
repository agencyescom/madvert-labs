"use client";

import { useEffect } from "react";

/**
 * Touch devices have no hover, so service card artwork plays while the card is comfortably in view
 * (.scv-live) and stops again when it leaves. Pointer devices keep hover / focus as the trigger.
 */
export function ServiceCardsLive({ scope }: { scope: string }) {
  useEffect(() => {
    const root = document.getElementById(scope);
    if (!root) return;
    const touch = window.matchMedia("(hover: none)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!touch.matches || reduce.matches) return;
    const boxes = Array.from(root.querySelectorAll<HTMLElement>("[data-scv]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("scv-live", e.isIntersecting);
      },
      { threshold: 0.6, rootMargin: "-10% 0px -10% 0px" },
    );
    boxes.forEach((b) => io.observe(b));
    return () => {
      io.disconnect();
      boxes.forEach((b) => b.classList.remove("scv-live"));
    };
  }, [scope]);
  return null;
}
