"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { track } from "@/analytics/track";
import type { Testimonial } from "@/types/content";
import { VideoLightbox } from "./VideoLightbox";
import "@/styles/testimonials.css";

/** Repeat a row until it is long enough to fill a wide screen, so the marquee never shows a gap. */
function fill<T>(list: T[], min: number): T[] {
  if (!list.length) return list;
  const out = [...list];
  while (out.length < min) out.push(...list);
  return out;
}

export function TestimonialWall({ items }: { items: Testimonial[] }) {
  const [open, setOpen] = useState<Testimonial | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const half = Math.ceil(items.length / 2);
  const rows = [
    { key: "a", label: "Client video reviews", dir: "right" as const, list: items.slice(0, half) },
    { key: "b", label: "More client stories", dir: "left" as const, list: items.slice(half) },
  ].filter((r) => r.list.length);

  const play = (t: Testimonial) => {
    track("showreel_play", { source: "testimonial", label: t.name, page: window.location.pathname });
    setOpen(t);
  };

  return (
    <div ref={ref} className="tm-wall" data-paused={paused || !inView ? "true" : "false"}>
      {rows.map((row, ri) => {
        const set = fill(row.list, 6);
        return (
          <div key={row.key} className="tm-row-wrap">
            <div className="container-x tm-row-head">
              <span className="tm-row-icon" aria-hidden="true">
                <svg viewBox="0 0 12 12" width="10" height="10">
                  <path d="M3.5 2.2v7.6L9.8 6z" fill="currentColor" />
                </svg>
              </span>
              <h3 className="tm-row-label">{row.label}</h3>
              <span className="tm-row-rule" aria-hidden="true" />
              <span className="tm-row-dir" aria-hidden="true">
                {row.dir === "right" ? "Scrolling right" : "Scrolling left"}
              </span>
              {ri === 0 ? (
                <button type="button" className="tm-pause" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
                  {paused ? (
                    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                      <path d="M3.5 2.2v7.6L9.8 6z" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                      <path d="M3.2 2.2h2v7.6h-2zM6.8 2.2h2v7.6h-2z" fill="currentColor" />
                    </svg>
                  )}
                  <span>{paused ? "Play motion" : "Pause motion"}</span>
                </button>
              ) : null}
            </div>
            <div className={`tm-row tm-row--${row.dir}`} style={{ ["--tm-dur" as string]: `${set.length * 7}s` }}>
              <ul className="tm-track" aria-label={row.label}>
                {set.map((t, i) => (
                  <li key={`${t.id}-${i}`} className={`tm-item ${i >= row.list.length ? "tm-item--fill" : ""}`} aria-hidden={i >= row.list.length || undefined}>
                    <TestimonialCard t={t} featured={i % 4 === 1} onPlay={play} hidden={i >= row.list.length} />
                  </li>
                ))}
                {/* Second copy for the seamless loop (desktop only, hidden from assistive tech). */}
                {set.map((t, i) => (
                  <li key={`dup-${t.id}-${i}`} className="tm-item tm-item--dup" aria-hidden="true">
                    <TestimonialCard t={t} featured={i % 4 === 1} onPlay={play} hidden />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
      <VideoLightbox item={open} onClose={close} />
    </div>
  );
}

function TestimonialCard({ t, featured, onPlay, hidden }: { t: Testimonial; featured: boolean; onPlay: (t: Testimonial) => void; hidden?: boolean }) {
  const playable = !!t.videoUrl && !t.placeholder;
  const business = t.business ?? t.company;
  const meta = [t.industry, t.market].filter(Boolean).join(" · ");
  const placeholder = !!t.placeholder;
  return (
    <figure className={`tm-card ${featured ? "tm-card--feat" : ""} ${placeholder ? "tm-card--ph" : ""}`}>
      <div className="tm-thumb">
        {t.posterUrl ? <Image src={t.posterUrl} alt="" fill sizes="340px" className="tm-thumb-img" /> : <PlaceholderFrame />}
        {placeholder ? <span className="tm-ph-label">[CLIENT VIDEO TESTIMONIAL]</span> : null}
        {t.duration ? <span className="tm-duration">{t.duration}</span> : null}
        <span className="tm-shade" aria-hidden="true" />
      </div>
      <button
        type="button"
        className="tm-hit"
        disabled={!playable}
        tabIndex={hidden ? -1 : undefined}
        onClick={() => playable && onPlay(t)}
        aria-label={playable ? `Play video testimonial from ${t.name}${business ? `, ${business}` : ""}` : "Client video testimonial coming soon"}
        title={playable ? undefined : "Video coming soon"}
      >
        <span className="tm-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M8.5 5.8v12.4L18.6 12z" fill="currentColor" />
          </svg>
        </span>
      </button>
      <figcaption className="tm-info">
        <blockquote className="tm-quote">
          <span className="tm-qmark" aria-hidden="true">
            “
          </span>
          {t.quote}
        </blockquote>
        <div className="tm-who">
          <span className="tm-avatar" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path d="M2.5 14V5.5L8 2l5.5 3.5V14M6 14v-4h4v4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="tm-name">{t.name}</span>
            <span className="tm-meta">{placeholder ? "[Industry · Market]" : [business, meta].filter(Boolean).join(" · ")}</span>
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

/** Neutral "video frame" for slots without a real thumbnail: studio light, a framing guide, no fake person. */
function PlaceholderFrame() {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = `tmph${raw}`;
  return (
    <svg viewBox="0 0 340 300" preserveAspectRatio="xMidYMid slice" className="tm-thumb-img" aria-hidden="true">
      <defs>
        <linearGradient id={`${g}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#10284a" />
          <stop offset="1" stopColor="#081324" />
        </linearGradient>
        <radialGradient id={`${g}l`} cx="0.5" cy="0.32" r="0.55">
          <stop offset="0" stopColor="#00b4ff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#00b4ff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${g}p`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#ffffff" strokeOpacity="0.05" />
        </pattern>
      </defs>
      <rect width="340" height="300" fill={`url(#${g}b)`} />
      <rect width="340" height="300" fill={`url(#${g}p)`} />
      <rect width="340" height="300" fill={`url(#${g}l)`} />
      {/* framing guide: head-and-shoulders outline, dashed like a camera overlay */}
      <g fill="none" stroke="#9fdcff" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="5 6">
        <circle cx="170" cy="96" r="34" />
        <path d="M96 196c8-38 40-58 74-58s66 20 74 58" />
      </g>
      {/* corner marks */}
      <g stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M24 44V28h16M316 44V28h-16M24 166v16h16M316 166v16h-16" />
      </g>
    </svg>
  );
}
