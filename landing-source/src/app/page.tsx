import { StickyBookCTA } from "@/components/MobileCTA";
import { BookingSection } from "@/components/sections/BookingSection";
import { BetaPricing } from "@/components/sections/BetaPricing";
import { CRMPreview } from "@/components/sections/CRMPreview";
import { Credibility } from "@/components/sections/Credibility";
import { CustomerJourney } from "@/components/sections/CustomerJourney";
import { Exclusivity } from "@/components/sections/Exclusivity";
import { FAQ } from "@/components/sections/FAQ";
import { FAQS } from "@/lib/faqs";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { IdealPartner } from "@/components/sections/IdealPartner";
import { LeadDelivery } from "@/components/sections/LeadDelivery";
import { ModelComparison } from "@/components/sections/ModelComparison";
import { Navbar } from "@/components/sections/Navbar";
import { OrderTracking } from "@/components/sections/OrderTracking";
import { Problem } from "@/components/sections/Problem";
import { QualificationRules } from "@/components/sections/QualificationRules";
import { QualifiedRFQ } from "@/components/sections/QualifiedRFQ";
import { ScaleExamples } from "@/components/sections/ScaleExamples";
import { SystemStack } from "@/components/sections/SystemStack";
import { VSLSection } from "@/components/sections/VSLSection";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a.join(" ") } })),
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <BookingSection instance="book-call" />
        <Problem />
        <QualifiedRFQ />
        <QualificationRules />
        <CustomerJourney />
        <LeadDelivery />
        <VSLSection />
        <SystemStack />
        <CRMPreview />
        <OrderTracking />
        <Exclusivity />
        <ModelComparison />
        <Credibility />
        <BetaPricing />
        <ScaleExamples />
        <IdealPartner />
        <BookingSection instance="book-call-2" />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <StickyBookCTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
