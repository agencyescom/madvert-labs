"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ResourceCover } from "@/components/visuals/ResourceCover";
import type { Resource, ResourceCategory } from "@/types/content";

const cats: { key: ResourceCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "acquire", label: "Acquire" },
  { key: "convert", label: "Convert" },
  { key: "search", label: "Search" },
  { key: "brand", label: "Brand" },
  { key: "automate", label: "Automate" },
  { key: "build", label: "Build" },
];

export function ResourceList({ resources }: { resources: Resource[] }) {
  const [c, setC] = useState<(typeof cats)[number]["key"]>("all");
  const list = useMemo(() => (c === "all" ? resources : resources.filter((r) => r.category === c)), [c, resources]);
  return (
    <>
      <div role="toolbar" aria-label="Filter resources" className="flex flex-wrap gap-2">
        {cats.map((x) => (
          <button
            key={x.key}
            type="button"
            aria-pressed={c === x.key}
            onClick={() => setC(x.key)}
            className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${
              c === x.key ? "border-transparent bg-[linear-gradient(100deg,#00b4ff,#00e5ff)] text-on-accent" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
        {list.map((r) => (
          <li key={r.slug}>
            <Link href={`/resources/${r.slug}`} data-track="free_value_click" data-track-label={`vault_${r.slug}`} className="group block">
              <ResourceCover resource={r} className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2" />
              <p className="mt-4 font-display text-[16px] font-semibold text-ink">{r.title}</p>
              <p className="mt-1 text-[14px] text-ink-3">{r.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
