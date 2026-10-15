"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useScrollScene } from "@/animations/gsap";
import { Glyph, type IconName } from "@/components/ui/Icon3D";
import { MadvertMark } from "@/components/ui/MadvertMark";
import { GoogleG, MetaMark } from "@/components/visuals/service-cards/ServiceVisuals";
import "@/styles/service-cards.css";
import "@/styles/growth-system.css";

/**
 * Full Stack Digital Marketing as one connected system.
 * Seven modules (small UI cards) appear one by one, physically move together and are joined by the
 * Madvert Growth Ribbon, which carries data pulses between them.
 *
 *  variant="scene"   (Hire Your Marketing Department): scrubbed GSAP story on desktop, sequential reveal on mobile.
 *  variant="compact" (flagship service card): final connected state with live ribbon pulses.
 *
 * Default markup = final connected state, so no-JS and reduced motion get the finished system.
 */

type Mod = { key: string; title: string; desc: string; icon: IconName; mini: (g: string, area: string) => ReactNode };

function Mini({ draw }: { draw: Mod["mini"] }) {
  const id = "gsm" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 136 46" className="scv gs-mini" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}g`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#00b4ff" />
          <stop offset="1" stopColor="#00e5ff" />
        </linearGradient>
        <linearGradient id={`${id}a`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#00b4ff" stopOpacity=".35" />
          <stop offset="1" stopColor="#00b4ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {draw(`url(#${id}g)`, `url(#${id}a)`)}
    </svg>
  );
}

function bar(x: number, y: number, w: number, h = 4, tone = "f-mu") {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} className={tone} />;
}

