import Link from "next/link";
import { Cta } from "@/components/ui/Button";
import { ResourceCover } from "@/components/visuals/ResourceCover";
import type { Resource } from "@/types/content";

export function Vault({ resources }: { resources: Resource[] }) {
  const featured = resources.filter((r) => r.featured).slice(0, 5);
  return (
    <section className="section overflow-hidden" aria-labelledby="vault-title">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p data-reveal className="t-eyebrow">Madvert Vault</p>
            <h2 id="vault-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h1 mt-5">
              Take Something Useful <span className="t-grad">Before You Leave.</span>
            </h2>
          </div>
          <div data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="text-[16px] text-ink-2 lg:col-span-4 lg:col-start-9">
            <p>No email bait dressed up as value.</p>
            <p className="mt-1.5">Resources built to help you see your growth more clearly.</p>
          </div>
        </div>
        <ul className="-mx-[var(--pad-x)] mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--pad-x)] pb-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          {featured.map((r, i) => (
            <li key={r.slug} data-reveal style={{ ["--reveal-delay" as string]: i * 80 }} className="w-[220px] shrink-0 snap-start lg:w-auto">
              <Link href={`/resources/${r.slug}`} data-track="free_value_click" data-track-label={`vault_${r.slug}`} className="group block">
                <ResourceCover resource={r} className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2 group-hover:rotate-[-1.2deg]" />
                <p className="mt-4 text-[14.5px] font-medium text-ink">{r.title}</p>
                <p className="text-[13px] text-ink-3">{r.kind}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div data-reveal className="mt-10">
          <Cta href="/resources" variant="secondary">
            Open the Vault
          </Cta>
        </div>
      </div>
    </section>
  );
}
