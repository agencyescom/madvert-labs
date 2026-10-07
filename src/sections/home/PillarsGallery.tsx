"use client";

import Link from "next/link";
import { useRef } from "react";
import { useScrollScene } from "@/animations/gsap";
import { Cta, Arrow } from "@/components/ui/Button";
import { PillarWorld } from "@/components/visuals/PillarWorld";
import type { IconName } from "@/components/ui/Icon3D";
import { pillars } from "@/lib/site";

const worlds: Record<string, { satellites: IconName[]; tint: string }> = {
  "branding-marketing": { satellites: ["webApps", "paidMedia", "studios", "crm"], tint: "#a78bfa" },
  "client-acquisition": { satellites: ["paidMedia", "seo", "aiSearch", "tracking"], tint: "#00b4ff" },
  conversion: { satellites: ["webApps", "mobileApps", "analytics", "growth"], tint: "#2dd4bf" },
  studios: { satellites: ["mobileApps", "paidMedia", "aiAgents", "branding"], tint: "#f59e0b" },
  "automation-revenue-systems": { satellites: ["crm", "aiAgents", "tracking", "analytics"], tint: "#00e5ff" },
  "tech-product-development": { satellites: ["webApps", "mobileApps", "systems", "aiAgents"], tint: "#34d399" },
};

export function PillarsGallery() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ motion, desktop }, el, { gsap }) => {
    if (!motion || !desktop) return;
    const track = el.querySelector<HTMLElement>("[data-track]");
    const viewport = el.querySelector<HTMLElement>("[data-viewport]");
    const bar = el.querySelector<HTMLElement>("[data-progress]");
    if (!track || !viewport) return;
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    viewport.classList.add("is-pinned");
    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: viewport,
        start: "center center",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (st) => bar && gsap.set(bar, { scaleX: st.progress }),
      },
    });
    return () => viewport.classList.remove("is-pinned");
  });

  return (
    <section ref={root} className="section overflow-hidden" aria-labelledby="pillars-title">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h2 id="pillars-title" data-reveal className="t-h1">
              Everything Your Growth System Needs. <span className="t-grad">Connected Under One Roof.</span>
            </h2>
          </div>
          <div className="lg:col-span-4" data-reveal style={{ ["--reveal-delay" as string]: 120 }}>
            <p className="t-body">We do not force every business into one service package.</p>
            <p className="t-body mt-2">We identify what growth requires, then build around it.</p>
          </div>
        </div>
      </div>

      <div data-viewport className="relative mt-16 lg:flex lg:h-[min(720px,calc(100vh-var(--header-h)-40px))] lg:snap-x lg:snap-mandatory lg:items-center lg:overflow-x-auto lg:[&.is-pinned]:snap-none lg:[&.is-pinned]:overflow-hidden">
        <ol data-track className="container-x flex flex-col gap-6 lg:w-max lg:max-w-none lg:flex-row lg:gap-8 lg:pr-[var(--pad-x)] lg:[margin-left:max(var(--pad-x),calc((100vw-var(--container))/2))]">
          {pillars.map((p, i) => {
            const w = worlds[p.key];
            return (
              <li key={p.key} className="lg:w-[min(1040px,78vw)] lg:shrink-0 lg:snap-center">
                <article className="panel grid h-full grid-cols-1 items-center gap-6 overflow-hidden p-7 sm:p-10 md:grid-cols-2 lg:min-h-[540px] lg:gap-10 lg:p-12">
                  <div className="order-2 md:order-1">
                    <p className="flex items-center gap-3 font-display text-[12px] font-semibold tracking-[0.2em] text-ink-3">
                      <span style={{ color: w.tint }}>0{i + 1}</span>
                      <span className="h-px w-6 bg-[var(--line-strong)]" />
                      <span className="uppercase">{p.title}</span>
                    </p>
                    <h3 className="t-h2 mt-6 !text-[clamp(26px,2.6vw,38px)]">{p.headline}</h3>
                    <p className="t-body mt-5 max-w-[420px]">{p.summary}</p>
                    <div className="mt-8 flex flex-col items-start gap-4">
                      <Cta href={p.href} variant="secondary" track="service_cta_click" trackLabel={`pillar_${p.key}`}>
                        {p.cta}
                      </Cta>
                      <Link
                        href={p.freeValue.href}
                        data-track={p.key === "studios" ? "showreel_play" : "free_value_click"}
                        data-track-label={`pillar_${p.key}_free_value`}
                        className="group/btn inline-flex items-center gap-2 text-[14.5px] font-medium text-accent-text"
                      >
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]">Free</span>
                        {p.freeValue.label}
                        <Arrow />
                      </Link>
                    </div>
                  </div>
                  <div className="order-1 md:order-2">
                    <PillarWorld icon={p.icon} satellites={w.satellites} tint={w.tint} className="mx-auto max-w-[460px]" />
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden lg:block">
          <div className="container-x">
            <div className="h-[2px] w-full overflow-hidden rounded bg-[var(--line)]">
              <div data-progress className="h-full w-full origin-left scale-x-0 bg-[linear-gradient(90deg,#00b4ff,#00e5ff)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
