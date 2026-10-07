import type { Metadata } from "next";
import { getFaqs } from "@/cms";
import { JsonLd } from "@/components/seo/JsonLd";
import { PillarWorld } from "@/components/visuals/PillarWorld";
import { pageMetadata, schema } from "@/lib/seo";
import { ServiceHero } from "@/sections/services/ServiceHero";
import { AnswerBlock, FreeValue, Statement } from "@/sections/services/Blocks";
import { TechModules } from "@/sections/services/TechModules";
import { LeadValueCalculator } from "@/sections/services/LeadValueCalculator";
import { FinalCta } from "@/sections/shared/FinalCta";

const path = "/services/tech-product-development";
const description =
  "Web apps, mobile apps, dashboards, calculators, portals, internal tools, integrations and AI tools. When growth needs technology, Madvert Labs designs and builds the tool.";

export const metadata: Metadata = pageMetadata({ title: "Tech and Product Development", description, path });

export default async function TechPage() {
  const faqs = await getFaqs("tech-product-development");
  return (
    <>
      <ServiceHero
        eyebrow="Tech and Product Development"
        title="Sometimes Marketing Is Not the Answer."
        accent="Software Is."
        sub="When growth needs technology, Madvert designs and builds the tool."
        primary={{ label: "Build What Growth Needs", href: "/contact?service=tech-product-development" }}
        secondary={{ label: "Request a Tech Opportunity Audit", href: "/contact?intent=tech-opportunity-audit" }}
        crumbs={[
          { name: "What We Do", path: "/services" },
          { name: "Tech and Product Development", path },
        ]}
        visual={<PillarWorld icon="development" satellites={["webApps", "mobileApps", "systems", "aiAgents"]} tint="#34d399" />}
      />

      <Statement title="Technology Should Fit the Business." accent="Not Force the Business to Fit the Technology." center />

      <section className="section pt-0" aria-label="What we build">
        <div className="container-x">
          <TechModules />
        </div>
      </section>

      <section className="section-tight" aria-labelledby="calc-title">
        <div className="container-x">
          <h2 id="calc-title" data-reveal className="t-h2 max-w-[760px]">
            A calculator like this lets customers <span className="t-grad">see the value before the sales call.</span>
          </h2>
          <div className="mt-12" data-reveal="fade">
            <LeadValueCalculator />
          </div>
        </div>
      </section>

      <FreeValue
        title="What Could Technology Remove From Your Business This Month?"
        label="Request a Tech Opportunity Audit"
        href="/contact?intent=tech-opportunity-audit"
        resource={{ title: "Tech Opportunity Audit", kind: "Audit", category: "build" }}
      />

      <AnswerBlock
        service="Tech and Product Development"
        glance={[
          { label: "Who it is for", value: "Businesses where manual work, disconnected tools or missing software is limiting growth." },
          { label: "Problem solved", value: "Repetitive admin, invisible data, customers chasing updates and tools that do not talk to each other." },
          { label: "Process", value: "Audit the opportunity, decide build versus buy, design, build in stages, integrate and support." },
          { label: "Measured by", value: "Hours saved, adoption, data visibility and the commercial outcome the tool was built for." },
        ]}
        faqs={faqs}
      />

      <FinalCta
        title="Show Us the Bottleneck."
        accent="We Will Tell You Whether It Needs Marketing, Automation or Code."
        primary={{ label: "Discuss a Tech Project", href: "/contact?service=tech-product-development" }}
      />

      <JsonLd data={schema.service({ name: "Tech and Product Development", serviceType: "Custom software and app development", description, path, audience: "Established businesses" })} />
    </>
  );
}
