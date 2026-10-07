"use client";

import { useRef } from "react";
import { useScrollScene } from "@/animations/gsap";
import { MadvertMark } from "@/components/ui/MadvertMark";

type Tile = { key: string; label: string; off: { rot: number; x: number; y: number; color: string; font: string } };

const tiles: Tile[] = [
  { key: "logo", label: "Logo", off: { rot: -9, x: -40, y: 30, color: "#ef4444", font: "Georgia, serif" } },
  { key: "social", label: "Social", off: { rot: 7, x: 30, y: -36, color: "#22c55e", font: "Comic Sans MS, cursive" } },
  { key: "photo", label: "Photography", off: { rot: -4, x: 50, y: 40, color: "#f59e0b", font: "Courier New, monospace" } },
  { key: "web", label: "Website", off: { rot: 10, x: -30, y: -24, color: "#a855f7", font: "Times New Roman, serif" } },
  { key: "pub", label: "Publication", off: { rot: -7, x: 26, y: 34, color: "#ec4899", font: "Impact, sans-serif" } },
  { key: "creative", label: "Creative", off: { rot: 5, x: -46, y: -30, color: "#84cc16", font: "Brush Script MT, cursive" } },
];

function TileBody({ t, aligned }: { t: Tile; aligned: boolean }) {
  const color = aligned ? "#00e5ff" : t.off.color;
  const font = aligned ? "var(--font-display)" : t.off.font;
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] uppercase tracking-[0.18em] text-ink-3">{t.label}</span>
        {aligned ? <MadvertMark className="h-2.5 w-auto text-ink" /> : <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      </div>
      <div>
        <div className="h-1.5 w-10 rounded" style={{ background: color }} />
        <p className="mt-2 text-[15px] font-semibold leading-tight text-ink" style={{ fontFamily: font }}>
          {t.key === "logo" ? "Your Brand" : t.key === "web" ? "Welcome" : t.key === "pub" ? "In the news" : t.key === "photo" ? "Our team" : t.key === "social" ? "New post" : "Campaign"}
        </p>
      </div>
    </div>
  );
}

export function IdentityAlign() {
  const root = useRef<HTMLDivElement>(null);

  useScrollScene(root, ({ motion }, el, { gsap }) => {
    const items = el.querySelectorAll<HTMLElement>("[data-tile]");
    const on = el.querySelectorAll<HTMLElement>("[data-on]");
    const label = el.querySelector<HTMLElement>("[data-state]");
    if (!motion) {
      gsap.set(on, { opacity: 1 });
      if (label) label.textContent = "One coherent identity system";
      return;
    }
    items.forEach((it) => gsap.set(it, { rotate: Number(it.dataset.rot), x: Number(it.dataset.x), y: Number(it.dataset.y) }));
    gsap.set(on, { opacity: 0 });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 75%",
        end: "center 45%",
        scrub: 0.6,
        onUpdate: (st) => {
          if (label) label.textContent = st.progress > 0.85 ? "One coherent identity system" : "Six touchpoints. Six different companies.";
        },
      },
    });
    tl.to(items, { rotate: 0, x: 0, y: 0, ease: "power3.out", stagger: 0.05 }, 0).to(on, { opacity: 1, ease: "power2.out", stagger: 0.05 }, 0.35);
  });

  return (
    <div ref={root} className="panel relative overflow-hidden p-6 sm:p-10">
      <p data-state className="t-label" aria-live="polite">
        Six touchpoints. Six different companies.
      </p>
      <div className="mx-auto mt-8 grid max-w-[880px] grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <div
            key={t.key}
            data-tile
            data-rot={t.off.rot}
            data-x={t.off.x}
            data-y={t.off.y}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line-strong bg-surface"
          >
            <TileBody t={t} aligned={false} />
            <div data-on className="absolute inset-0 bg-surface" style={{ opacity: 1 }}>
              <TileBody t={t} aligned />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
