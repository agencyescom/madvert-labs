"use client";

import Image from "next/image";
import { useRef } from "react";
import { Glyph, type IconName } from "@/components/ui/Icon3D";
import { MadvertMark } from "@/components/ui/MadvertMark";
import { useScrollScene } from "@/animations/gsap";
import type { ImageAsset } from "@/types/content";

// Coordinates in a 600 x 660 stage. Each node starts "drifted" (dx, dy) and disconnected.
const NODES: { label: string; icon: IconName; x: number; y: number; dx: number; dy: number }[] = [
  { label: "Meta", icon: "paidMedia", x: 92, y: 120, dx: -26, dy: -18 },
  { label: "Google", icon: "seo", x: 300, y: 54, dx: 18, dy: -22 },
  { label: "Search", icon: "aiSearch", x: 508, y: 120, dx: 30, dy: -12 },
  { label: "CRM", icon: "crm", x: 548, y: 330, dx: 26, dy: 16 },
  { label: "AI", icon: "aiAgents", x: 508, y: 546, dx: 22, dy: 26 },
  { label: "Website", icon: "webApps", x: 300, y: 608, dx: -14, dy: 24 },
  { label: "Sales", icon: "growth", x: 92, y: 546, dx: -28, dy: 14 },
  { label: "Analytics", icon: "analytics", x: 52, y: 330, dx: -24, dy: -10 },
];
const HUB = { x: 300, y: 330 };
const FRAME = { x: 172, y: 168, w: 256, h: 324 };

function connector(n: (typeof NODES)[number]) {
  // Curve from the node towards the frame edge, bending gently like the ribbon.
  const tx = Math.min(Math.max(n.x, FRAME.x), FRAME.x + FRAME.w);
  const ty = Math.min(Math.max(n.y, FRAME.y), FRAME.y + FRAME.h);
  const mx = (n.x + tx) / 2 + (n.y < HUB.y ? 18 : -18);
  const my = (n.y + ty) / 2 + (n.x < HUB.x ? -18 : 18);
  return `M${n.x} ${n.y} Q ${mx} ${my} ${tx} ${ty}`;
}

const RIBBON = "M30 600 C 150 640, 200 470, 300 470 S 470 300, 590 200";

