import { Cta } from "@/components/ui/Button";
import { CaseCarousel } from "@/components/case-studies/CaseCarousel";
import type { CaseStudy } from "@/types/content";

export function CasePreview({ studies }: { studies: CaseStudy[] }) {
  if (!studies.length) return null;
  return (
    <section className="section-tight relative overflow-clip" aria-labelledby="cases-title">
      <div className="cs-glow" aria-hidden="true" />
      <div className="container-x relative">
        <div className="mx-auto max-w-[860px] text-center">
          <p data-reveal className="t-label cs-eyebrow !text-accent-text">
            Case Studies
          </p>
          <h2 id="cases-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h1 mt-6">
            Less “Trust Us.” <span className="t-grad">More “Here Is What Happened.”</span>
          </h2>
          <p data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-lead mx-auto mt-5 max-w-[620px]">
            The problem, the decisions, the system we built and what changed in the business.
          </p>
        </div>
        <div data-reveal="fade" style={{ ["--reveal-delay" as string]: 160 }} className="mt-10 md:mt-14">
          <CaseCarousel studies={studies.slice(0, 7)} label="Featured case studies" />
        </div>
        <div className="mt-10 flex justify-center">
          <Cta href="/case-studies" variant="secondary" track="case_study_open" trackLabel="case_preview_all">
            See All Case Studies
          </Cta>
        </div>
      </div>
    </section>
  );
}
