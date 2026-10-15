import Link from "next/link";
import { Arrow } from "@/components/ui/Button";
import type { CaseStudy } from "@/types/content";
import { CoverMedia } from "./CoverMedia";
import "@/styles/cases.css";
import { caseKicker, categoryLabels, oneLiner, primaryCategory, verifiedMetrics } from "./utils";

/** Premium case study card: cover, kicker, title, one-liner, verified metrics only, and CTAs. */
export function CaseShowcaseCard({ study, size = "md", headingLevel = 3 }: { study: CaseStudy; size?: "lg" | "md"; headingLevel?: 2 | 3 }) {
  const metrics = verifiedMetrics(study).slice(0, size === "lg" ? 3 : 2);
  const cat = primaryCategory(study);
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={`cs-card cs-card--${size}`}>
      <div className="cs-card-media">
        <CoverMedia study={study} sizes={size === "lg" ? "(min-width:900px) 360px, 70vw" : "(min-width:1024px) 260px, 70vw"} />
        <span className="cs-chip cs-chip--cat">
          <span className="cs-chip-dot" aria-hidden="true" />
          {categoryLabels[cat]}
        </span>
        {study.placeholder ? (
          <span className="cs-chip cs-chip--pending">Awaiting real data</span>
        ) : study.featured ? (
          <span className="cs-chip cs-chip--featured">Featured</span>
        ) : null}
      </div>
      <div className="cs-card-body">
        <p className="cs-kicker">{caseKicker(study)}</p>
        <H className="cs-title">{study.title}</H>
        <p className="cs-line">{oneLiner(study)}</p>
        {metrics.length ? (
          <dl className="cs-metrics">
            {metrics.map((m) => (
              <div key={`${m.label}-${m.value}`} className="cs-metric">
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div className="cs-ctas">
          <Link href={`/case-studies/${study.slug}`} data-track="case_study_open" data-track-label={study.slug} className="cs-btn cs-btn--primary group/btn">
            View Case Study <Arrow />
          </Link>
          {study.pdfUrl ? (
            <a href={study.pdfUrl} download data-track="resource_download" data-track-label={`case_pdf_${study.slug}`} className="cs-btn cs-btn--ghost">
              <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                <path d="M8 2.5v8m0 0L4.8 7.3M8 10.5l3.2-3.2M3 13.5h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download PDF
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
