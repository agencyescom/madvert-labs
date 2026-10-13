"use client";

import { useMemo, useState } from "react";
import { ResourceCard } from "@/components/lead-magnets/ResourceCard";
import type { Resource, ResourceCategory } from "@/types/content";

const cats: { key: ResourceCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "acquire", label: "Acquire" },
  { key: "convert", label: "Convert" },
  { key: "search", label: "Search" },
  { key: "content", label: "Content" },
  { key: "brand", label: "Brand" },
  { key: "automate", label: "Automate" },
  { key: "build", label: "Build" },
];

export function ResourceList({ resources }: { resources: Resource[] }) {
  const [c, setC] = useState<(typeof cats)[number]["key"]>("all");
  // Official artwork first, then the rest of the Vault.
  const sorted = useMemo(() => [...resources].sort((a, b) => Number(Boolean(a.artworkPending)) - Number(Boolean(b.artworkPending))), [resources]);
  const list = useMemo(() => (c === "all" ? sorted : sorted.filter((r) => r.category === c)), [c, sorted]);
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
      <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((r) => (
          <li key={r.slug}>
            <ResourceCard r={r} />
          </li>
        ))}
      </ul>
    </>
  );
}
