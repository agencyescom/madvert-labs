import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { MadvertMark } from "@/components/ui/MadvertMark";

type Svc = { key: string; title: string; headline: string; body: string; href: string; visual: ReactNode };

const C = "#00e5ff";
const B = "#00b4ff";
const line = "var(--line-strong)";
const soft = "var(--line)";

/* Mini visualisations. Each reacts to the card's hover/focus state through .svc-card:hover rules in globals.css. */
const V = {
  meta: (
    <svg viewBox="0 0 240 120" className="svc-v svc-meta h-full w-full" aria-hidden="true">
      <rect x="12" y="14" width="216" height="34" rx="9" fill="var(--surface)" stroke={line} />
      <text x="26" y="35" fontSize="11" fill="var(--ink-2)">Lead campaign</text>
      <rect x="180" y="23" width="34" height="16" rx="8" fill={soft} className="svc-toggle-track" />
      <circle cx="188" cy="31" r="6" fill="#fff" className="svc-toggle-knob" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={24 + i * 32} y={108 - (12 + i * 9)} width="18" height={12 + i * 9} rx="3" fill={i > 3 ? C : B} opacity={0.35 + i * 0.1} className="svc-bar" style={{ transitionDelay: `${i * 50}ms` }} />
      ))}
    </svg>
  ),
  google: (
    <svg viewBox="0 0 240 120" className="svc-v svc-google h-full w-full" aria-hidden="true">
      <rect x="12" y="8" width="216" height="20" rx="10" fill="var(--surface)" stroke={line} />
      <circle cx="26" cy="18" r="4" fill="none" stroke={B} strokeWidth="1.6" />
      <rect x="36" y="15" width="90" height="6" rx="3" fill={soft} />
      <g className="svc-g-others">
        <rect x="12" y="38" width="216" height="22" rx="6" fill="var(--surface)" stroke={soft} />
        <rect x="12" y="66" width="216" height="22" rx="6" fill="var(--surface)" stroke={soft} />
      </g>
      <g className="svc-g-you">
        <rect x="12" y="94" width="216" height="22" rx="6" fill="rgb(0 200 255 / .12)" stroke={C} />
        <text x="22" y="109" fontSize="10" fontWeight="700" fill="var(--accent-text)">Ad · Your Business</text>
      </g>
    </svg>
  ),
  seo: (
    <svg viewBox="0 0 240 120" className="svc-v svc-seo h-full w-full" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <text x="14" y={26 + i * 25} fontSize="10" fill="var(--ink-3)">
            #{i + 1}
          </text>
          <rect x="36" y={16 + i * 25} width={150 - i * 18} height="12" rx="6" fill={soft} />
        </g>
      ))}
      <g className="svc-seo-you">
        <rect x="36" y="91" width="150" height="12" rx="6" fill={C} opacity=".85" />
        <path d="M206 104 V 26 M198 34 l8 -9 8 9" fill="none" stroke={C} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 240 120" className="svc-v svc-ai h-full w-full" aria-hidden="true">
      <rect x="110" y="8" width="118" height="22" rx="11" fill={soft} />
      <rect x="12" y="38" width="190" height="72" rx="12" fill="var(--surface)" stroke={line} />
      <rect x="24" y="52" width="150" height="7" rx="3.5" fill={soft} />
      <rect x="24" y="66" width="120" height="9" rx="4.5" fill={C} className="svc-ai-hit" />
      <rect x="24" y="82" width="140" height="7" rx="3.5" fill={soft} />
      <path d="M206 44 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill={C} className="svc-ai-spark" />
    </svg>
  ),
  dev: (
    <svg viewBox="0 0 240 120" className="svc-v svc-dev h-full w-full" aria-hidden="true">
      <g className="svc-dev-laptop">
        <rect x="30" y="16" width="140" height="84" rx="8" fill="var(--surface)" stroke={line} />
        <rect x="42" y="28" width="50" height="60" rx="4" fill={soft} />
        <rect x="100" y="28" width="58" height="26" rx="4" fill="none" stroke={C} />
        <rect x="100" y="60" width="58" height="28" rx="4" fill={soft} />
        <rect x="18" y="100" width="164" height="7" rx="3.5" fill={line} />
      </g>
      <g className="svc-dev-phone">
        <rect x="172" y="30" width="42" height="80" rx="9" fill="var(--surface)" stroke={line} />
        <rect x="180" y="42" width="26" height="16" rx="3" fill="none" stroke={C} />
        <circle cx="193" cy="98" r="3.5" fill={C} />
      </g>
    </svg>
  ),
  brand: (
    <svg viewBox="0 0 240 120" className="svc-v svc-brand h-full w-full" aria-hidden="true">
      <rect x="20" y="12" width="64" height="44" rx="8" fill="var(--surface)" stroke={line} className="svc-b1" />
      <rect x="92" y="12" width="64" height="44" rx="8" fill={B} opacity=".8" className="svc-b2" />
      <rect x="164" y="12" width="56" height="96" rx="8" fill="var(--surface)" stroke={line} className="svc-b3" />
      <rect x="20" y="64" width="136" height="44" rx="8" fill="var(--surface)" stroke={line} className="svc-b4" />
      <text x="34" y="92" fontSize="15" fontWeight="800" fill="var(--ink)" fontFamily="var(--font-display)">Aa</text>
      <circle cx="132" cy="86" r="10" fill={C} />
    </svg>
  ),
  short: (
    <svg viewBox="0 0 240 120" className="svc-v svc-short h-full w-full" aria-hidden="true">
      <rect x="92" y="6" width="56" height="100" rx="10" fill="var(--surface)" stroke={line} />
      <path d="M114 46 v20 l16 -10z" fill={C} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={20 + i * 30} y="110" width="26" height="6" rx="3" fill={i === 3 ? C : soft} />
      ))}
      <rect x="20" y="108" width="2.5" height="10" fill="#fff" className="svc-playhead" />
    </svg>
  ),
  motion: (
    <svg viewBox="0 0 240 120" className="svc-v svc-motion h-full w-full" aria-hidden="true">
      {"MOVE".split("").map((ch, i) => (
        <text key={i} x={48 + i * 40} y="72" fontSize="40" fontWeight="800" fontFamily="var(--font-display)" fill={i % 2 ? C : "var(--ink)"} className="svc-letter" style={{ transitionDelay: `${i * 70}ms` }}>
          {ch}
        </text>
      ))}
      <path d="M30 92 C 80 110, 160 70, 214 94" fill="none" stroke={C} strokeWidth="2" pathLength={1} className="svc-motion-path" />
    </svg>
  ),
};

