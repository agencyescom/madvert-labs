import type { Metadata } from "next";
import { getFaqs } from "@/cms";
import { JsonLd } from "@/components/seo/JsonLd";
import { PillarWorld } from "@/components/visuals/PillarWorld";
import { pageMetadata, schema } from "@/lib/seo";
import { site } from "@/lib/site";
import { ServiceHero } from "@/sections/services/ServiceHero";
import { AnswerBlock, Capability, FreeValue, Statement } from "@/sections/services/Blocks";
import { IdentityAlign } from "@/sections/services/IdentityAlign";
import { AudienceFit, Touchpoints360 } from "@/sections/services/Visuals";
import { FinalCta } from "@/sections/shared/FinalCta";

const path = "/services/branding-marketing";
const description =
  "Brand strategy, identity, social media, digital PR, influencer marketing and 360 degree execution. Madvert Labs shapes how your business looks, sounds and shows up everywhere.";

export const metadata: Metadata = pageMetadata({ title: "Branding and Marketing", description, path });

export default async function BrandingPage() {
  const faqs = await getFaqs("branding-marketing");
  return (
    <>
      <ServiceHero
        eyebrow="Branding and Marketing"
        title="A Serious Business"
        accent="Should Look Like One."
        campaignLine="Being Good Is Not Enough If You Look Forgettable."
        sub="We build and execute complete brand and marketing systems that shape how your business looks, sounds, communicates and shows up across every important touchpoint."
        primary={{ label: "Build My Brand", href: "/contact?service=branding-marketing" }}
        secondary={{ label: "Get the Brand Perception Checklist", href: "/resources/brand-perception-checklist" }}
        crumbs={[
          { name: "What We Do", path: "/services" },
          { name: "Branding and Marketing", path },
        ]}
        visual={<PillarWorld icon="branding" satellites={["webApps", "paidMedia", "studios", "crm"]} tint="#a78bfa" />}
      />

      <Statement
        title="Your Customer Is Judging"
        accent="Before Your Sales Team Ever Speaks."
        lines={["They see your logo.", "Your Instagram.", "Your website.", "Your photographs.", "Your reviews.", "Your ads.", "Your tone.", "Your consistency."]}
        closing={
          <>
            <p>Within seconds, they begin building an opinion.</p>
            <p className="mt-4 flex flex-wrap gap-2 text-[15px]">
              {["Premium.", "Average.", "Trustworthy.", "Forgettable."].map((w) => (
                <span key={w} className="rounded-full border border-line px-3 py-1 font-sans font-medium text-ink-2">
                  {w}
                </span>
              ))}
            </p>
            <p className="mt-6">
              Your brand is already saying something. <span className="t-grad">The only question is whether you chose the message.</span>
            </p>
          </>
        }
      >
        <div className="mt-16 md:mt-20">
          <IdentityAlign />
        </div>
      </Statement>

      <Capability
        id="branding"
        index="01"
        label="Branding"
        title="A Logo Is Not a Brand. It Is One Piece of the Evidence."
        support={
          <>
            <p>A strong identity does more than look attractive.</p>
            <p className="mt-2">
              It creates recognition. It creates consistency. It makes your business easier to remember. It makes every campaign, post, proposal and customer
              touchpoint feel like it came from the same company.
            </p>
          </>
        }
        icon="branding"
        items={[
          { name: "Brand Strategy", icon: "strategy" },
          { name: "Visual Identity", icon: "branding" },
          { name: "Logo Systems", icon: "branding" },
          { name: "Brand Guidelines", icon: "systems" },
          { name: "Typography and Colour Systems", icon: "webApps" },
          { name: "Creative Direction", icon: "studios" },
        ]}
      />
      <Capability
        id="social-media"
        index="02"
        label="Social Media"
        title="Posting Every Day Is Not a Strategy."
        support="Neither is putting “Happy Monday” over a stock photo."
        flip
        items={[
          { name: "Social Media Management", icon: "mobileApps" },
          { name: "Content Calendars", icon: "systems" },
          { name: "Creative Posts", icon: "branding" },
          { name: "Reels", icon: "studios" },
          { name: "Community Management", icon: "crm" },
          { name: "Campaign Content", icon: "paidMedia" },
        ]}
      />
      <Capability
        id="digital-pr"
        index="03"
        label="Digital PR"
        title="Authority Looks Different When Someone Else Says You Are Good."
        items={[
          { name: "Press Releases", icon: "webApps" },
          { name: "Digital PR", icon: "paidMedia" },
          { name: "Publication Outreach", icon: "seo" },
          { name: "Media Placements", icon: "growth" },
          { name: "Authority Building", icon: "strategy" },
          { name: "Reputation Support", icon: "tracking" },
        ]}
      />
      <Capability id="influencer-marketing" index="04" label="Influencer Marketing" title="Borrow the Right Attention. Not Just the Biggest Audience." flip visual={<AudienceFit />} />
      <Capability
        id="360"
        index="05"
        label="360 Degree Marketing"
        title="The Brand Should Feel Like One Brand Everywhere."
        support="That is what 360 degree brand execution should feel like."
        visual={<Touchpoints360 />}
      />

      <FreeValue
        title="How Does Your Brand Look From the Outside?"
        label="Get the Brand Perception Checklist"
        href="/resources/brand-perception-checklist"
        resource={{ title: "Brand Perception Checklist", kind: "Checklist", category: "brand" }}
      />

      <AnswerBlock
        service="Branding and Marketing"
        glance={[
          { label: "Who it is for", value: "Established businesses whose quality is not yet reflected in how they look and communicate." },
          { label: "Problem solved", value: "Inconsistent, forgettable or outdated presence across logo, social, website, PR and creative." },
          { label: "Process", value: "Diagnose perception, define strategy and identity, build the system, execute across touchpoints." },
          { label: "Measured by", value: "Consistency, brand search demand, enquiry quality and content performance." },
        ]}
        faqs={faqs}
      />

      <FinalCta title="Build a Brand Your Marketing Can" accent="Actually Be Proud Of." primary={{ label: "Book a Brand Strategy Call", href: site.primaryCta.href }} />

      <JsonLd
        data={schema.service({
          name: "Branding and Marketing",
          serviceType: "Branding and marketing",
          description,
          path,
          audience: "Established businesses",
        })}
      />
    </>
  );
}