const MODS: Mod[] = [
    {
      key: "strategy",
      title: "Strategy",
      desc: "Positioning, offer and the growth plan",
      icon: "strategy",
      mini: (g) => (
        <>
          <line x1="10" x2="126" y1="12" y2="12" className="s-st" strokeWidth="2" />
          <line x1="10" x2="68" y1="12" y2="12" stroke={g} strokeWidth="2" />
          <circle cx="10" cy="12" r="4.5" fill={g} />
          <circle cx="68" cy="12" r="4.5" fill={g} />
          <circle cx="126" cy="12" r="4.5" className="f-p" stroke="#00b4ff" strokeWidth="1.4" />
          {[
            ["Goal", 10],
            ["Offer", 68],
            ["Plan", 126],
          ].map(([t, x]) => (
            <text key={t} x={x} y="28" textAnchor="middle" className="scv-t f-ink2" fontSize="7" fontWeight="600">
              {t}
            </text>
          ))}
          {bar(0, 37, 70, 4, "f-mu2")}
          <rect x="92" y="33" width="44" height="12" rx="6" className="f-accsoft" />
          <text x="114" y="41.4" textAnchor="middle" className="scv-t f-acc" fontSize="6.4" fontWeight="700">Roadmap</text>
        </>
      ),
    },
    {
      key: "paid",
      title: "Paid Acquisition",
      desc: "Meta and Google campaigns that capture demand",
      icon: "paidMedia",
      mini: (g) => (
        <>
          {[0, 1].map((r) => (
            <g key={r}>
              <rect x="0" y={r * 24} width="136" height="20" rx="5" className="f-p2 s-st" strokeWidth=".7" />
              {r === 0 ? <MetaMark x={3} y={2} s={0.7} /> : <GoogleG x={5} y={28} s={11} />}
              {bar(24, r * 24 + 8, 70, 4, "f-mu")}
              <rect x="24" y={r * 24 + 8} width={r ? 58 : 46} height="4" rx="2" fill={r ? g : "#0866ff"} />
              <circle cx="104" cy={r * 24 + 10} r="2.4" className="f-succ" />
              <text x="109" y={r * 24 + 12.4} className="scv-t f-succ" fontSize="6.4" fontWeight="700">Live</text>
            </g>
          ))}
        </>
      ),
    },
    {
      key: "creative",
      title: "Creative",
      desc: "Ads, video and content that earn attention",
      icon: "studios",
      mini: (g) => (
        <>
          <rect x="0" y="0" width="38" height="46" rx="5" fill="#0a1a33" />
          <rect x="0" y="0" width="38" height="46" rx="5" fill={g} opacity=".5" />
          <path d="M15 17 v12 l10 -6z" fill="#fff" />
          <rect x="44" y="0" width="46" height="46" rx="5" fill={g} />
          {bar(50, 8, 30, 4.5, "gs-white")}
          {bar(50, 16, 20, 4, "gs-white2")}
          <rect x="50" y="32" width="18" height="7" rx="3.5" fill="#03101d" opacity=".75" />
          <rect x="96" y="0" width="40" height="46" rx="5" className="f-p2 s-st" strokeWidth=".7" />
          <text x="102" y="24" className="scv-t scv-display f-ink" fontSize="15" fontWeight="700">Aa</text>
          <circle cx="126" cy="36" r="5" fill="#ff7a59" />
          {bar(102, 33, 14, 3, "f-mu2")}
        </>
      ),
    },
    {
      key: "conversion",
      title: "Website & Conversion",
      desc: "Pages and funnels built to turn visits into leads",
      icon: "conversion",
      mini: (g) => (
        <>
          <rect x="0" y="0" width="136" height="46" rx="5" className="f-p2 s-st" strokeWidth=".7" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={6 + i * 5} cy="5" r="1.5" className="f-mu2" />
          ))}
          {bar(6, 13, 58, 5, "f-ink")}
          {bar(6, 22, 42, 3.5, "f-mu2")}
          <rect x="6" y="30" width="46" height="10" rx="3" fill={g} />
          <text x="29" y="37.2" textAnchor="middle" className="scv-t" fill="#03101d" fontSize="5.6" fontWeight="700">Book a call</text>
          <rect x="82" y="9" width="48" height="32" rx="4" className="f-p s-st" strokeWidth=".7" />
          {bar(87, 14, 38, 5, "f-mu")}
          {bar(87, 22, 38, 5, "f-mu")}
          <rect x="87" y="30" width="38" height="7" rx="2.5" fill={g} />
        </>
      ),
    },
    {
      key: "crm",
      title: "CRM",
      desc: "Every lead tracked through to a booked call",
      icon: "crm",
      mini: () => (
        <>
          {[
            ["New", 0, 2],
            ["Qualified", 46, 2],
            ["Booked", 92, 1],
          ].map(([t, x, n]) => (
            <g key={t as string}>
              <text x={(x as number) + 1} y="6" className="scv-t f-ink3" fontSize="6" fontWeight="700">
                {t}
              </text>
              {Array.from({ length: n as number }).map((_, i) => (
                <g key={i}>
                  <rect x={x as number} y={10 + i * 18} width="44" height="15" rx="4" className={t === "Booked" ? "f-succsoft s-succ" : "f-p2 s-st"} strokeWidth=".7" />
                  <circle cx={(x as number) + 7} cy={17.5 + i * 18} r="3.4" className={t === "Booked" ? "f-succ" : "f-mu2"} />
                  {bar((x as number) + 13, 14.5 + i * 18, 24, 2.8, "f-mu2")}
                  {bar((x as number) + 13, 19.5 + i * 18, 16, 2.4, "f-mu")}
                </g>
              ))}
            </g>
          ))}
          <path d="M125 34 l2.5 2.5 4.5 -5" fill="none" className="s-succ" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ),
    },
    {
      key: "automation",
      title: "Automation",
      desc: "Instant follow up so no lead is left waiting",
      icon: "automation",
      mini: (g) => (
        <>
          {[
            ["Lead in", 0],
            ["Reply", 50],
            ["Follow up", 100],
          ].map(([t, x], i) => (
            <g key={t as string}>
              <rect x={x as number} y="14" width="36" height="18" rx="5" className={i === 1 ? "f-p s-succ" : "f-p2 s-st"} strokeWidth=".8" />
              {i === 1 ? <circle cx={(x as number) + 6} cy="23" r="2.4" fill="#25D366" /> : null}
              <text x={(x as number) + (i === 1 ? 21 : 18)} y="25.2" textAnchor="middle" className="scv-t f-ink" fontSize="5.8" fontWeight="600">
                {t}
              </text>
            </g>
          ))}
          <path d="M37 23 h11 m-3 -2.6 l3 2.6 -3 2.6 M87 23 h11 m-3 -2.6 l3 2.6 -3 2.6" fill="none" stroke="#00b4ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M66 3 l-3 5.5 h3 l-2 5" fill="none" stroke="#00e5ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="72" y="9" className="scv-t f-succ" fontSize="5.8" fontWeight="700">Instant</text>
          {bar(0, 39, 136, 3, "f-mu")}
          <rect x="0" y="39" width="92" height="3" rx="1.5" fill={g} />
        </>
      ),
    },
    {
      key: "analytics",
      title: "Analytics",
      desc: "One clear view of what is driving growth",
      icon: "analytics",
      mini: (g, area) => (
        <>
          <rect x="0" y="0" width="136" height="46" rx="5" className="f-p2 s-st" strokeWidth=".7" />
          {[14, 26, 38].map((y) => (
            <line key={y} x1="6" x2="130" y1={y} y2={y} className="s-st" strokeWidth=".6" />
          ))}
          <path d="M6 38 C 22 36, 30 30, 44 30 S 66 22, 80 20 S 108 12, 130 7 V40 H6Z" fill={area} />
          <path d="M6 38 C 22 36, 30 30, 44 30 S 66 22, 80 20 S 108 12, 130 7" fill="none" stroke={g} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M6 40 C 30 39, 50 36, 80 33 S 116 28, 130 26" fill="none" className="s-ink3" strokeWidth="1" strokeDasharray="2 2.5" />
          <circle cx="130" cy="7" r="2.8" fill="#00e5ff" />
        </>
      ),
    },
];

