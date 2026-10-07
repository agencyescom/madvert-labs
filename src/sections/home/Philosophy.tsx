"use client";

import { useRef } from "react";
import { useScrollScene } from "@/animations/gsap";
import { Eyebrow } from "@/components/ui/Section";

const stages = ["Attention", "Demand", "Conversion", "Follow Up", "Sales", "Revenue"];

export function Philosophy() {
  const root = useRef<HTMLElement>(null);

  useScrollScene(root, ({ motion, desktop }, el, { gsap }) => {
    const fill = el.querySelector<HTMLElement>("[data-fill]");
    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-stage]"));
    if (!fill) return;
    if (!motion) {
      gsap.set(fill, { scaleX: 1, scaleY: 1 });
      nodes.forEach((n) => n.classList.add("is-on"));
      return;
    }
    const axis = desktop ? "scaleX" : "scaleY";
    gsap.set(fill, { [axis]: 0 });
    gsap.to(fill, {
      [axis]: 1,
      ease: "none",
      scrollTrigger: {
        trigger: el.querySelector("[data-track]"),
        start: desktop ? "top 70%" : "top 75%",
        end: desktop ? "bottom 45%" : "bottom 55%",
        scrub: 0.5,
        onUpdate: (st) => nodes.forEach((n, i) => n.classList.toggle("is-on", st.progress >= i / (nodes.length - 1) - 0.02)),
      },
    });
  });

  return (
    <section ref={root} className="section relative overflow-hidden" aria-labelledby="philo-title">
      <div className="bg-aura pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="container-x relative">
        <div className="mx-auto max-w-[860px] text-center [&_.t-eyebrow]:justify-center">
          <div data-reveal>
            <Eyebrow>How We Think</Eyebrow>
          </div>
          <h2 id="philo-title" data-reveal style={{ ["--reveal-delay" as string]: 80 }} className="t-h1 mt-6">
            Growth Is a System. <span className="t-grad">Not a Campaign.</span>
          </h2>
        </div>

        <div data-track className="relative mx-auto mt-20 max-w-[1120px] md:mt-24">
          {/* track */}
          <div className="absolute left-[27px] top-0 h-full w-[2px] bg-[var(--line-strong)] lg:left-[calc(100%/12)] lg:right-[calc(100%/12)] lg:top-[27px] lg:h-[2px] lg:w-auto" aria-hidden="true">
            <div data-fill className="h-full w-full origin-top bg-[linear-gradient(180deg,#00b4ff,#00e5ff)] shadow-[0_0_14px_rgb(0_200_255/0.7)] lg:origin-left lg:bg-[linear-gradient(90deg,#00b4ff,#00e5ff)]" />
          </div>
          <ol className="relative grid grid-cols-1 gap-12 lg:grid-cols-6 lg:gap-0">
            {stages.map((s, i) => (
              <li key={s} data-stage className="group/st flex items-center gap-6 lg:flex-col lg:gap-5 lg:text-center">
                <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line-strong bg-bg transition-[border-color,box-shadow] duration-500 group-[.is-on]/st:border-[#00e5ff] group-[.is-on]/st:shadow-[0_0_0_6px_rgb(0_200_255/0.08),0_0_24px_rgb(0_200_255/0.35)]">
                  <span className="font-display text-[13px] font-semibold text-ink-3 transition-colors duration-500 group-[.is-on]/st:text-accent-text">0{i + 1}</span>
                </span>
                <span className="font-display text-[19px] font-semibold text-ink-3 transition-colors duration-500 group-[.is-on]/st:text-ink">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <p data-reveal className="t-h2 mx-auto mt-24 max-w-[820px] text-center md:mt-28">
          Our Job Is to Find the Bottleneck <span className="t-grad">Before It Becomes Expensive.</span>
        </p>
      </div>
    </section>
  );
}
