import { Cta } from "@/components/ui/Button";
import { FeaturedResource } from "@/components/lead-magnets/FeaturedResource";
import { ResourceCard } from "@/components/lead-magnets/ResourceCard";
import type { Resource } from "@/types/content";

/** Homepage echo of the Madvert Vault: the spotlight resource on its podium plus four resources with official artwork. */
export function Vault({ resources }: { resources: Resource[] }) {
  const spotlight = resources.find((r) => r.spotlight) ?? resources.find((r) => r.featured && !r.artworkPending);
  const picks = resources.filter((r) => r.featured && !r.artworkPending && r.slug !== spotlight?.slug).slice(0, 4);
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
            <p>Free playbooks, checklists and growth resources for business owners.</p>
            <p className="mt-1.5">No email bait dressed up as value.</p>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {spotlight ? (
            <div data-reveal="fade" className="lg:col-span-5">
              <FeaturedResource r={spotlight} compact headingLevel="h3" />
            </div>
          ) : null}
          <ul className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${spotlight ? "lg:col-span-7" : "lg:col-span-12 lg:grid-cols-4"}`}>
            {picks.map((r, i) => (
              <li key={r.slug} data-reveal style={{ ["--reveal-delay" as string]: i * 70 }} className={i > 1 ? "hidden sm:block" : undefined}>
                <ResourceCard r={r} trackLabel={`vault_${r.slug}`} />
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal className="mt-10">
          <Cta href="/resources" variant="secondary">
            Open the Vault
          </Cta>
        </div>
      </div>
    </section>
  );
}
