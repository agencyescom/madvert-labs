import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResource, getResources } from "@/cms";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Section";
import { ResourceCover } from "@/components/visuals/ResourceCover";
import { ResourceGate } from "@/forms/ResourceGate";
import { pageMetadata, schema } from "@/lib/seo";
import { InlineLink } from "@/sections/services/Blocks";

export async function generateStaticParams() {
  const all = await getResources();
  return all.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = await getResource(slug);
  if (!r) return {};
  return pageMetadata({ title: r.seo?.title ?? r.title, description: r.seo?.description ?? r.description, path: `/resources/${r.slug}`, image: r.cover?.url, type: "article" });
}

export default async function ResourcePage({ params }: PageProps<"/resources/[slug]">) {
  const { slug } = await params;
  const r = await getResource(slug);
  if (!r) notFound();
  return (
    <section className="relative overflow-hidden pb-28 pt-[calc(var(--header-h)+40px)]">
      <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container-x relative">
        <Breadcrumbs
          items={[
            { name: "Madvert Vault", path: "/resources" },
            { name: r.title, path: `/resources/${r.slug}` },
          ]}
        />
        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <ResourceCover resource={r} className="mx-auto max-w-[320px] rotate-[-2deg]" />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <div data-reveal>
              <Eyebrow>{r.kind}</Eyebrow>
            </div>
            <h1 data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h1 mt-6">
              {r.title}
            </h1>
            <p data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-lead mt-6">
              {r.description}
            </p>
            {r.outline.length ? (
              <div className="mt-10">
                <h2 className="t-label">Inside</h2>
                <ul className="mt-4 divide-y divide-[color:var(--line)] border-y border-line">
                  {r.outline.map((o, i) => (
                    <li key={o} className="flex items-baseline gap-4 py-3.5 text-[16px] text-ink-2">
                      <span className="font-display text-[12px] font-semibold text-accent-text">0{i + 1}</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-10">
              <ResourceGate slug={r.slug} title={r.title} gating={r.gating} openUrl={r.fileUrl ?? r.externalUrl} />
            </div>
            {r.relatedService ? (
              <p className="mt-10 text-[15px] text-ink-3">
                Need the system built? <InlineLink href={r.relatedService}>See the related service</InlineLink>
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <JsonLd data={schema.article({ headline: r.title, description: r.description, path: `/resources/${r.slug}`, image: r.cover?.url })} />
    </section>
  );
}
