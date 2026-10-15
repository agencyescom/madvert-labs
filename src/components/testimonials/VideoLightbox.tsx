"use client";

import { useEffect, useRef } from "react";
import type { Testimonial } from "@/types/content";

/** YouTube / Vimeo links become privacy-friendly embeds; anything else is played as a file. */
function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return null;
}

/**
 * Accessible video lightbox on the native <dialog>: modal focus containment, Escape to close,
 * focus returned to the card that opened it.
 */
export function VideoLightbox({ item, onClose }: { item: Testimonial | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (item && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!item && d.open) {
      d.close();
    }
  }, [item]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handle = () => {
      onClose();
      opener.current?.focus();
    };
    d.addEventListener("close", handle);
    return () => d.removeEventListener("close", handle);
  }, [onClose]);

  const url = item?.videoUrl ?? "";
  const embed = url ? embedUrl(url) : null;
  const meta = item ? [item.business ?? item.company, [item.industry, item.market].filter(Boolean).join(" · ")].filter(Boolean).join(" — ") : "";

  return (
    <dialog
      ref={ref}
      className="tm-dialog"
      aria-labelledby="tm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      {item ? (
        <div className="tm-dialog-inner">
          <div className="tm-dialog-head">
            <div>
              <p id="tm-dialog-title" className="tm-dialog-name">
                {item.name}
              </p>
              {meta ? <p className="tm-dialog-meta">{meta}</p> : null}
            </div>
            <button type="button" className="tm-dialog-close" data-autofocus onClick={() => ref.current?.close()} aria-label="Close video">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="tm-dialog-video">
            {embed ? (
              <iframe src={embed} title={`Video testimonial from ${item.name}`} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen />
            ) : (
              <video src={url} poster={item.posterUrl} controls autoPlay playsInline preload="metadata">
                <track kind="captions" />
              </video>
            )}
          </div>
          {item.quote ? <p className="tm-dialog-quote">“{item.quote}”</p> : null}
        </div>
      ) : null}
    </dialog>
  );
}