function Ecosystem() {
  const nodes = ["Strategy", "Paid Media", "Search", "Content", "Creative", "Conversion", "CRM", "Automation", "Analytics"];
  return (
    <div className="svc-v svc-eco relative mx-auto aspect-[16/10] w-full max-w-[560px]" aria-hidden="true">
      <svg viewBox="0 0 400 250" className="absolute inset-0 h-full w-full">
        {nodes.map((_, i) => {
          const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
          const x = 200 + 160 * Math.cos(a);
          const y = 125 + 95 * Math.sin(a);
          return <path key={i} d={`M200 125 Q ${(200 + x) / 2 + 12} ${(125 + y) / 2 - 12} ${x} ${y}`} fill="none" stroke={C} strokeWidth="1.4" pathLength={1} className="svc-eco-link" style={{ transitionDelay: `${i * 40}ms` }} />;
        })}
        <ellipse cx="200" cy="125" rx="160" ry="95" fill="none" stroke={line} strokeDasharray="2 6" />
      </svg>
      <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-[rgb(0_200_255/0.45)] bg-[var(--surface-solid)] shadow-[0_0_40px_-8px_rgb(0_200_255/0.6)]">
        <MadvertMark className="h-5 w-auto text-ink" />
      </div>
      {nodes.map((n, i) => {
        const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={n}
            className="svc-eco-node absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line-strong bg-[var(--surface-solid)] px-2.5 py-1 text-[11px] font-semibold text-ink-2 sm:text-[12px]"
            style={{ left: `${50 + 40 * Math.cos(a)}%`, top: `${50 + 38 * Math.sin(a)}%`, transitionDelay: `${i * 40}ms` }}
          >
            {n}
          </span>
        );
      })}
    </div>
  );
}

