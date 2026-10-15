"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { track } from "@/analytics/track";
import { GrowthRibbon } from "@/components/visuals/GrowthRibbon";
import "@/styles/intro-video.css";

const VIDEO = {
  hd: "/video/madvert-intro-1080.mp4",
  sd: "/video/madvert-intro-720.mp4",
  poster: "/video/madvert-intro-poster-v2.webp",
  duration: "1:00",
};

/**
 * The Madvert Labs introductory film, presented as a brand asset.
 * Nothing is downloaded until the visitor presses play (preload none, poster only),
 * then the right rendition for the screen is chosen and played inline.
 */
export function IntroVideo() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function play() {
    setPlaying(true);
    track("showreel_play", { video: "madvert_intro", location: "home" });
    requestAnimationFrame(() => {
      const v = videoRef.current;
      if (!v) return;
      v.src = window.matchMedia("(min-width: 900px)").matches ? VIDEO.hd : VIDEO.sd;
      v.play().catch(() => {
        /* autoplay with sound refused: controls stay visible for a manual play */
      });
    });
  }

  return (
    <section className="section relative overflow-hidden" aria-labelledby="intro-video-title">
      <div className="container-x">
        <div className="mx-auto max-w-[820px] text-center">
          <p data-reveal className="t-label">Meet Madvert Labs</p>
          <h2 id="intro-video-title" data-reveal style={{ ["--reveal-delay" as string]: 80 }} className="t-h1 mt-4">
            Sixty Seconds on How We <span className="t-grad">Build Growth Systems.</span>
          </h2>
          <p data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="t-lead mx-auto mt-5 max-w-[640px]">
            Why ads alone stop working, where leads leak, and what changes when every part of your growth connects.
          </p>
        </div>

        <div data-reveal="fade" style={{ ["--reveal-delay" as string]: 200 }} className="iv-stage relative mx-auto mt-12 max-w-[1120px] md:mt-16">
          <div className="iv-glow" aria-hidden="true" />
          <GrowthRibbon id="iv-rb" shape="wave" strands={8} spread={40} opacity={0.6} className="iv-ribbon" />
          <div className="iv-frame">
            <div className="iv-screen">
              {playing ? (
                <video
                  ref={videoRef}
                  className="h-full w-full bg-black object-cover"
                  controls
                  playsInline
                  preload="none"
                  poster={VIDEO.poster}
                  aria-label="Madvert Labs introductory film"
                />
              ) : (
                <button type="button" onClick={play} className="iv-poster group" aria-label={`Play the Madvert Labs introductory film (${VIDEO.duration})`}>
                  <Image src={VIDEO.poster} alt="" fill sizes="(min-width: 1180px) 1120px, 100vw" className="object-cover" />
                  <span className="iv-scrim" aria-hidden="true" />
                  <span className="iv-cta" aria-hidden="true">
                    <span className="iv-play">
                      <svg viewBox="0 0 24 24" width="22" height="22">
                        <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="iv-cta-text">
                      <span className="iv-cta-title">Watch the film</span>
                      <span className="iv-cta-sub">
                        <span className="iv-dot" /> Madvert Labs · {VIDEO.duration}
                      </span>
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
