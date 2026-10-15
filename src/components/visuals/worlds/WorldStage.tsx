"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Stage wrapper for a pillar world. Animations are authored so the element's base style IS the
 * final, fully composed scene; keyframes play the story into it. Everything is paused until the
 * stage is on screen and paused again when it leaves, so offscreen worlds cost nothing.
 * Reduced motion (handled in worlds.css) removes animations and leaves the composed scene.
 */
export function WorldStage({
  name,
  tint,
  className = "",
  children,
}: {
  name: string;
  tint: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      el?.setAttribute("data-live", "");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-live", "");
          el.setAttribute("data-seen", "");
        } else {
          el.removeAttribute("data-live");
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`wld wld-${name} ${className}`}
      style={{ ["--wld-tint" as string]: tint } as CSSProperties}
      aria-hidden="true"
    >
      <div className="wld-glow" />
      <div className="wld-scene">{children}</div>
    </div>
  );
}
