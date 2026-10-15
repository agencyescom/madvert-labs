"use client";

import { useMemo, useState } from "react";
import { CaseShowcaseCard } from "@/components/case-studies/CaseShowcaseCard";
import { isReal } from "@/components/case-studies/utils";
import type { CaseStudy } from "@/types/content";
import "@/styles/cases.css";

type GroupKey = "industry" | "service" | "market" | "system";

const groupDefs: { key: GroupKey; label: string; values: (s: CaseStudy) => (string | undefined)[] }[] = [
  { key: "industry", label: "Industry", values: (s) => [s.industry] },
  { key: "service", label: "Service", values: (s) => s.services ?? [] },
  { key: "market", label: "Market", values: (s) => [s.market, s.region] },
  { key: "system", label: "Growth system", values: (s) => [s.systemType] },
];

const realValues = (s: CaseStudy, g: (typeof groupDefs)[number]) => g.values(s).filter(isReal);

/** Searchable, filterable grid. Filter groups are derived only from real values in the data; empty groups are hidden. */
export function CaseFilters({ studies }: { studies: CaseStudy[] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Partial<Record<GroupKey, string>>>({});

  const groups = useMemo(
    () =>
      groupDefs
        .map((g) => ({ ...g, options: [...new Set(studies.flatMap((s) => realValues(s, g)))].sort() }))
        .filter((g) => g.options.length > 1 || (g.options.length === 1 && studies.length > 1 && studies.some((s) => !realValues(s, g).length))),
    [studies],
  );

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return studies.filter((s) => {
      for (const g of groups) {
        const v = sel[g.key];
        if (v && !realValues(s, g).includes(v)) return false;
      }
      if (!needle) return true;
      const hay = [s.title, s.summary, s.oneLiner, s.industry, s.market, s.region, s.systemType, ...(s.services ?? []), ...(s.categories ?? [])]
        .filter(isReal)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q, sel, studies, groups]);

  const active = q.trim() !== "" || Object.values(sel).some(Boolean);
  const reset = () => {
    setQ("");
    setSel({});
  };

  return (
    <>
      <div className="panel p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <label className="cs-search">
            <span className="sr-only">Search case studies</span>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
              <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by problem, service or system" />
          </label>
          <p className="shrink-0 text-[14px] text-ink-3" aria-live="polite">
            {list.length} of {studies.length} case {studies.length === 1 ? "study" : "studies"}
            {active ? (
              <button type="button" onClick={reset} className="ml-3 font-semibold text-accent-text underline-offset-4 hover:underline">
                Clear
              </button>
            ) : null}
          </p>
        </div>
        {groups.length ? (
          <div className="cs-selects mt-5">
            {groups.map((g) => (
              <label key={g.key} className="cs-select" data-on={!!sel[g.key]}>
                <span className="t-label">{g.label}</span>
                <select value={sel[g.key] ?? ""} onChange={(e) => setSel((p) => ({ ...p, [g.key]: e.target.value || undefined }))}>
                  <option value="">Any {g.label.toLowerCase()}</option>
                  {g.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        ) : null}
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <li key={s.slug}>
            <CaseShowcaseCard study={s} />
          </li>
        ))}
      </ul>
      {list.length === 0 ? (
        <div className="placeholder-slot mt-10 grid place-items-center p-12 text-center">
          <p className="text-ink-2">No case studies match those filters yet.</p>
          <button type="button" onClick={reset} className="mt-3 font-semibold text-accent-text underline-offset-4 hover:underline">
            Clear filters
          </button>
        </div>
      ) : null}
    </>
  );
}
