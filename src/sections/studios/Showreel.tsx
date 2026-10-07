"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { track } from "@/analytics/track";
import { MadvertMark } from "@/components/ui/MadvertMark";
import type { ImageAsset } from "@/types/content";

/** Showreel player. Video only loads after the visitor presses play (poster first). */
export function Showreel({ url, poster }: { url?: string; poster?: ImageAsset }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const isEmbed = url && /youtube\.com|youtu\.be|vimeo\.com/.test(url);

  const play = () => {
    track("showreel_play", { source: "studios_page" });
    setPlaying(true);
    requestAnimationFrame(() => ref.current?.play().catch(() => {}));
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[28px] border border-line-strong bg-[#070b14] shadow-[var(--shadow-lg)]">
      {playing && url ? (
        isEmbed ? (
          <iframe
            src={toEmbed(url)}
            title="Madvert Studios showreel"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <video ref={ref} src={url} controls playsInline className="absolute inset-0 h-full w-full object-cover" poster={poster?.url} />
        )
      ) : (
        <>
          {poster ? <Image src={poster.url} alt={poster.alt || "Madvert Studios showreel"} fill sizes="(min-width:1024px) 1100px, 100vw" className="object-cover opacity-80" /> : null}
          <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_50%,rgb(0_180_255/0.18),transparent_70%)]" aria-hidden="true" />
          <div className="absolute inset-0 grid place-items-center">
            {url ? (
              <button type="button" onClick={play} className="group flex flex-col items-center gap-4 text-white" aria-label="Play the Madvert Studios showreel">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white/95 text-[#0a0f1c] shadow-[0_0_0_10px_rgb(255_255_255/0.08)] transition-transform duration-300 group-hover:scale-105">
                  <svg viewBox="0 0 12 12" width="22" height="22" aria-hidden="true">
                    <path d="M3.5 2.2v7.6L9.8 6z" fill="currentColor" />
                  </svg>
                </span>
                <span className="font-display text-[14px] tracking-[0.18em]">WATCH THE SHOWREEL</span>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-5 text-center">
                <MadvertMark className="h-10 w-auto text-white/80" />
                <p className="font-display text-[11px] tracking-[0.22em] text-white/60">[REAL MADVERT STUDIOS SHOWREEL]</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function toEmbed(url: string) {
  const yt = url.match(/(?:youtu\.be\/|v=)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return url;
}
