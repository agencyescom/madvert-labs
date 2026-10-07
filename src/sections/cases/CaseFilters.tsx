"use client";

import { useMemo, useState } from "react";
import { CaseCard } from "@/sections/shared/CaseCard";
import type { CaseStudy, CaseStudyCategory } from "@/types/content";

const filters: { key: CaseStudyCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "acquisition", label: "Acquisition" },
  { key: "seo", label: "SEO" },
  { key: "branding", label: "Branding" },
  { key: "studios", label: "Studios" },
  { key: "automation", label: "Automation" },
  { key: "technology", label: "Technology" },
];

export function CaseFilters({ studies }: { studies: CaseStudy[] }) {
  const [active, setActive] = useState<(typeof filters)[number]["key"]>("all");
  const list = useMemo(() => (active === "all" ? studies : studies.filter((s) => s.categories.includes(active))), [active, studies]);
  return (
    <>
      <div role="toolbar" aria-label="Filter case studies" className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={active === f.key}
            onClick={() => setActive(f.key)}
            className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${
              active === f.key ? "border-transparent bg-[linear-gradient(100deg,#00b4ff,#00e5ff)] text-on-accent" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="sr-only-focusable" aria-live="polite">
        {list.length} case studies shown
      </p>
      <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((s, i) => (
          <li key={s.slug}>
            <CaseCard study={s} index={studies.indexOf(s) ?? i} />
          </li>
        ))}
      </ul>
      {list.length === 0 ? <p className="mt-12 text-ink-3">No case studies in this category yet.</p> : null}
    </>
  );
}
