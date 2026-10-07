import type { Metadata } from "next";
import { getResources } from "@/cms";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ResourceList } from "@/sections/cases/ResourceList";
import { FinalCta } from "@/sections/shared/FinalCta";

const description = "The Madvert Vault: guides, audits, playbooks, tools and ideas built to help you think more clearly about growth.";

export const metadata: Metadata = pageMetadata({ title: "Madvert Vault", description, path: "/resources" });

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-[calc(var(--header-h)+40px)]" aria-labelledby="page-title">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-x relative">
          <Breadcrumbs items={[{ name: "Madvert Vault", path: "/resources" }]} />
          <div className="mt-14 max-w-[900px]">
            <div data-reveal>
              <Eyebrow>Madvert Vault</Eyebrow>
            </div>
            <h1 id="page-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-display mt-7">
              Useful Stuff for <span className="t-grad">People Running Businesses.</span>
            </h1>
            <p data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-lead measure mt-7">
              Guides, audits, playbooks, tools and ideas built to help you think more clearly about growth.
            </p>
            <p data-reveal style={{ ["--reveal-delay" as string]: 160 }} className="mt-3 text-[15px] text-ink-3">
              No two thousand word articles written only to impress Google.
            </p>
          </div>
        </div>
      </section>
      <section className="section-tight pt-10" aria-label="Resources">
        <div className="container-x">
          <ResourceList resources={resources} />
        </div>
      </section>
      <FinalCta title="Take the Value. Use It." accent="Call Us When You Need the System Built." primary={{ label: "Book a Business Strategy Call", href: site.primaryCta.href }} />
    </>
  );
}