export function HeroVisual({ image }: { image?: ImageAsset }) {
  const root = useRef<HTMLDivElement>(null);

  useScrollScene(root, ({ motion }, el, { gsap }) => {
    const nodes = el.querySelectorAll<HTMLElement>("[data-node]");
    const lines = el.querySelectorAll<SVGPathElement>("[data-link]");
    const ribbon = el.querySelectorAll<SVGPathElement>("[data-ribbon]");
    if (!motion) {
      gsap.set(lines, { strokeDashoffset: 0 });
      gsap.set(ribbon, { strokeDashoffset: 0 });
      el.classList.add("is-connected");
      return;
    }
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(ribbon, { strokeDasharray: 1, strokeDashoffset: 1 });
    nodes.forEach((n) => gsap.set(n, { x: Number(n.dataset.dx), y: Number(n.dataset.dy), opacity: 0.55 }));

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: el,
        start: "top 70%",
        end: "bottom 35%",
        scrub: 0.6,
        onUpdate: (st) => el.classList.toggle("is-connected", st.progress > 0.62),
      },
    });
    tl.to(nodes, { x: 0, y: 0, opacity: 1, stagger: 0.04, duration: 0.6 }, 0)
      .to(lines, { strokeDashoffset: 0, stagger: 0.05, duration: 0.5 }, 0.25)
      .to(ribbon, { strokeDashoffset: 0, duration: 0.8 }, 0.35);
  });

  return (
    <div ref={root} className="hero-visual group/hv relative mx-auto aspect-[600/660] w-full max-w-[600px]">
      <svg viewBox="0 0 600 660" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="hv-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#00b4ff" />
            <stop offset="1" stopColor="#00e5ff" />
          </linearGradient>
          <radialGradient id="hv-aura" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#00b4ff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#00b4ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={HUB.x} cy={HUB.y} r="290" fill="url(#hv-aura)" />
        <g fill="none" stroke="var(--line-strong)" strokeDasharray="2 6">
          <circle cx={HUB.x} cy={HUB.y} r="250" />
          <circle cx={HUB.x} cy={HUB.y} r="190" opacity="0.6" />
        </g>
        {/* faint "disconnected" stubs that always show */}
        <g stroke="var(--node-idle)" strokeWidth="1" fill="none" opacity="0.6" strokeDasharray="3 5">
          {NODES.map((n) => (
            <path key={n.label} d={connector(n)} />
          ))}
        </g>
        <g fill="none" stroke="url(#hv-line)" strokeWidth="1.6" strokeLinecap="round">
          {NODES.map((n) => (
            <path key={n.label} d={connector(n)} pathLength={1} strokeDasharray={1} strokeDashoffset={1} data-link />
          ))}
        </g>
        <path d={RIBBON} fill="none" stroke="url(#hv-line)" strokeWidth="2.4" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1} data-ribbon opacity="0.9" />
        <path d={RIBBON} fill="none" stroke="#00e5ff" strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1} data-ribbon opacity="0.12" />
      </svg>

      {/* Portrait frame: real founder or client photography from the CMS */}
      <div
        className="absolute overflow-hidden rounded-[28px] border border-line-strong bg-surface shadow-[var(--shadow-lg)]"
        style={{
          left: `${(FRAME.x / 600) * 100}%`,
          top: `${(FRAME.y / 660) * 100}%`,
          width: `${(FRAME.w / 600) * 100}%`,
          height: `${(FRAME.h / 660) * 100}%`,
        }}
      >
        {image ? (
          <Image src={image.url} alt={image.alt} fill sizes="(min-width:1024px) 260px, 45vw" className="object-cover object-[50%_30%]" priority />
        ) : (
          <div className="placeholder-slot !rounded-none absolute inset-0 grid place-items-center !border-0">
            <div className="flex flex-col items-center gap-5 px-4 text-center">
              <MadvertMark className="h-9 w-auto text-ink opacity-80" />
              <p className="t-label hidden !text-[10px] leading-relaxed sm:block">[REAL FOUNDER OR CLIENT PHOTOGRAPHY]</p>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgb(10_15_28/0.65)] to-transparent" />
        <div className="absolute inset-x-3 bottom-3 hidden items-center justify-between sm:flex rounded-xl border border-white/10 bg-[rgb(10_15_28/0.6)] px-3 py-2 backdrop-blur">
          <span className="font-display text-[11px] font-semibold tracking-[0.14em] text-white/90">ONE SYSTEM</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-[#334155] transition-colors duration-500 group-[.is-connected]/hv:bg-[#00e5ff] group-[.is-connected]/hv:shadow-[0_0_10px_#00e5ff]" />
          </span>
        </div>
      </div>

      {NODES.map((n) => (
        <div
          key={n.label}
          data-node
          data-dx={n.dx}
          data-dy={n.dy}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(n.x / 600) * 100}%`, top: `${(n.y / 660) * 100}%`, transform: `translate(${n.dx}px, ${n.dy}px)`, opacity: 0.55 }}
        >
          <div className="flex items-center gap-1.5 rounded-full border border-line-strong bg-[var(--surface)] py-1 pl-1 pr-2.5 sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-3.5 shadow-[0_10px_30px_-16px_rgb(0_0_0/0.6)] transition-[border-color,box-shadow] duration-500 group-[.is-connected]/hv:border-[rgb(0_200_255/0.45)] group-[.is-connected]/hv:shadow-[0_0_0_1px_rgb(0_200_255/0.15),0_10px_30px_-12px_rgb(0_180_255/0.5)]">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-bg sm:h-7 sm:w-7">
              <Glyph name={n.icon} size={16} />
            </span>
            <span className="font-display text-[11px] font-semibold text-ink sm:text-[13px]">{n.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
