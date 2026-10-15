"use client";

import { useDeferredValue, useId, useMemo, useState, type ReactNode } from "react";
import { FeaturedResource } from "@/components/lead-magnets/FeaturedResource";
import { ResourceCard } from "@/components/lead-magnets/ResourceCard";
import { categoryOf, resourceCategoryLabel, resourceCategoryOrder } from "@/lib/resource-categories";
import type { Resource, ResourceCategory } from "@/types/content";
import "@/styles/vault.css";

type Key = ResourceCategory | "all";

const chipIcon: Record<Key, ReactNode> = {
  all: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="currentColor" stroke="none" />,
  offers: <path d="M3 12V4h8l10 10-8 8zM7.5 8.5h.01" />,
  ads: <path d="M6 4v16l14-8z" fill="currentColor" stroke="none" />,
  leads: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />,
  search: <path d="M5 20v-6M10 20V9M15 20v-9M20 20V4" strokeWidth="2.6" />,
  automation: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />,
  conversion: <path d="M4 4l7 17 2.5-7.5L21 11z" />,
  brand: <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />,
};

function Icon({ k }: { k: Key }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {chipIcon[k]}
    </svg>
  );
}

/**
 * The Madvert Vault library: hero (supplied by the page), search, category chips, featured resource and
 * the resource grid. Filtering is entirely client side over title, description and category.
 */
export function ResourceList({ resources, intro }: { resources: Resource[]; intro?: ReactNode }) {
  const [cat, setCat] = useState<Key>("all");
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query);
  const searchId = useId();

  const spotlight = useMemo(() => resources.find((r) => r.spotlight) ?? resources.find((r) => r.featured && !r.artworkPending), [resources]);
  // Official artwork first (stable, so the content order is kept), then the rest of the Vault.
  const sorted = useMemo(() => [...resources].sort((a, b) => Number(Boolean(a.artworkPending)) - Number(Boolean(b.artworkPending))), [resources]);
  const cats = useMemo<Key[]>(() => ["all", ...resourceCategoryOrder.filter((c) => resources.some((r) => categoryOf(r) === c))], [resources]);

  const list = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return sorted.filter((r) => {
      const c = categoryOf(r);
      if (cat !== "all" && c !== cat) return false;
      if (!terms.length) return true;
      const hay = [r.title, r.description, r.tagline, r.outcome, r.kind, r.categoryLabel, resourceCategoryLabel[c]].join(" ").toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [sorted, cat, q]);

  const filtering = cat !== "all" || q.trim().length > 0;

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-[calc(var(--header-h)+40px)]" aria-labelledby="page-title">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-[10%] top-0 h-[620px] w-[70%] bg-[radial-gradient(50%_50%_at_50%_40%,rgb(0_170_255/0.14),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="container-x relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            {intro}
            <form
              role="search"
              className="vt-search mt-9"
              onSubmit={(e) => {
                e.preventDefault();
                document.getElementById("vault-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <label htmlFor={searchId} className="sr-only">
                Search resources
              </label>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-ink" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resources, topics or keywords…"
                autoComplete="off"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="mr-1 rounded-full px-3 py-1 text-[13px] text-ink-3 hover:text-ink">
                  Clear
                </button>
              ) : null}
              <button
                type="submit"
                aria-label="Show results"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#0a6fe0,#00b4ff)] text-white shadow-[0_10px_24px_-10px_rgb(0_120_230/0.8)]"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>
          {spotlight ? (
            <div className="vt-enter lg:col-span-7">
              <FeaturedResource r={spotlight} />
            </div>
          ) : null}
        </div>
      </section>

      <section id="vault-results" className="section-tight scroll-mt-[calc(var(--header-h)+16px)] pt-4" aria-label="Resource library">
        <div className="container-x">
          <div
            role="toolbar"
            aria-label="Filter resources by category"
            className="vt-chips -mx-[var(--pad-x)] flex gap-2.5 overflow-x-auto px-[var(--pad-x)] pb-2 pt-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          >
            {cats.map((k) => (
              <button key={k} type="button" aria-pressed={cat === k} onClick={() => setCat(k)} className="vt-chip">
                <Icon k={k} />
                {k === "all" ? "All Resources" : resourceCategoryLabel[k]}
              </button>
            ))}
          </div>
          <p className="mt-6 text-[14px] text-ink-3" aria-live="polite">
            {filtering ? `${list.length} ${list.length === 1 ? "resource" : "resources"}${q.trim() ? ` for “${q.trim()}”` : ""}` : `${list.length} free resources`}
          </p>
          {list.length ? (
            <ul className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {list.map((r) => (
                <li key={r.slug}>
                  <ResourceCard r={r} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="panel mt-5 flex flex-col items-start gap-4 p-8 sm:p-10">
              <p className="font-display text-[20px] font-semibold text-ink">Nothing in the Vault matches that yet.</p>
              <p className="text-[15px] text-ink-2">Try a broader word, or browse every resource.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCat("all");
                }}
                className="vt-chip"
                aria-pressed="true"
              >
                Show All Resources
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
