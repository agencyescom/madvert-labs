import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCaseStudies, getCaseStudy } from "@/cms";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow, Placeholder } from "@/components/ui/Section";
import { pageMetadata, schema } from "@/lib/seo";
import { site } from "@/lib/site";
import { FinalCta } from "@/sections/shared/FinalCta";

export async function generateStaticParams() {
  const studies = await getCaseStudies();
  return studies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getCaseStudy(slug);
  if (!s) return {};
  return pageMetadata({
    title: s.seo?.title ?? s.title,
    description: s.seo?.description ?? s.summary,
    path: `/case-studies/${s.slug}`,
    image: s.featuredImage?.url,
    type: "article",
    noindex: s.placeholder,
  });
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const s = await getCaseStudy(slug);
  if (!s) notFound();

  const sections = [
    { id: "context", label: "Context", body: [s.client && `Client: ${s.client}`, s.industry && `Industry: ${s.industry}`, s.market && `Market: ${s.market}`].filter(Boolean).join(" · ") },
    { id: "problem", label: "Problem", body: s.problem },
    { id: "diagnosis", label: "Diagnosis", body: s.diagnosis },
    { id: "strategy", label: "Strategy", body: s.strategy ?? s.move },
    { id: "creative", label: "Creative", body: s.creative },
    { id: "system", label: "System", body: s.system },
  ].filter((x) => x.body);

  return (
    <article>
      <header className="relative overflow-hidden pb-14 pt-[calc(var(--header-h)+40px)]">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-x relative">
          <Breadcrumbs
            items={[
              { name: "Case Studies", path: "/case-studies" },
              { name: s.title, path: `/case-studies/${s.slug}` },
            ]}
          />
          <div className="mt-14 max-w-[960px]">
            <div data-reveal className="flex flex-wrap items-center gap-3">
              <Eyebrow>{s.services.join(" · ")}</Eyebrow>
              {s.placeholder ? <span className="rounded-full border border-dashed border-line-strong px-3 py-1 text-[12px] text-ink-3">Framework awaiting real client data</span> : null}
            </div>
            <h1 data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-display mt-7 !text-[clamp(34px,4.2vw,60px)]">
              {s.title}
            </h1>
            <p data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-lead mt-6">
              {s.summary}
            </p>
          </div>
        </div>
      </header>

      <div className="container-x">
        {s.featuredImage ? (
          <div className="relative aspect-[16/8] overflow-hidden rounded-[28px] border border-line">
            <Image src={s.featuredImage.url} alt={s.featuredImage.alt} fill sizes="(min-width:1280px) 1280px, 100vw" className="object-cover" priority />
          </div>
        ) : (
          <Placeholder label="[REAL CASE STUDY HERO IMAGE OR SCREENSHOT]" className="aspect-[16/7]" />
        )}
      </div>

      <section className="section-tight" aria-label="Numbers">
        <div className="container-x">
          <h2 className="t-label">Numbers</h2>
          <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-[var(--line)] sm:grid-cols-3">
            {s.metrics.map((m) => (
              <div key={m.label} className="bg-bg p-7">
                <dt className="text-[13.5px] text-ink-3">{m.label}</dt>
                <dd className="mt-3 font-display text-[clamp(22px,2.4vw,34px)] font-semibold tracking-tight text-ink">{m.value}</dd>
                {m.context ? <p className="mt-2 text-[12.5px] text-ink-3">{m.context}</p> : null}
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="container-x grid grid-cols-1 gap-12 pb-10 lg:grid-cols-12">
        <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
          <ol className="sticky top-[calc(var(--header-h)+32px)] space-y-2 border-l border-line pl-5 text-[14px]">
            {sections.map((x) => (
              <li key={x.id}>
                <a href={`#${x.id}`} className="text-ink-3 transition-colors hover:text-ink">
                  {x.label}
                </a>
              </li>
            ))}
            {s.learned ? (
              <li>
                <a href="#learned" className="text-ink-3 hover:text-ink">
                  What We Learned
                </a>
              </li>
            ) : null}
          </ol>
        </nav>
        <div className="lg:col-span-8 lg:col-start-5">
          {sections.map((x) => (
            <section key={x.id} id={x.id} className="scroll-mt-28 border-t border-line py-10">
              <h2 className="t-label !text-accent-text">{x.label}</h2>
              <p className="mt-4 text-[18px] leading-relaxed text-ink">{x.body}</p>
            </section>
          ))}
          {s.gallery?.length ? (
            <div className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-2">
              {s.gallery.map((g) => (
                <Image key={g.url} src={g.url} alt={g.alt} width={g.width ?? 1200} height={g.height ?? 800} className="rounded-2xl border border-line" />
              ))}
            </div>
          ) : null}
          <section className="border-t border-line py-10">
            <h2 className="t-label !text-accent-text">Result</h2>
            <p className="mt-4 text-[18px] leading-relaxed text-ink">{s.result}</p>
          </section>
          {s.learned ? (
            <section id="learned" className="scroll-mt-28 border-t border-line py-10">
              <h2 className="t-label !text-accent-text">What We Learned</h2>
              <p className="mt-4 text-[18px] leading-relaxed text-ink">{s.learned}</p>
            </section>
          ) : null}
          <section className="border-t border-line py-10">
            <h2 className="t-label !text-accent-text">Client</h2>
            {s.testimonial ? (
              <figure className="mt-5">
                <blockquote className="t-h3 !font-medium">“{s.testimonial.quote}”</blockquote>
                <figcaption className="mt-4 text-[14px] text-ink-3">
                  {s.testimonial.name}
                  {s.testimonial.role ? `, ${s.testimonial.role}` : ""}
                </figcaption>
              </figure>
            ) : (
              <Placeholder label="[REAL CLIENT VIDEO OR TESTIMONIAL]" className="mt-5 aspect-video" />
            )}
          </section>
        </div>
      </div>

      <FinalCta title="Want Us to Look at" accent="Your Growth System?" primary={{ label: "Book a Business Strategy Call", href: site.primaryCta.href }} />
      <JsonLd
        data={schema.article({
          headline: s.title,
          description: s.summary,
          path: `/case-studies/${s.slug}`,
          image: s.featuredImage?.url,
          datePublished: s.publishedAt,
          type: "CreativeWork",
        })}
      />
    </article>
  );
}
