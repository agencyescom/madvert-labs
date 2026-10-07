import type { Metadata } from "next";
import { getCaseStudies, getProof, getResources, getSiteSettings, getTestimonials } from "@/cms";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, schema } from "@/lib/seo";
import { site } from "@/lib/site";
import { OpeningIntro } from "@/sections/home/OpeningIntro";
import { Hero } from "@/sections/home/Hero";
import { ProblemStory } from "@/sections/home/ProblemStory";
import { Fragmentation } from "@/sections/home/Fragmentation";
import { Philosophy } from "@/sections/home/Philosophy";
import { PillarsGallery } from "@/sections/home/PillarsGallery";
import { OwnedDemand } from "@/sections/home/OwnedDemand";
import { AiLeverage } from "@/sections/home/AiLeverage";
import { GrowthLoop } from "@/sections/home/GrowthLoop";
import { Proof } from "@/sections/home/Proof";
import { CasePreview } from "@/sections/home/CasePreview";
import { WhyMadvert } from "@/sections/home/WhyMadvert";
import { ChallengeBlock } from "@/sections/home/ChallengeBlock";
import { AboutTeaser } from "@/sections/home/AboutTeaser";
import { Vault } from "@/sections/home/Vault";
import { FounderBlock } from "@/sections/shared/FounderBlock";
import { FinalCta } from "@/sections/shared/FinalCta";
import { AccentHeadline } from "@/components/ui/Section";

const description =
  "Madvert Labs connects branding, customer acquisition, conversion, creative, automation and technology into one intelligent growth system built around your business.";

export const metadata: Metadata = {
  ...pageMetadata({ title: `${site.name} | ${site.descriptor}`, description, path: "/" }),
  title: { absolute: `${site.name} | ${site.descriptor}` },
};

export default async function HomePage() {
  const [settings, studies, resources, proof, testimonials] = await Promise.all([
    getSiteSettings(),
    getCaseStudies(),
    getResources(),
    getProof(),
    getTestimonials(),
  ]);

  return (
    <>
      <OpeningIntro />
      <Hero image={settings.heroImage} />

      <section className="section pb-0" aria-label="The problem">
        <div className="container-x">
          <div className="max-w-[900px]" data-reveal>
            <AccentHeadline as="h2" text="Your Dashboard Can Glow Green While Your Sales Floor Stays Quiet." className="t-h1" />
          </div>
          <div className="mt-6 lg:mt-0">
            <ProblemStory />
          </div>
        </div>
      </section>

      <Fragmentation />
      <Philosophy />
      <PillarsGallery />
      <OwnedDemand />
      <AiLeverage />

      <section className="section pb-0" aria-labelledby="loop-title">
        <div className="container-x">
          <h2 id="loop-title" data-reveal className="t-h1 max-w-[900px]">
            We Start With the Problem. <span className="t-grad">Not the Service We Want to Sell You.</span>
          </h2>
          <GrowthLoop />
          <p data-reveal className="t-h2 mx-auto max-w-[860px] py-16 text-center md:py-24">
            The Channel Is Secondary. <span className="t-grad">The Business Problem Comes First.</span>
          </p>
        </div>
      </section>

      <Proof items={proof} testimonials={testimonials} />
      <CasePreview studies={studies} />
      <WhyMadvert />
      <ChallengeBlock />
      <FounderBlock photo={settings.founderPhoto} />
      <AboutTeaser />
      <Vault resources={resources} />
      <FinalCta
        title="You Probably Already Know Something Is Leaking."
        accent="Let Us Find Out Where."
        primary={site.founderCta}
        secondary={{ label: site.auditCta.label, href: site.auditCta.href }}
        micro="No pressure. No generic pitch. Just a serious conversation about growth."
      >
        <p>Bring the business. Bring the numbers. Bring the challenge.</p>
        <p className="mt-1">We will bring the questions.</p>
      </FinalCta>
      <JsonLd data={schema.webPage(site.name, description, "/")} />
    </>
  );
}
