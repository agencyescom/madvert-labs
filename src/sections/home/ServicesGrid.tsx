import Link from "next/link";
import { Arrow } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { ServiceVisual, type ServiceVisualKey } from "@/components/visuals/service-cards/ServiceVisuals";
import { ServiceCardsLive } from "@/components/visuals/service-cards/ServiceCardsLive";
import { GrowthSystem } from "@/components/visuals/growth-system/GrowthSystem";
import "@/styles/service-cards.css";

type Svc = { key: string; title: string; headline: string; body: string; href: string; visual: ServiceVisualKey };

const services: Svc[] = [
  { key: "meta", title: "Meta Ads Lead Generation", headline: "Turn Paid Attention Into Qualified Opportunities.", body: "Campaigns, creative, funnels and qualification designed around better lead quality.", href: "/services/client-acquisition#paid-acquisition", visual: "meta" },
  { key: "google", title: "Google Ads Lead Generation", headline: "Capture Demand When Buyers Are Already Searching.", body: "High intent search campaigns connected to conversion focused landing experiences.", href: "/services/client-acquisition#paid-acquisition", visual: "google" },
  { key: "seo", title: "SEO", headline: "Build Demand You Don’t Have to Rent.", body: "Technical SEO, content, local visibility and authority designed to compound.", href: "/services/client-acquisition#organic", visual: "seo" },
  { key: "ai-seo", title: "AI SEO", headline: "Be Discoverable Where Search Is Going Next.", body: "Improve visibility across AI assisted search and modern answer driven discovery.", href: "/services/client-acquisition#search-shift", visual: "ai" },
  { key: "development", title: "Full Stack Development", headline: "If Growth Needs a Tool, We Build the Tool.", body: "Websites, web apps, mobile apps, dashboards, portals and custom business systems.", href: "/services/tech-product-development", visual: "dev" },
  { key: "branding", title: "Branding", headline: "A Serious Business Should Look Like One.", body: "Brand identity, positioning and visual systems designed to make your business recognisable.", href: "/services/branding-marketing", visual: "brand" },
  { key: "short-form", title: "Short Form Video Editing", headline: "Earn the Next Second of Attention.", body: "Fast, polished short form content built for social feeds and modern audiences.", href: "/studios", visual: "short" },
  { key: "motion", title: "Motion Graphics Video Editing", headline: "Make Complex Ideas Move.", body: "Premium motion design, kinetic typography and visual storytelling for brands, ads and explainers.", href: "/studios", visual: "motion" },
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
      <ServiceVisual name={s.visual} />
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
    <section id="what-we-do" className="section relative" aria-labelledby="services-grid-title">
      <ServiceCardsLive scope="what-we-do" />
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
            <div className="relative mt-6 flex flex-1 items-center">
              <GrowthSystem variant="compact" />
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
