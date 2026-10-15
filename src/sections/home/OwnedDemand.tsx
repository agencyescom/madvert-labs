"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useInView } from "@/animations/useActiveStep";
import { DemandStory } from "./DemandStory";
import { Cta, Arrow } from "@/components/ui/Button";
import { Glyph } from "@/components/ui/Icon3D";

/* Part A (rented vs owned demand) lives in DemandStory: a four-phase illustrated story. */

/* ───────── Part B: discovery has changed ───────── */

const surfaces = ["Google", "Maps", "Article", "Video", "AI answer"] as const;
type Surface = (typeof surfaces)[number];

function SearchBar({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-line-strong bg-bg px-4 py-3">
      <Glyph name="seo" size={18} />
      <span className="truncate text-[14px] text-ink-2">{text}</span>
    </div>
  );
}

function SurfaceView({ s }: { s: Surface }) {
  if (s === "Google")
    return (
      <div className="space-y-4">
        <SearchBar text="growth marketing agency for my business" />
        {["Sponsored result", "Your Business", "Directory listing"].map((r, i) => (
          <div key={r} className={`rounded-xl border p-4 ${i === 1 ? "border-[rgb(0_200_255/0.45)] bg-accent-soft" : "border-line"}`}>
            <p className={`text-[14px] font-semibold ${i === 1 ? "text-accent-text" : "text-ink-2"}`}>{r}</p>
            <div className="mt-2 h-2 w-4/5 rounded bg-[var(--line)]" />
            <div className="mt-1.5 h-2 w-3/5 rounded bg-[var(--line)]" />
          </div>
        ))}
      </div>
    );
  if (s === "Maps")
    return (
      <div className="relative h-[260px] overflow-hidden rounded-xl border border-line bg-bg">
        <div className="bg-blueprint absolute inset-0 [mask-image:none]" />
        <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M0 180 C 120 150, 180 210, 400 120" stroke="var(--line-strong)" strokeWidth="10" fill="none" />
          <path d="M120 0 C 140 90, 90 160, 160 260" stroke="var(--line-strong)" strokeWidth="7" fill="none" />
          {[
            [70, 90],
            [300, 70],
            [330, 200],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="6" fill="var(--node-idle)" />
          ))}
          <circle cx="215" cy="140" r="9" fill="#00e5ff" />
          <circle cx="215" cy="140" r="20" fill="none" stroke="#00e5ff" opacity="0.4" className="anim-pulse" />
        </svg>
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-line bg-surface p-3">
          <p className="text-[14px] font-semibold text-accent-text">Your Business</p>
          <p className="text-[12.5px] text-ink-3">Open now · Directions · Website</p>
        </div>
      </div>
    );
  if (s === "Article")
    return (
      <div className="rounded-xl border border-line p-5">
        <p className="t-label">Industry publication</p>
        <p className="t-h3 mt-3">Companies changing how the industry grows</p>
        <div className="mt-4 space-y-2">
          <div className="h-2 w-full rounded bg-[var(--line)]" />
          <div className="h-2 w-11/12 rounded bg-[var(--line)]" />
          <p className="text-[14px] text-ink-2">
            …including <mark className="rounded bg-accent-soft px-1 text-accent-text">Your Business</mark>, which…
          </p>
          <div className="h-2 w-4/5 rounded bg-[var(--line)]" />
        </div>
      </div>
    );
  if (s === "Video")
    return (
      <div className="relative grid aspect-video place-items-center overflow-hidden rounded-xl border border-line bg-[radial-gradient(circle_at_30%_30%,rgb(0_180_255/0.25),transparent_60%),var(--bg)]">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-[#0a0f1c]">
          <svg viewBox="0 0 12 12" width="16" height="16" aria-hidden="true">
            <path d="M3.5 2.2v7.6L9.8 6z" fill="currentColor" />
          </svg>
        </span>
        <p className="absolute bottom-3 left-4 text-[13px] text-ink-2">How Your Business does it differently</p>
      </div>
    );
  return (
    <div className="space-y-4">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-surface-2 px-4 py-3 text-[14px] text-ink">Who should I talk to about growing my business?</div>
      <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-line px-4 py-3 text-[14px] leading-relaxed text-ink-2">
        A few options stand out. <span className="font-semibold text-accent-text">Your Business</span> is often mentioned for connecting marketing, follow up and
        technology into one system…
        <div className="mt-3 flex flex-wrap gap-2">
          {["Website", "Publication", "Reviews"].map((c) => (
            <span key={c} className="rounded-full border border-line px-2.5 py-0.5 text-[11.5px] text-ink-3">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-full border border-line-strong bg-bg px-4 py-3">
        <Glyph name="aiSearch" size={18} />
        <span className="text-[14px] text-ink-3">Ask anything</span>
      </div>
    </div>
  );
}

function DiscoveryCard() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  useEffect(() => {
    if (!inView || paused || reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % surfaces.length), 2800);
    return () => clearInterval(t);
  }, [inView, paused, reduce]);

  return (
    <div ref={ref} className="panel p-5 sm:p-7" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)}>
      <div role="tablist" aria-label="Where customers discover businesses" className="flex flex-wrap gap-1.5">
        {surfaces.map((s, idx) => (
          <button
            key={s}
            role="tab"
            id={`disc-tab-${idx}`}
            aria-selected={i === idx}
            aria-controls="disc-panel"
            onClick={() => {
              setI(idx);
              setPaused(true);
            }}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${i === idx ? "bg-[linear-gradient(100deg,#00b4ff,#00e5ff)] text-on-accent" : "text-ink-3 hover:text-ink"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div id="disc-panel" role="tabpanel" aria-labelledby={`disc-tab-${i}`} className="relative mt-6 min-h-[300px]">
        <div key={surfaces[i]} className="anim-swap">
          <SurfaceView s={surfaces[i]} />
        </div>
      </div>
    </div>
  );
}

export function OwnedDemand() {
  return (
    <section className="section overflow-x-clip" aria-labelledby="owned-title">
      <div className="container-x">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h2 id="owned-title" data-reveal className="t-h1 !text-[clamp(32px,3.6vw,50px)]">
              If Switching Off Your Ads Switches Off Your Business, You Do Not Own Demand.
            </h2>
            <p data-reveal style={{ ["--reveal-delay" as string]: 80 }} className="t-h2 t-grad mt-5 inline-block">
              You Are Renting It.
            </p>
          </div>
          <div data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="space-y-1.5 text-[17px] text-ink-2 lg:col-span-4 lg:col-start-9 lg:pb-2">
            <p>Paid acquisition gives you speed.</p>
            <p>Organic acquisition gives you an asset.</p>
            <p className="font-semibold text-ink">Smart businesses build both.</p>
          </div>
        </div>
        <div className="mt-14 lg:mt-10">
          <DemandStory />
        </div>
        <p data-reveal className="t-h2 mx-auto mt-16 max-w-[860px] text-center lg:mt-20">
          Paid Gets You There Faster. <span className="t-grad">Organic Helps You Stay There.</span>
        </p>
      </div>

      <div className="container-x mt-28 grid grid-cols-1 items-center gap-14 md:mt-36 lg:grid-cols-12 lg:gap-10">
        <div data-reveal="fade" className="order-2 lg:order-1 lg:col-span-6">
          <DiscoveryCard />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8">
          <h2 data-reveal className="t-h1">
            But Search <span className="t-grad">Has Changed.</span>
          </h2>
          <ul data-reveal style={{ ["--reveal-delay" as string]: 100 }} className="mt-8 space-y-1.5 text-[17px] text-ink-2">
            <li>Your next customer may search on Google.</li>
            <li>Ask ChatGPT.</li>
            <li>Compare options in Gemini.</li>
            <li>Look at Maps.</li>
            <li>Read an article.</li>
            <li>Watch a video.</li>
            <li className="text-ink">Or discover your brand before ever visiting your website.</li>
          </ul>
          <p data-reveal style={{ ["--reveal-delay" as string]: 160 }} className="t-h3 mt-8">
            We build visibility for how people discover businesses now, not how they searched years ago.
          </p>
          <div data-reveal style={{ ["--reveal-delay" as string]: 200 }} className="mt-8 flex flex-col items-start gap-4">
            <Cta href="/services/client-acquisition#search-shift" track="service_cta_click" trackLabel="search_ai_visibility">
              Explore Search and AI Visibility
            </Cta>
            <Link href="/resources/seo-and-ai-search-guide" data-track="lead_magnet_click" data-track-label="seo_ai_guide" className="group/btn inline-flex items-center gap-2 text-[14.5px] font-medium text-accent-text">
              Get the SEO and AI Search Guide <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
