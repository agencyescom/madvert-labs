import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaseStudies, getResource, getResources } from "@/cms";
import { BookingSection } from "@/components/booking/BookingSection";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LeadMagnetCover } from "@/components/lead-magnets/LeadMagnetCover";
import { LeadMagnetForm } from "@/components/lead-magnets/LeadMagnetForm";
import { LeadMagnetTracking } from "@/components/lead-magnets/LeadMagnetTracking";
import { RelatedProof } from "@/components/lead-magnets/RelatedProof";
import { ResourceCard } from "@/components/lead-magnets/ResourceCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Section";
import { GrowthRibbon } from "@/components/visuals/GrowthRibbon";
import { pageMetadata, schema } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { InlineLink } from "@/sections/services/Blocks";

export async function generateStaticParams() {
  const all = await getResources();
  return all.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = await getResource(slug);
  if (!r) return {};
  return pageMetadata({
    title: r.seo?.title ?? r.title,
    description: r.seo?.description ?? r.outcome ?? r.description,
    path: `/resources/${r.slug}`,
    image: r.cover && !r.artworkPending ? absoluteUrl(r.cover.url.replace(/\.webp$/, ".jpg")) : undefined,
    type: "article",
  });
}

/** Reusable lead magnet landing page: works standalone for traffic from ads, email, social or WhatsApp. */
export default async function LeadMagnetLandingPage({ params }: PageProps<"/resources/[slug]">) {
  const { slug } = await params;
  const [r, all, studies] = await Promise.all([getResource(slug), getResources(), getCaseStudies()]);
  if (!r) notFound();
  const related = (r.related ?? []).map((s) => all.find((x) => x.slug === s)).filter((x): x is NonNullable<typeof x> => Boolean(x)).slice(0, 3);

  return (
    <div data-lead-magnet={r.slug}>
      <LeadMagnetTracking name={r.title} />

      {/* 1. Hero: resource, outcome, form */}
      <section className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+32px)] md:pb-24" aria-labelledby="lm-title">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <GrowthRibbon shape="rise" spread={70} className="absolute -bottom-10 left-0 h-[300px] w-full" opacity={0.45} id="lm-hero-ribbon" />
        <div className="container-x relative">
          <Breadcrumbs
            items={[
              { name: "Madvert Vault", path: "/resources" },
              { name: r.title, path: `/resources/${r.slug}` },
            ]}
          />
          <div className="mt-10 grid grid-cols-1 items-center gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-10">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <div data-reveal>
                <Eyebrow>{r.categoryLabel ?? r.kind}</Eyebrow>
              </div>
              <p data-reveal style={{ ["--reveal-delay" as string]: 40 }} className="mt-6 font-display text-[14px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                Free {r.kind}: {r.title}
              </p>
              <h1 id="lm-title" data-reveal style={{ ["--reveal-delay" as string]: 80 }} className="t-display mt-4 !text-[clamp(34px,4.2vw,60px)]">
                {r.heroHeadline ?? r.title}
              </h1>
              <p data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="t-lead measure mt-6">
                {r.description}
              </p>
              <div data-reveal style={{ ["--reveal-delay" as string]: 200 }} className="mt-9 max-w-[640px]" id="get">
                <LeadMagnetForm resource={r} />
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5" data-reveal="fade" style={{ ["--reveal-delay" as string]: 160 }}>
              <div className="mx-auto max-w-[220px] sm:max-w-[320px] lg:max-w-[440px]">
                <LeadMagnetCover resource={r} priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Who it is for + what you will get */}
      <section className="section-tight" aria-label="What you will get">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {r.whoFor?.length ? (
            <div className="lg:col-span-5">
              <h2 data-reveal className="t-h2">
                Who This <span className="t-grad">Is For</span>
              </h2>
              <ul className="mt-8 space-y-4">
                {r.whoFor.map((w, i) => (
                  <li key={w} data-reveal style={{ ["--reveal-delay" as string]: i * 70 }} className="flex gap-4 text-[16.5px] text-ink-2">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" aria-hidden="true" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className={r.whoFor?.length ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-8"}>
            <h2 data-reveal className="t-h2">
              What You <span className="t-grad">Will Get</span>
            </h2>
            <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {r.outline.map((o, i) => (
                <li key={o} data-reveal style={{ ["--reveal-delay" as string]: i * 60 }} className="panel flex gap-4 p-5">
                  <span className="font-display text-[13px] font-semibold text-accent-text">0{i + 1}</span>
                  <span className="text-[15.5px] leading-snug text-ink">{o}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 3. Insight */}
      {r.insight ? (
        <section className="section-tight" aria-label="Insight">
          <div className="container-x">
            <div className="panel grid grid-cols-1 gap-8 p-8 sm:p-12 lg:grid-cols-12">
              <h2 data-reveal className="t-h2 lg:col-span-6">
                {r.insight.title}
              </h2>
              <ul className="space-y-2.5 text-[17px] text-ink-2 lg:col-span-5 lg:col-start-8">
                {r.insight.points.map((p, i) => (
                  <li key={p} data-reveal style={{ ["--reveal-delay" as string]: i * 70 }} className="flex items-center gap-3">
                    <span className="h-px w-5 bg-[linear-gradient(90deg,#00b4ff,#00e5ff)]" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="lg:col-span-12">
                <a href="#get" className="group/btn inline-flex items-center gap-2 text-[15px] font-semibold text-accent-text">
                  {r.formCta ?? "Get the guide"} ↑
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. Proof */}
      <RelatedProof resource={r} studies={studies} />

      {/* 5. Resource specific strategy call bridge + calendar */}
      <BookingSection
        eyebrow="Your Next Step"
        title={r.calendarTitle ?? "Want Us to Look at This"}
        accent={r.calendarAccent ?? "With You?"}
        body={
          <>
            <p>{r.calendarBody ?? "Book a Business Strategy Call and bring the real numbers."}</p>
            {r.relatedService ? (
              <p className="mt-4 text-[15px]">
                <InlineLink href={r.relatedService}>See how we do this</InlineLink>
              </p>
            ) : null}
          </>
        }
        context={`lead_magnet:${r.slug}`}
      />

      {/* 6. Related resources */}
      {related.length ? (
        <section className="section-tight pt-0" aria-labelledby="related-title">
          <div className="container-x">
            <h2 id="related-title" data-reveal className="t-h2">
              You Might Also Find <span className="t-grad">These Useful</span>
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((x) => (
                <li key={x.slug} data-reveal>
                  <ResourceCard r={x} related />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={schema.article({
          headline: r.title,
          description: r.outcome ?? r.description,
          path: `/resources/${r.slug}`,
          image: r.cover && !r.artworkPending ? absoluteUrl(r.cover.url.replace(/\.webp$/, ".jpg")) : undefined,
          type: "CreativeWork",
        })}
      />
    </div>
  );
}
