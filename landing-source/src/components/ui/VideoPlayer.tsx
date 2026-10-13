"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { VSL } from "@/lib/site";

/** Every mounted player, so starting one pauses the others. */
const players = new Set<HTMLVideoElement>();

/**
 * Native HTML5 VSL player. Both page locations use the same file; `preload` controls how much
 * each one fetches before the visitor presses play (the hero fetches metadata only, the lower
 * section nothing), so the video is never downloaded twice on page load.
 */
export function VideoPlayer({
  location,
  preload = "none",
  className = "",
}: {
  location: "hero" | "vsl_section";
  preload?: "none" | "metadata";
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const tracked = useRef({ play: false, half: false });

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    players.add(v);
    return () => {
      players.delete(v);
    };
  }, []);

  const onPlay = useCallback(() => {
    const v = ref.current;
    players.forEach((p) => {
      if (p !== v && !p.paused) p.pause();
    });
    setStarted(true);
    if (!tracked.current.play) {
      tracked.current.play = true;
      track("VSLPlay", { location });
    }
  }, [location]);

  const onTimeUpdate = useCallback(() => {
    const v = ref.current;
    if (!v || tracked.current.half || !v.duration) return;
    if (v.currentTime / v.duration >= 0.5) {
      tracked.current.half = true;
      track("VSL50", { location });
    }
  }, [location]);

  const play = () => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {
      /* the browser refused (e.g. data saver); native controls stay available */
    });
    v.focus({ preventScroll: true });
  };

  return (
    <div className={`relative overflow-hidden bg-black ${className}`} style={{ aspectRatio: `${VSL.width} / ${VSL.height}` }}>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-contain"
        src={VSL.src}
        poster={VSL.poster}
        preload={preload}
        controls
        playsInline
        aria-label={`${VSL.title} (${VSL.duration})`}
        onPlay={onPlay}
        onTimeUpdate={onTimeUpdate}
      >
        Your browser can’t play this video. <a href={VSL.src}>Download the video</a>.
      </video>

      {/* Branded play button until the first play; native controls take over after that. */}
      <AnimatePresence>
        {!started && (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={false}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={play}
              className="group pointer-events-auto grid h-16 w-16 place-items-center rounded-full bg-grad text-navy shadow-[0_0_0_10px_rgba(0,200,255,0.18),0_20px_50px_-10px_rgba(0,200,255,0.7)] transition-transform duration-300 hover:scale-110 focus-visible:scale-110 sm:h-20 sm:w-20"
              aria-label={`Play video: ${VSL.title}, ${VSL.duration}`}
            >
              <Play className="ml-1 h-6 w-6 fill-current sm:h-7 sm:w-7" aria-hidden />
            </button>
            <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 font-mono text-[0.66rem] text-white/85 backdrop-blur">
              {VSL.duration}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