/* ───────── geometry ───────── */
type Layout = { W: number; H: number; cx: number; cy: number; rx: number; ry: number; cardW: number };
const LAYOUTS: Record<"scene" | "compact", Layout> = {
  scene: { W: 600, H: 600, cx: 300, cy: 304, rx: 212, ry: 206, cardW: 25 },
  compact: { W: 640, H: 420, cx: 320, cy: 212, rx: 244, ry: 150, cardW: 22 },
};

function points(L: Layout, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    return { x: +(L.cx + L.rx * Math.cos(a)).toFixed(2), y: +(L.cy + L.ry * Math.sin(a)).toFixed(2) };
  });
}

/** Closed Catmull-Rom spline through the module centres = the Growth Ribbon. */
function closedCurve(pts: { x: number; y: number }[], k = 1) {
  const n = pts.length;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + ((p2.x - p0.x) / 6) * k;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * k;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * k;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * k;
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d + "Z";
}

function ModuleCard({ m }: { m: Mod }) {
  return (
    <div className="gs-card">
      <div className="gs-card-h">
        <span className="gs-ic">
          <Glyph name={m.icon} size={18} />
        </span>
        <span className="gs-ttl">{m.title}</span>
        <span className="gs-dot" />
      </div>
      <Mini draw={m.mini} />
    </div>
  );
}

/** Pauses SMIL pulses while off screen or under reduced motion. */
function useSmilVisibility(ref: React.RefObject<SVGSVGElement | null>) {
  useEffect(() => {
    const svg = ref.current;
    if (!svg || typeof svg.pauseAnimations !== "function") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    svg.pauseAnimations();
    if (reduce.matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations()), { rootMargin: "80px" });
    io.observe(svg);
    return () => io.disconnect();
  }, [ref]);
}

