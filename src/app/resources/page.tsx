import type { Metadata } from "next";
import { getResources } from "@/cms";
import { BookingSection } from "@/components/booking/BookingSection";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/seo";
import { ResourceList } from "@/sections/cases/ResourceList";

const description =
  "The Madvert Vault: free playbooks, checklists and growth resources for business owners, on offers, hooks, video ads, landing pages, SEO and AI search, Meta ads, lead engines and automation.";

export const metadata: Metadata = pageMetadata({ title: "Madvert Vault", description, path: "/resources" });

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <>
      <ResourceList
        resources={resources}
        intro={
          <>
            <Breadcrumbs items={[{ name: "Madvert Vault", path: "/resources" }]} />
            <div className="mt-10">
              <Eyebrow>Free Growth Resources</Eyebrow>
            </div>
            <h1 id="page-title" className="vt-title mt-6">
              Madvert <span className="t-grad">Vault</span>
            </h1>
            <p className="t-lead mt-6 max-w-[30ch] !text-[clamp(19px,1.7vw,24px)] text-ink-2">
              Free Playbooks, Checklists &amp; Growth Resources for Business Owners.
            </p>
            <p className="mt-3 text-[15px] text-ink-3">
              No two thousand word articles written only to impress Google.
            </p>
          </>
        }
      />
      <BookingSection
        title="Take the Value. Use It."
        accent="Call Us When You Need the System Built."
        body="Book a Business Strategy Call and we will look at where the ideas in the Vault apply to your business."
        context="resources"
      />
    </>
  );
}
