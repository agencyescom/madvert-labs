import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Arrow, Cta } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { GrowthRibbon } from "@/components/visuals/GrowthRibbon";

export function ServiceHero({
  eyebrow,
  title,
  accent,
  campaignLine,
  sub,
  primary,
  secondary,
  crumbs,
  visual,
  track = "service_cta_click",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  campaignLine?: string;
  sub: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string; track?: string };
  crumbs: { name: string; path: string }[];
  visual?: ReactNode;
  track?: string;
}) {
  return (
    <section className="relative overflow-hidden pb-20 pt-[calc(var(--header-h)+40px)] md:pb-28" aria-labelledby="page-title">
      <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="bg-aura pointer-events-none absolute inset-0" aria-hidden="true" />
      <GrowthRibbon shape="rise" spread={60} className="absolute -bottom-16 left-0 h-[260px] w-full" opacity={0.4} id="svc-hero-ribbon" />
      <div className="container-x relative">
        <Breadcrumbs items={crumbs} />
        <div className={`mt-12 grid grid-cols-1 items-center gap-14 md:mt-16 ${visual ? "lg:grid-cols-12 lg:gap-8" : ""}`}>
          <div className={visual ? "lg:col-span-7" : "max-w-[900px]"}>
            <div data-reveal>
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
            <h1 id="page-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-display mt-7 !text-[clamp(36px,4.4vw,64px)]">
              {title} {accent ? <span className="t-grad">{accent}</span> : null}
            </h1>
            {campaignLine ? (
              <p data-reveal style={{ ["--reveal-delay" as string]: 110 }} className="t-h3 mt-6 text-ink-2">
                {campaignLine}
              </p>
            ) : null}
            <div data-reveal style={{ ["--reveal-delay" as string]: 150 }} className="t-lead measure mt-6">
              {sub}
            </div>
            <div data-reveal style={{ ["--reveal-delay" as string]: 220 }} className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Cta href={primary.href} size="lg" track={track} trackLabel={primary.label}>
                {primary.label}
              </Cta>
              {secondary ? (
                <Link
                  href={secondary.href}
                  data-track={secondary.track ?? "free_value_click"}
                  data-track-label={secondary.label}
                  className="group/btn inline-flex items-center gap-2 text-[15px] font-medium text-accent-text"
                >
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]">Free</span>
                  {secondary.label}
                  <Arrow />
                </Link>
              ) : null}
            </div>
          </div>
          {visual ? (
            <div data-reveal="fade" style={{ ["--reveal-delay" as string]: 200 }} className="lg:col-span-5">
              {visual}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