const services: Svc[] = [
  { key: "meta", title: "Meta Ads Lead Generation", headline: "Turn Paid Attention Into Qualified Opportunities.", body: "Campaigns, creative, funnels and qualification designed around better lead quality.", href: "/services/client-acquisition#paid-acquisition", visual: V.meta },
  { key: "google", title: "Google Ads Lead Generation", headline: "Capture Demand When Buyers Are Already Searching.", body: "High intent search campaigns connected to conversion focused landing experiences.", href: "/services/client-acquisition#paid-acquisition", visual: V.google },
  { key: "seo", title: "SEO", headline: "Build Demand You Don’t Have to Rent.", body: "Technical SEO, content, local visibility and authority designed to compound.", href: "/services/client-acquisition#organic", visual: V.seo },
  { key: "ai-seo", title: "AI SEO", headline: "Be Discoverable Where Search Is Going Next.", body: "Improve visibility across AI assisted search and modern answer driven discovery.", href: "/services/client-acquisition#search-shift", visual: V.ai },
  { key: "development", title: "Full Stack Development", headline: "If Growth Needs a Tool, We Build the Tool.", body: "Websites, web apps, mobile apps, dashboards, portals and custom business systems.", href: "/services/tech-product-development", visual: V.dev },
  { key: "branding", title: "Branding", headline: "A Serious Business Should Look Like One.", body: "Brand identity, positioning and visual systems designed to make your business recognisable.", href: "/services/branding-marketing", visual: V.brand },
  { key: "short-form", title: "Short Form Video Editing", headline: "Earn the Next Second of Attention.", body: "Fast, polished short form content built for social feeds and modern audiences.", href: "/studios", visual: V.short },
  { key: "motion", title: "Motion Graphics Video Editing", headline: "Make Complex Ideas Move.", body: "Premium motion design, kinetic typography and visual storytelling for brands, ads and explainers.", href: "/studios", visual: V.motion },
];

function Card({ s, i }: { s: Svc; i: number }) {
  return (
    <div data-reveal style={{ ["--reveal-delay" as string]: 60 + (i % 4) * 70 }} className="h-full">
    <Link
      href={s.href}
      data-track="service_card_click"
      data-track-label={s.key}
      className="svc-card group/btn flex h-full flex-col rounded-[24px] border border-line bg-[var(--surface-card)] p-5 backdrop-blur-sm"
    >
      <div className="h-[118px] overflow-hidden rounded-2xl bg-bg-2 px-2 py-1">{s.visual}</div>
      <p className="mt-5 font-display text-[11.5px] font-semibold uppercase tracking-[0.16em] text-accent-text">{s.title}</p>
      <h3 className="mt-2 font-display text-[18px] font-semibold leading-snug tracking-tight text-ink">{s.headline}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-3">{s.body}</p>
      <span className="svc-cta mt-auto inline-flex items-center gap-2 pt-4 text-[14px] font-semibold text-accent-text">
        Explore <Arrow />
      </span>
    </Link>
    </div>
  );
}

export function ServicesGrid() {
  return (
    <section className="section relative" aria-labelledby="services-grid-title">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div data-reveal>
              <Eyebrow>What We Do</Eyebrow>
            </div>
            <h2 id="services-grid-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h1 mt-6">
              Everything Your Growth System <span className="t-grad">Might Need.</span>
            </h2>
          </div>
          <p data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-body lg:col-span-4 lg:col-start-9">
            From demand generation and search visibility to creative, branding and technology, Madvert Labs brings the critical pieces of modern growth under one team.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div data-reveal className="sm:col-span-2 lg:row-span-2">
          <Link
            href="#hire"
            data-track="service_card_click"
            data-track-label="full-stack-digital-marketing"
            className="svc-card group/btn relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[rgb(0_200_255/0.3)] bg-[var(--surface-card)] p-6 backdrop-blur-sm sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_20%,rgb(0_200_255/0.16),transparent_70%)]" aria-hidden="true" />
            <span className="relative self-start rounded-full bg-[linear-gradient(100deg,#00b4ff,#00e5ff)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-on-accent">Flagship</span>
            <p className="relative mt-5 font-display text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-text">Full Stack Digital Marketing</p>
            <h3 className="t-h2 relative mt-3 !text-[clamp(26px,2.6vw,36px)]">
              Your Entire Digital Growth Stack. <span className="t-grad">Connected.</span>
            </h3>
            <p className="t-body relative mt-4 max-w-[520px]">
              Strategy, paid media, search, content, creative, conversion, CRM, automation and analytics working as one coordinated growth system.
            </p>
            <div className="relative mt-6 flex-1">
              <Ecosystem />
            </div>
            <span className="svc-cta relative mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-accent-text">
              See how the system works <Arrow />
            </span>
          </Link>
          </div>
          {services.map((s, i) => (
            <Card key={s.key} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
