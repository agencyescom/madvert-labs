"use client";

import { track } from "@/lib/analytics";
import { ApplyButton } from "../ui/primitives";
import { Reveal } from "../ui/motion";
import { VideoPlayer } from "../ui/VideoPlayer";

export function VSLSection() {
  return (
    <section aria-labelledby="vsl-title" className="theme-dark relative overflow-clip">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="grid-texture absolute inset-0 opacity-60" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(0,190,255,0.18),transparent_65%)]" />
      </div>
      <div className="container-x section-y relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow justify-center">Watch</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="vsl-title" className="display h2 mt-4">
              See the system <span className="text-grad">in a minute.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mx-auto mt-5 max-w-2xl">
              Watch how a potential buyer moves from an advertisement to a completed RFQ and into the manufacturer&rsquo;s sales
              pipeline.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mx-auto mt-12 max-w-5xl">
          <div className="relative rounded-[1.6rem] border border-[rgba(0,210,255,0.22)] bg-[#070b12] p-2 shadow-[0_50px_120px_-40px_rgba(0,190,255,0.45)]">
            {/* Same file as the hero player; preload="none" so it isn't fetched twice on page load. */}
            <VideoPlayer location="vsl_section" preload="none" className="rounded-[1.2rem]" />
          </div>
        </Reveal>

        <Reveal delay={0.2} className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-muted">Talk to us about your production capacity</p>
          <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <ApplyButton className="w-full !min-h-14 !px-8 !text-base sm:w-auto" onClick={() => track("BookCallCTA", { location: "vsl_section" })} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