function Canvas({ variant, id, mods }: { variant: "scene" | "compact"; id: string; mods: Mod[] }) {
  const L = LAYOUTS[variant];
  const pts = points(L, mods.length);
  const ribbon = closedCurve(pts);
  const outer = closedCurve(pts.map((p) => ({ x: L.cx + (p.x - L.cx) * 1.045, y: L.cy + (p.y - L.cy) * 1.06 })));
  const inner = closedCurve(pts.map((p) => ({ x: L.cx + (p.x - L.cx) * 0.955, y: L.cy + (p.y - L.cy) * 0.94 })));
  const svgRef = useRef<SVGSVGElement>(null);
  useSmilVisibility(svgRef);
  const rid = `${id}rib`;
  return (
    <div data-gs-canvas className={`gs-canvas gs-${variant}`} style={{ aspectRatio: `${L.W} / ${L.H}`, ["--gs-cw" as string]: String(L.cardW) }}>
      <svg ref={svgRef} viewBox={`0 0 ${L.W} ${L.H}`} className="gs-svg" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}rg`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#00b4ff" />
            <stop offset=".55" stopColor="#00e5ff" />
            <stop offset="1" stopColor="#00b4ff" />
          </linearGradient>
          <radialGradient id={`${id}pulse`}>
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".35" stopColor="#7ff3ff" />
            <stop offset="1" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {variant === "scene" ? (
          <g data-gs-frame>
            <rect x="6" y="6" width={L.W - 12} height={L.H - 12} rx="34" fill="none" stroke={`url(#${id}rg)`} strokeOpacity=".55" strokeWidth="1.2" strokeDasharray="3 7" />
          </g>
        ) : null}
        {pts.map((p, i) => (
          <path key={i} data-gs-spoke d={`M${L.cx} ${L.cy} L${p.x} ${p.y}`} pathLength={1} className="gs-spoke" />
        ))}
        <path data-gs-ribbon d={ribbon} pathLength={1} fill="none" stroke={`url(#${id}rg)`} strokeWidth="12" opacity=".22" filter={`url(#${id}blur)`} />
        <path data-gs-ribbon d={outer} pathLength={1} fill="none" stroke={`url(#${id}rg)`} strokeWidth="1" opacity=".45" />
        <path data-gs-ribbon d={inner} pathLength={1} fill="none" stroke={`url(#${id}rg)`} strokeWidth="1" opacity=".35" />
        <path data-gs-ribbon id={rid} d={ribbon} pathLength={1} fill="none" stroke={`url(#${id}rg)`} strokeWidth="2.6" strokeLinecap="round" />
        <g data-gs-pulses>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <circle r={variant === "scene" ? 9 : 8} fill={`url(#${id}pulse)`}>
                <animateMotion dur="9s" repeatCount="indefinite" begin={`-${(i * 1.8).toFixed(1)}s`} rotate="auto">
                  <mpath href={`#${rid}`} />
                </animateMotion>
              </circle>
            </g>
          ))}
        </g>
      </svg>

      <div data-gs-hub className="gs-pt" style={{ left: `${(L.cx / L.W) * 100}%`, top: `${(L.cy / L.H) * 100}%` }}>
        <div className="gs-hub">
          <MadvertMark className="gs-hub-mark text-ink" />
          {variant === "scene" ? <span className="gs-hub-l">Growth Department</span> : null}
        </div>
      </div>

      {mods.map((m, i) => {
        const p = pts[i];
        const sx = ((p.x - L.cx) / L.W) * 0.26;
        const sy = ((p.y - L.cy) / L.W) * 0.26;
        return (
          <div
            key={m.key}
            data-gs-card
            data-sx={sx.toFixed(4)}
            data-sy={sy.toFixed(4)}
            data-rot={(i % 2 ? 1 : -1) * (3 + (i % 3))}
            className="gs-pt"
            style={{ left: `${(p.x / L.W) * 100}%`, top: `${(p.y / L.H) * 100}%` }}
          >
            <ModuleCard m={m} />
          </div>
        );
      })}

      {variant === "scene" ? (
        <div className="gs-status" aria-hidden="true">
          <span className="gs-st gs-st-apart">Separate services</span>
          <span className="gs-st gs-st-linking">Connecting the system</span>
          <span className="gs-st gs-st-linked">
            <i className="gs-st-dot" />
            One integrated growth department
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function GrowthSystem({ variant = "scene" }: { variant?: "scene" | "compact" }) {
  const id = "gs" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const mods = MODS;
  const root = useRef<HTMLDivElement>(null);

  useScrollScene(root, ({ motion, desktop }, el, { gsap }) => {
    if (variant !== "scene") return;
    const setPhase = (p: string) => (el.dataset.phase = p);
    if (!motion) {
      setPhase("linked");
      return;
    }
    if (desktop) {
      const canvas = el.querySelector<HTMLElement>("[data-gs-canvas]");
      if (!canvas) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-gs-card]", canvas);
      const w = () => canvas.offsetWidth;
      const from = (c: HTMLElement) => ({
        x: () => parseFloat(c.dataset.sx ?? "0") * w(),
        y: () => parseFloat(c.dataset.sy ?? "0") * w(),
        rotate: parseFloat(c.dataset.rot ?? "0"),
      });
      setPhase("apart");
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: canvas,
          start: "top 88%",
          end: "center 42%",
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (st) => setPhase(st.progress < 0.52 ? "apart" : st.progress < 0.86 ? "linking" : "linked"),
        },
      });
      // 1. modules appear one by one, physically separated, in story order
      cards.forEach((c, i) => {
        const f = from(c);
        tl.fromTo(c, { autoAlpha: 0, scale: 0.86, ...f }, { autoAlpha: 1, scale: 1, ...f, duration: 0.7 }, i * 0.7);
      });
      // 2. they move in and lock together around the hub
      tl.fromTo(canvas.querySelector("[data-gs-hub]"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 1 }, 5.3);
      tl.to(cards, { x: 0, y: 0, rotate: 0, duration: 1.7, ease: "power3.inOut", stagger: 0.05 }, 5.2);
      // 3. connections draw and the Growth Ribbon closes the loop
      tl.fromTo(canvas.querySelectorAll("[data-gs-spoke]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.06, ease: "none" }, 6.5);
      tl.fromTo(canvas.querySelectorAll("[data-gs-ribbon]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "none" }, 6.8);
      // 4. data starts moving, the department frame closes around everything
      tl.fromTo(canvas.querySelector("[data-gs-pulses]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 8.2);
      tl.fromTo(canvas.querySelector("[data-gs-frame]"), { autoAlpha: 0, scale: 0.97, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.8 }, 8.3);
      tl.to({}, { duration: 0.5 });
      return () => setPhase("linked");
    }
    // mobile / tablet: simple rail that fills while the modules reveal in sequence
    const list = el.querySelector<HTMLElement>("[data-gs-list]");
    const fill = el.querySelector<HTMLElement>("[data-gs-fill]");
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-gs-item]"));
    if (!list || !fill) return;
    gsap.fromTo(
      fill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: list,
          start: "top 70%",
          end: "bottom 70%",
          scrub: 0.4,
          onUpdate: (st) => items.forEach((n, i) => n.classList.toggle("is-on", st.progress >= i / items.length - 0.01)),
        },
      },
    );
    return () => items.forEach((n) => n.classList.add("is-on"));
  });

  if (variant === "compact") {
    return (
      <div ref={root} className="gs-vars gs-root gs-root-compact" aria-hidden="true">
        <Canvas variant="compact" id={id} mods={mods} />
      </div>
    );
  }

  return (
    <div ref={root} className="gs-vars gs-root" data-phase="linked">
      <div className="hidden lg:block" role="img" aria-label="Strategy, paid acquisition, creative, website and conversion, CRM, automation and analytics connected by the Madvert Growth Ribbon into one growth department.">
        <Canvas variant="scene" id={id} mods={mods} />
      </div>

      <div data-gs-list className="gs-list lg:hidden">
        <span className="gs-rail" aria-hidden="true">
          <span data-gs-fill className="gs-rail-fill" />
          <span className="gs-rail-pulse" />
        </span>
        <ol className="gs-ol" aria-label="One connected growth department">
        {mods.map((m, i) => (
          <li key={m.key} data-gs-item data-reveal style={{ ["--reveal-delay" as string]: 40 }} className="gs-item is-on">
            <span className="gs-node" aria-hidden="true">
              {i + 1}
            </span>
            <div className="gs-mcard">
              <div className="gs-mtext">
                <span className="gs-mic" aria-hidden="true">
                  <Glyph name={m.icon} size={18} />
                </span>
                <p className="gs-mtitle">{m.title}</p>
                <p className="gs-mdesc">{m.desc}</p>
              </div>
              <div className="gs-mmini">
                <Mini draw={m.mini} />
              </div>
            </div>
          </li>
        ))}
        <li data-gs-item data-reveal className="gs-item gs-item-final is-on">
          <span className="gs-node gs-node-final" aria-hidden="true">
            <MadvertMark className="h-2.5 w-auto text-[#03101d]" />
          </span>
          <div className="gs-final">
            <p className="gs-final-k">
              <i className="gs-st-dot" aria-hidden="true" /> Connected
            </p>
            <p className="gs-final-t">One integrated growth department.</p>
            <p className="gs-final-d">Every module shares the same data, the same goals and the same team.</p>
          </div>
        </li>
        </ol>
      </div>
    </div>
  );
}
