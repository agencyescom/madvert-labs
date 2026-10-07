"use client";

import { useEffect, useState } from "react";
import { MadvertMark } from "@/components/ui/MadvertMark";

/**
 * Brand opening: "Bismillah." → "Building what is next." → a cyan point becomes the Growth Ribbon.
 * ~1.7s, pure CSS so it never blocks. Skipped for 24h after it has played, under reduced motion,
 * and instantly on click or key press. The boot script adds .intro-seen before paint when it should not play.
 */
export function OpeningIntro() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Already seen: CSS keeps it hidden (.intro-seen), nothing to schedule.
    if (document.documentElement.classList.contains("intro-seen")) return;
    const mark = () => {
      try {
        sessionStorage.setItem("mv_intro_seen", "1");
        localStorage.setItem("mv_intro_seen", String(Date.now()));
      } catch {}
    };
    mark();
    const done = () => {
      document.documentElement.classList.add("intro-seen");
      setGone(true);
    };
    const t = setTimeout(done, 1900);
    window.addEventListener("keydown", done, { once: true });
    window.addEventListener("pointerdown", done, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", done);
      window.removeEventListener("pointerdown", done);
    };
  }, []);

  if (gone) return null;

  return (
    <div className="mv-intro" aria-hidden="true">
      <div className="bg-blueprint absolute inset-0" />
      <div className="relative flex flex-col items-center">
        <MadvertMark className="mv-intro-mark h-10 w-auto text-white" />
        <div className="relative mt-8 h-8 w-[320px] text-center font-display text-[20px] font-medium tracking-[0.02em] text-white">
          <span className="mv-intro-l1 absolute inset-0">Bismillah.</span>
          <span className="mv-intro-l2 absolute inset-0">Building what is next.</span>
        </div>
        <div className="relative mt-8 h-px w-[min(520px,80vw)]">
          <span className="mv-intro-point" />
          <span className="mv-intro-line" />
        </div>
      </div>
    </div>
  );
}
