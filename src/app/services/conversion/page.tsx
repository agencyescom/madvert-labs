import type { Metadata } from "next";
import { getFaqs } from "@/cms";
import { JsonLd } from "@/components/seo/JsonLd";
import { PillarWorld } from "@/components/visuals/PillarWorld";
import { pageMetadata, schema } from "@/lib/seo";
import { site } from "@/lib/site";
import { ServiceHero } from "@/sections/services/ServiceHero";
import { AnswerBlock, Capability, FreeValue, Statement } from "@/sections/services/Blocks";
import { VisitorJourney } from "@/sections/services/VisitorJourney";
import { FinalCta } from "@/sections/shared/FinalCta";

const path = "/services/conversion";
const description =
  "Websites, landing pages, CRO and offers that turn attention into action. Madvert Labs fixes the conversion journey before you buy more traffic.";

export const metadata: Metadata = pageMetadata({ title: "Conversion", description, path });

export default async function ConversionPage() {
  const faqs = await getFaqs("conversion");
  return (
    <>
      <ServiceHero
        eyebrow="Conversion"
        title="Getting the Click Was Expensive."
        accent="Let Us Not Waste It Now."
        sub="We build websites, landing pages and conversion experiences that turn attention into action."
        primary={{ label: "Fix My Conversion Journey", href: "/contact?service=conversion" }}
        secondary={{ label: "Get the Conversion Leak Checklist", href: "/resources/conversion-leak-checklist" }}
        crumbs={[
          { name: "What We Do", path: "/services" },
          { name: "Conversion", path },
        ]}
        visual={<PillarWorld icon="conversion" satellites={["webApps", "mobileApps", "analytics", "growth"]} tint="#2dd4bf" />}
      />

      <Statement title="Traffic Does Not Pay You." accent="Customers Do." center />

      <section className="section pt-0" aria-labelledby="experience-title">
        <div className="container-x">
          <h2 id="experience-title" data-reveal className="t-h1 max-w-[920px]">
            Imagine Paying to Bring Someone to Your Door. <span className="t-grad">Then Making the Door Difficult to Open.</span>
          </h2>
          <div className="mt-16">
            <VisitorJourney />
          </div>
        </div>
      </section>

      <Capability
        id="websites"
        index="01"
        label="Websites"
        title="Your Website Should Do More Than Look Expensive."
        items={[
          { name: "Website Design", icon: "webApps" },
          { name: "UI and UX", icon: "branding" },
          { name: "Responsive Development", icon: "mobileApps" },
          { name: "Service Architecture", icon: "systems" },
          { name: "Conversion Copy", icon: "conversion" },
        ]}
      />
      <Capability id="landing-pages" index="02" label="Landing Pages" title="One Campaign. One Promise. One Clear Next Step." flip />
      <Capability id="cro" index="03" label="CRO" title="Before Buying More Traffic, Squeeze More Value From the Traffic You Already Bought." />
      <Capability id="offers" index="04" label="Offers" title="Sometimes the Page Is Fine. The Offer Is Just Easy to Ignore." flip />

      <FreeValue
        title="Where Is Your Website Quietly Losing People?"
        label="Get the Conversion Leak Checklist"
        href="/resources/conversion-leak-checklist"
        resource={{ title: "Conversion Leak Checklist", kind: "Checklist", category: "convert" }}
      />

      <AnswerBlock
        service="Conversion"
        glance={[
          { label: "Who it is for", value: "Businesses paying for traffic that is not turning into enough enquiries, bookings or sales." },
          { label: "Problem solved", value: "Slow, confusing or unconvincing websites and landing pages, weak offers and high friction forms." },
          { label: "Process", value: "Audit the journey, find the friction, redesign and rebuild, then test and improve continuously." },
          { label: "Measured by", value: "Conversion rate by source, cost per enquiry, form completion and booked calls." },
        ]}
        faqs={faqs}
      />

      <FinalCta title="Same Traffic. Better Journey." accent="Different Economics." primary={{ label: "Book a Conversion Review", href: site.primaryCta.href }} />

      <JsonLd data={schema.service({ name: "Conversion", serviceType: "Website design and conversion rate optimisation", description, path, audience: "Established businesses" })} />
    </>
  );
}
