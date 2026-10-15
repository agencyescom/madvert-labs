"use client";

import { useRef, useState } from "react";
import type { CaseStudy } from "@/types/content";
import { CaseShowcaseCard } from "./CaseShowcaseCard";
import "@/styles/cases.css";

/**
 * Case study carousel. Desktop: centre card large, side cards recede with perspective.
 * Mobile: a simple native scroll-snap row. Keyboard: arrow keys anywhere inside, prev/next, dots.
 */
export function CaseCarousel({ studies, label = "Case studies" }: { studies: CaseStudy[]; label?: string }) {
  const n = studies.length;
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);
  if (!n) return null;
  const go = (d: number) => setActive((a) => (a + d + n) % n);

  return (
    <div className="cs-carousel">
      {/* Desktop stage */}
      <div
        className="cs-stage-wrap"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
        }}
      >
        <div
          className="cs-stage"
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") startX.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (startX.current == null) return;
            const dx = e.clientX - startX.current;
            startX.current = null;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          }}
        >
          {studies.map((s, i) => {
            let off = i - active;
            if (off > n / 2) off -= n;
            if (off < -n / 2) off += n;
            const abs = Math.abs(off);
            const current = off === 0;
            return (
              <div
                key={s.slug}
                className="cs-slide"
                data-current={current || undefined}
                data-far={abs > 1 || undefined}
                style={{ ["--off" as string]: off, ["--abs" as string]: abs }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${s.title}`}
                aria-hidden={!current || undefined}
              >
                <div inert={!current} className="cs-slide-inner">
                  <CaseShowcaseCard study={s} size="lg" />
                </div>
                {!current && abs === 1 ? <button type="button" tabIndex={-1} className="cs-slide-hit" onClick={() => setActive(i)} aria-label={`Show ${s.title}`} /> : null}
              </div>
            );
          })}
        </div>
        {n > 1 ? (
          <div className="cs-controls">
            <button type="button" className="cs-nav" onClick={() => go(-1)} aria-label="Previous case study">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M10 3.5L5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="cs-dots">
              {studies.map((s, i) => (
                <button key={s.slug} type="button" className="cs-dot" aria-current={i === active || undefined} aria-label={`Go to case study ${i + 1}: ${s.title}`} onClick={() => setActive(i)} />
              ))}
            </div>
            <button type="button" className="cs-nav" onClick={() => go(1)} aria-label="Next case study">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">
          Case study {active + 1} of {n}: {studies[active]?.title}
        </p>
      </div>

      {/* Mobile: native swipe row */}
      <ul className="cs-snap" aria-label={label}>
        {studies.map((s) => (
          <li key={s.slug} className="cs-snap-item">
            <CaseShowcaseCard study={s} />
          </li>
        ))}
      </ul>
    </div>
  );
}
