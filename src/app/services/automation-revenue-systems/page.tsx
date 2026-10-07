import type { Metadata } from "next";
import { getFaqs } from "@/cms";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, schema } from "@/lib/seo";
import { site } from "@/lib/site";
import { ServiceHero } from "@/sections/services/ServiceHero";
import { AnswerBlock, Capability, FreeValue } from "@/sections/services/Blocks";
import { InterestTemperature } from "@/sections/services/InterestTemperature";
import { LeadJourney } from "@/sections/services/LeadJourney";
import { PipelineStages, SpreadsheetVsCrm, WhatsAppChat } from "@/sections/services/Visuals";
import { PillarWorld } from "@/components/visuals/PillarWorld";
import { FinalCta } from "@/sections/shared/FinalCta";

const path = "/services/automation-revenue-systems";
const description =
  "CRM, AI agents, WhatsApp automation, follow up, booking and revenue tracking. Madvert Labs builds revenue systems that keep every opportunity moving.";

export const metadata: Metadata = pageMetadata({ title: "Automation and Revenue Systems", description, path });

export default async function AutomationPage() {
  const faqs = await getFaqs("automation-revenue-systems");
  return (
    <>
      <ServiceHero
        eyebrow="Automation and Revenue Systems"
        title="The Lead Replied. Your Team Replied Tomorrow."
        accent="You Can Guess How That Story Ends."
        sub="We connect CRM, AI, qualification, follow up, booking and revenue tracking so opportunities keep moving even when your team is busy."
        primary={{ label: "Automate the Revenue Journey", href: "/contact?service=automation-revenue-systems" }}
        secondary={{ label: "Run the Revenue Leakage Audit", href: "/resources/revenue-leakage-audit" }}
        crumbs={[
          { name: "What We Do", path: "/services" },
          { name: "Automation and Revenue Systems", path },
        ]}
        visual={<PillarWorld icon="automation" satellites={["crm", "aiAgents", "tracking", "analytics"]} tint="#00e5ff" />}
      />

      <Capability id="speed" index="01" label="Speed" title="Interest Has a Temperature." visual={<InterestTemperature />} />
      <Capability id="crm" index="02" label="CRM" title="Your CRM Should Know More Than Your Spreadsheet." flip visual={<SpreadsheetVsCrm />} />
      <Capability
        id="ai-agents"
        index="03"
        label="AI Agents"
        title="Your Best Response Time Should Not Depend on Who Is Online."
        support="Automation should remove friction, not automate confusion."
        items={[
          { name: "Instant first response", icon: "aiAgents" },
          { name: "Consistent qualification", icon: "acquisition" },
          { name: "Booking without back and forth", icon: "systems" },
          { name: "Hand off to your team", icon: "crm" },
        ]}
      />
      <Capability id="whatsapp" index="04" label="WhatsApp" title="Your Customers Already Live in WhatsApp. Your System Should Know That." flip visual={<WhatsAppChat />} />

      <section id="pipeline" className="section-tight" aria-labelledby="pipeline-title">
        <div className="container-x">
          <div className="hairline mb-16 md:mb-20" />
          <p data-reveal className="flex items-center gap-3 font-display text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-3">
            <span className="text-accent-text">05</span>
            <span className="h-px w-6 bg-[var(--line-strong)]" />
            Pipeline
          </p>
          <h2 id="pipeline-title" data-reveal className="t-h2 mt-6 max-w-[760px]">
            Every Lead Should Have Somewhere to Go.
          </h2>
          <div className="mt-12">
            <PipelineStages />
          </div>
        </div>
      </section>

      <Capability id="reviews" index="06" label="Reviews" title="The Best Time to Ask for a Review Is When the Customer Is Still Smiling." />
      <Capability id="tracking" index="07" label="Tracking" title="A Lead Is Not Revenue Yet." flip />

      <section className="section" aria-labelledby="mechanism-title">
        <div className="container-x">
          <div className="max-w-[860px]">
            <p data-reveal className="t-eyebrow">Unique mechanism</p>
            <h2 id="mechanism-title" data-reveal className="t-h1 mt-5">
              The Madvert <span className="t-grad">Revenue Response System</span>
            </h2>
            <p data-reveal className="t-lead mt-6">Capture. Respond. Qualify. Nurture. Book. Track.</p>
          </div>
          <div className="mt-6">
            <LeadJourney />
          </div>
          <p data-reveal className="t-h2 mx-auto max-w-[860px] py-10 text-center">
            Every step should either move the opportunity forward <span className="t-grad">or tell you why it stopped.</span>
          </p>
        </div>
      </section>

      <FreeValue
        title="How Much Revenue Is Quietly Leaking After the Lead Arrives?"
        label="Run the Revenue Leakage Audit"
        href="/resources/revenue-leakage-audit"
        resource={{ title: "Revenue Leakage Audit", kind: "Audit", category: "automate" }}
      />

      <AnswerBlock
        service="Automation and Revenue Systems"
        glance={[
          { label: "Who it is for", value: "Businesses generating enquiries that are lost to slow replies, missing follow up or untracked pipelines." },
          { label: "Problem solved", value: "Leads waiting hours for a reply, CRMs nobody updates, no view of which marketing produces revenue." },
          { label: "Process", value: "Map the journey after the lead arrives, then build capture, response, qualification, nurture, booking and tracking." },
          { label: "Measured by", value: "Response time, lead to booking rate, pipeline velocity and revenue attributed by source." },
        ]}
        faqs={faqs}
      />

      <FinalCta
        title="Your Marketing Worked Hard to Create the Lead."
        accent="Do Not Let the Follow Up Waste It."
        primary={{ label: "Book a Revenue Systems Call", href: site.primaryCta.href }}
      />

      <JsonLd data={schema.service({ name: "Automation and Revenue Systems", serviceType: "CRM, marketing automation and AI agents", description, path, audience: "Established businesses" })} />
    </>
  );
}
