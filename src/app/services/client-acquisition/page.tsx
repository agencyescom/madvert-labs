import type { Metadata } from "next";
import { getFaqs } from "@/cms";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, schema } from "@/lib/seo";
import { site } from "@/lib/site";
import { ServiceHero } from "@/sections/services/ServiceHero";
import { AnswerBlock, Capability, FreeValue, Statement } from "@/sections/services/Blocks";
import { CheapLeads, LeadRadar, QualifyingForm, SearchSurfaces, StreamsMerge } from "@/sections/services/Visuals";
import { FinalCta } from "@/sections/shared/FinalCta";

const path = "/services/client-acquisition";
const description =
  "Qualified customer acquisition across paid media, SEO, local SEO, AEO and AI search visibility. Madvert Labs builds demand your sales team actually wants to call.";

export const metadata: Metadata = pageMetadata({ title: "Client Acquisition", description, path });

export default async function AcquisitionPage() {
  const faqs = await getFaqs("client-acquisition");
  return (
    <>
      <ServiceHero
        eyebrow="Client Acquisition"
        title="Your Sales Team Does Not Need More Phone Numbers."
        accent="It Needs More People Worth Calling."
        sub="Madvert builds qualified customer acquisition systems across paid and organic channels so your sales team spends more time speaking with real opportunities and less time chasing noise."
        primary={{ label: "Build Qualified Demand", href: "/contact?service=client-acquisition" }}
        secondary={{ label: "Get the Lead Generation Playbook", href: "/resources/qualified-lead-generation-playbook" }}
        crumbs={[
          { name: "What We Do", path: "/services" },
          { name: "Client Acquisition", path },
        ]}
        visual={<LeadRadar />}
      />

      <section className="section">
        <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <h2 data-reveal className="t-h1">
              The Cheapest Lead Can Become <span className="t-grad">the Most Expensive One.</span>
            </h2>
            <p data-reveal className="t-h3 mt-8 max-w-[520px]">
              Low CPL Does Not Automatically Mean Good Acquisition.
            </p>
          </div>
          <div data-reveal="fade" className="lg:col-span-5 lg:col-start-8">
            <CheapLeads />
          </div>
        </div>
      </section>

      <Statement
        title="More Leads Is a Volume Problem."
        accent="Better Leads Is a System Problem."
        lines={["Qualification starts before the form.", "With the audience.", "The offer.", "The creative.", "The promise.", "The questions.", "The landing experience.", "And what happens after the enquiry."]}
      />

      <Capability
        id="paid-acquisition"
        index="01"
        label="Paid Acquisition"
        title="Paid Media Should Buy Speed. Not Confusion."
        items={[
          { name: "Meta Ads", icon: "paidMedia" },
          { name: "Google Ads", icon: "seo" },
          { name: "Retargeting", icon: "tracking" },
          { name: "Paid Social", icon: "mobileApps" },
          { name: "Campaign Optimisation", icon: "analytics" },
          { name: "Lead Qualification", icon: "acquisition" },
        ]}
        visual={<StreamsMerge />}
      />
      <Capability
        id="organic"
        index="02"
        label="Organic"
        title="Paid Gets You There Faster. Organic Helps You Stay There."
        flip
        items={[
          { name: "SEO", icon: "seo" },
          { name: "Local SEO", icon: "tracking" },
          { name: "Content SEO", icon: "webApps" },
          { name: "AEO", icon: "aiSearch" },
          { name: "AI Search Visibility", icon: "aiAgents" },
          { name: "Digital PR", icon: "paidMedia" },
        ]}
      />
      <Capability
        id="search-shift"
        index="03"
        label="Search Shift"
        title="Your Customer Is Not Searching in One Place Anymore."
        visual={<SearchSurfaces />}
      />
      <Capability
        id="qualification"
        index="04"
        label="Qualification"
        title="Make the Form Do Some of the Selling Team's Work."
        support="Budget. Location. Timeline. Requirement. Business type. The right questions filter before your team ever picks up the phone."
        flip
        visual={<QualifyingForm />}
      />

      <FreeValue
        title="Want Better Leads Before You Spend More?"
        label="Get the Qualified Lead Generation Playbook"
        href="/resources/qualified-lead-generation-playbook"
        resource={{ title: "Qualified Lead Generation Playbook", kind: "Playbook", category: "acquire" }}
      />

      <AnswerBlock
        service="Client Acquisition"
        glance={[
          { label: "Who it is for", value: "Businesses with a sales team or booking process that needs more qualified opportunities, not just more enquiries." },
          { label: "Problem solved", value: "Low quality leads, rising acquisition costs, dependence on one paid channel and invisibility in AI search." },
          { label: "Process", value: "Define the ideal customer and offer, build paid and organic demand, qualify before and after the form, optimise on quality." },
          { label: "Measured by", value: "Qualified lead rate, cost per qualified opportunity, booked calls and pipeline value." },
        ]}
        faqs={faqs}
      />

      <FinalCta title="Stop Optimising for Leads" accent="Your Sales Team Does Not Want." primary={{ label: "Book an Acquisition Strategy Call", href: site.primaryCta.href }} />

      <JsonLd data={schema.service({ name: "Client Acquisition", serviceType: "Lead generation and customer acquisition", description, path, audience: "Established businesses" })} />
    </>
  );
}
