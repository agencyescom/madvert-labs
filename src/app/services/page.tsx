import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs } from "@/cms";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Arrow } from "@/components/ui/Button";
import { Icon3D } from "@/components/ui/Icon3D";
import { Eyebrow } from "@/components/ui/Section";
import { GrowthRibbon } from "@/components/visuals/GrowthRibbon";
import { pageMetadata } from "@/lib/seo";
import { pillars, site } from "@/lib/site";
import { Philosophy } from "@/sections/home/Philosophy";
import { GrowthLoop } from "@/sections/home/GrowthLoop";
import { AnswerBlock } from "@/sections/services/Blocks";
import { FinalCta } from "@/sections/shared/FinalCta";

const description =
  "Branding, client acquisition, conversion, creative production, automation and technology, connected into one growth system. See how Madvert Labs works.";

export const metadata: Metadata = pageMetadata({ title: "What We Do", description, path: "/services" });

export default async function ServicesPage() {
  const faqs = await getFaqs("home");
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+40px)] md:pb-24" aria-labelledby="page-title">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="bg-aura pointer-events-none absolute inset-0" aria-hidden="true" />
        <GrowthRibbon shape="rise" spread={60} className="absolute -bottom-16 left-0 h-[260px] w-full" opacity={0.4} id="services-ribbon" />
        <div className="container-x relative">
          <Breadcrumbs items={[{ name: "What We Do", path: "/services" }]} />
          <div className="mt-14 max-w-[940px]">
            <div data-reveal>
              <Eyebrow>What We Do</Eyebrow>
            </div>
            <h1 id="page-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-display mt-7">
              Beyond Advertising. <span className="t-grad">We Build Growth Systems.</span>
            </h1>
            <p data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="t-lead measure mt-7">
              {site.promise} We identify what growth requires, then build around it.
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight" aria-label="Services">
        <div className="container-x">
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p, i) => (
              <li key={p.key} data-reveal style={{ ["--reveal-delay" as string]: (i % 3) * 80 }}>
                <Link
                  href={p.href}
                  data-track="service_cta_click"
                  data-track-label={`services_${p.key}`}
                  className="panel group/btn flex h-full flex-col p-7 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-line-strong sm:p-8"
                >
                  <Icon3D name={p.icon} size="lg" />
                  <p className="mt-8 font-display text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-3">{p.title}</p>
                  <h2 className="t-h3 mt-3">{p.headline}</h2>
                  <p className="t-body mt-4">{p.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-8 text-[14.5px] font-semibold text-accent-text">
                    {p.cta} <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Philosophy />

      <section className="section pb-0" aria-labelledby="loop-title">
        <div className="container-x">
          <h2 id="loop-title" data-reveal className="t-h1 max-w-[900px]">
            We Start With the Problem. <span className="t-grad">Not the Service We Want to Sell You.</span>
          </h2>
          <GrowthLoop />
        </div>
      </section>

      <AnswerBlock
        service="Madvert Labs"
        glance={[
          { label: "Who we serve", value: "Established businesses that want one growth partner across marketing, sales follow up, data and technology." },
          { label: "What we do", value: "Branding, client acquisition, conversion, creative production, automation and revenue systems, tech and product development." },
          { label: "How we work", value: "Diagnose, build, connect, compound. The business problem comes before the channel." },
          { label: "What we measure", value: "Qualified opportunities, conversion, response speed and revenue, not dashboard applause." },
        ]}
        faqs={faqs}
      />

      <FinalCta title="Bring Us the Business Problem." accent="We Will Start There." primary={site.founderCta} secondary={{ label: site.auditCta.label, href: site.auditCta.href }} />
    </>
  );
}
