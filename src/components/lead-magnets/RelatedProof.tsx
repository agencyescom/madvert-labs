import { CaseCard } from "@/sections/shared/CaseCard";
import { Placeholder } from "@/components/ui/Section";
import type { CaseStudy, Resource } from "@/types/content";

/** Proof that matches the resource topic: "we understand this problem because we actually solve it". */
export function RelatedProof({ resource, studies }: { resource: Resource; studies: CaseStudy[] }) {
  const cats = resource.proof?.categories ?? [];
  const matched = studies.filter((s) => s.categories.some((c) => cats.includes(c))).slice(0, 2);
  const labels = resource.proof?.labels ?? [];
  return (
    <section className="section-tight" aria-labelledby="proof-title">
      <div className="container-x">
        <h2 id="proof-title" data-reveal className="t-h2 max-w-[820px]">
          We Wrote This Because <span className="t-grad">We Solve This Problem Every Week.</span>
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {matched.map((s, i) => (
            <div key={s.slug} data-reveal style={{ ["--reveal-delay" as string]: i * 90 }} className="lg:col-span-2">
              <CaseCard study={s} index={studies.indexOf(s)} />
            </div>
          ))}
          {labels.slice(0, matched.length ? 2 : 4).map((l, i) => (
            <div key={l} data-reveal style={{ ["--reveal-delay" as string]: 180 + i * 90 }} className={matched.length ? "lg:col-span-2" : ""}>
              <Placeholder label={l} className="h-full min-h-[200px]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
