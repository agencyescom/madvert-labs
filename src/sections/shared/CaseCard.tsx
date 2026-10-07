import Link from "next/link";
import { Arrow } from "@/components/ui/Button";
import type { CaseStudy } from "@/types/content";

/** Case study "dossier" card: The Problem, The Move, The System, The Result. */
export function CaseCard({ study, index }: { study: CaseStudy; index: number }) {
  const rows = [
    ["The Problem", study.summary || study.problem],
    ["The Move", study.move],
    ["The System", study.system],
    ["The Result", study.metrics[0] ? `${study.metrics[0].label}: ${study.metrics[0].value}` : study.result],
  ];
  return (
    <article className="panel group/card relative flex h-full flex-col overflow-hidden transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-line-strong">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <span className="font-display text-[11px] font-semibold tracking-[0.2em] text-ink-3">FILE {String(index + 1).padStart(3, "0")}</span>
        {study.placeholder ? (
          <span className="rounded-full border border-dashed border-line-strong px-2.5 py-0.5 text-[10.5px] text-ink-3">Awaiting real data</span>
        ) : (
          <span className="text-[12px] text-ink-3">{study.industry}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="t-h3">
          <Link
            href={`/case-studies/${study.slug}`}
            data-track="case_study_open"
            data-track-label={study.slug}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {study.title}
          </Link>
        </h3>
        <dl className="mt-6 grid gap-3.5">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[96px_1fr] gap-3 border-t border-line pt-3.5">
              <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">{k}</dt>
              <dd className="line-clamp-2 text-[14px] text-ink-2">{v}</dd>
            </div>
          ))}
        </dl>
        <span className="group/btn mt-auto inline-flex items-center gap-2 pt-7 text-[14px] font-semibold text-accent-text">
          Open the Case Study <Arrow />
        </span>
      </div>
    </article>
  );
}
