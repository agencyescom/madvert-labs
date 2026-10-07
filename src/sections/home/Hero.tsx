import { Cta, PlayGlyph } from "@/components/ui/Button";
import { Glyph, type IconName } from "@/components/ui/Icon3D";
import { Eyebrow } from "@/components/ui/Section";
import { GrowthRibbon } from "@/components/visuals/GrowthRibbon";
import { site } from "@/lib/site";
import type { ImageAsset } from "@/types/content";
import { HeroVisual } from "./HeroVisual";

const proof: { label: string; icon: IconName }[] = [
  { label: "Certified Marketing Team", icon: "tracking" },
  { label: "International Market Experience", icon: "seo" },
  { label: "Qualified Lead Focus", icon: "acquisition" },
  { label: "Built for What Is Next", icon: "growth" },
];

export function Hero({ image }: { image?: ImageAsset }) {
  return (
    <section className="relative overflow-hidden pb-20 pt-[calc(var(--header-h)+56px)] md:pb-28 lg:pt-[calc(var(--header-h)+72px)]" aria-labelledby="hero-title">
      <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="bg-aura pointer-events-none absolute inset-0" aria-hidden="true" />
      <GrowthRibbon shape="rise" spread={70} className="absolute -bottom-10 left-0 h-[300px] w-full" opacity={0.55} id="hero-ribbon" />

      <div className="container-x relative grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7 xl:col-span-6">
          <div data-reveal>
            <Eyebrow>Digital Marketing and Growth Systems</Eyebrow>
          </div>
          <h1 id="hero-title" data-reveal style={{ ["--reveal-delay" as string]: 80 }} className="t-display mt-7 !text-[clamp(38px,4.6vw,66px)]">
            Your Business Does Not Need More Marketing. <span className="t-grad">It Needs a Growth System That Actually Works.</span>
          </h1>
          <p data-reveal style={{ ["--reveal-delay" as string]: 160 }} className="t-lead measure mt-7">
            Madvert Labs connects branding, customer acquisition, conversion, creative, automation and technology into one
            intelligent growth system built around your business.
          </p>
          <p data-reveal style={{ ["--reveal-delay" as string]: 220 }} className="measure mt-4 text-[15.5px] leading-relaxed text-ink-3">
            So your ads stop working alone. Your leads stop falling through cracks. And your marketing starts feeling like one
            machine instead of six separate vendors.
          </p>
          <div data-reveal style={{ ["--reveal-delay" as string]: 280 }} className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Cta href={site.founderCta.href} size="lg" track="hero_strategy_call_click" className="!whitespace-normal text-center">
              {site.founderCta.label}
            </Cta>
            <Cta href="/services" variant="secondary" size="lg" arrow={false} icon={<PlayGlyph />} track="service_cta_click" trackLabel="hero_see_how">
              See How Madvert Works
            </Cta>
          </div>
        </div>

        <div className="px-6 sm:px-10 lg:col-span-5 lg:px-0 xl:col-span-6" data-reveal="fade" style={{ ["--reveal-delay" as string]: 200 }}>
          <HeroVisual image={image} />
        </div>
      </div>

      <div className="container-x relative mt-16 md:mt-20">
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-[var(--line)] lg:grid-cols-4">
          {proof.map((p) => (
            <li key={p.label} className="flex items-center gap-3.5 bg-bg px-5 py-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-surface">
                <Glyph name={p.icon} size={20} />
              </span>
              <span className="font-display text-[13.5px] font-semibold leading-snug text-ink-2">{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
