import type { Metadata } from "next";
import { getCaseStudies } from "@/cms";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { CaseFilters } from "@/sections/cases/CaseFilters";
import { FinalCta } from "@/sections/shared/FinalCta";

const description = "Real problems. Real decisions. Real work. Real outcomes. Madvert Labs case studies across acquisition, SEO, branding, studios, automation and technology.";

export const metadata: Metadata = pageMetadata({ title: "Case Studies", description, path: "/case-studies" });

export default async function CaseStudiesPage() {
  const studies = await getCaseStudies();
  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-[calc(var(--header-h)+40px)]" aria-labelledby="page-title">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-x relative">
          <Breadcrumbs items={[{ name: "Case Studies", path: "/case-studies" }]} />
          <div className="mt-14 max-w-[900px]">
            <div data-reveal>
              <Eyebrow>The Madvert Evidence Room</Eyebrow>
            </div>
            <h1 id="page-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-display mt-7">
              Less “Trust Us.” <span className="t-grad">More “Here Is What Happened.”</span>
            </h1>
            <p data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="t-lead mt-7">
              Real problems. Real decisions. Real work. Real outcomes.
            </p>
          </div>
        </div>
      </section>
      <section className="section-tight pt-10" aria-label="Case studies">
        <div className="container-x">
          <CaseFilters studies={studies} />
        </div>
      </section>
      <FinalCta title="Want Us to Look at" accent="Your Growth System?" primary={{ label: "Book a Business Strategy Call", href: site.primaryCta.href }} />
    </>
  );
}
