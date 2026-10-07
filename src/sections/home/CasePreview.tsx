import { CaseCard } from "@/sections/shared/CaseCard";
import type { CaseStudy } from "@/types/content";

export function CasePreview({ studies }: { studies: CaseStudy[] }) {
  return (
    <section className="section-tight" aria-labelledby="cases-title">
      <div className="container-x">
        <h2 id="cases-title" data-reveal className="t-h1 max-w-[860px]">
          Less “Trust Us.” <span className="t-grad">More “Here Is What Happened.”</span>
        </h2>
        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {studies.slice(0, 3).map((s, i) => (
            <li key={s.slug} data-reveal style={{ ["--reveal-delay" as string]: i * 100 }}>
              <CaseCard study={s} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
