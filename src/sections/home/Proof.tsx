import Image from "next/image";
import { Cta } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Section";
import { TestimonialWall } from "@/components/testimonials/TestimonialWall";
import type { ProofItem, Testimonial } from "@/types/content";

/**
 * Client video testimonials (two opposing marquee rows) plus a compact evidence strip.
 * Until real, client-approved videos exist every card is a bracketed placeholder with play disabled.
 */
export function Proof({ items, testimonials }: { items: ProofItem[]; testimonials: Testimonial[] }) {
  // The video wall now carries testimonials and client video; the strip keeps the other evidence types.
  const tiles = items.filter((p) => p.kind !== "testimonial" && p.kind !== "video").slice(0, 5);
  return (
    <section className="section tm-section" aria-labelledby="proof-title">
      <div className="container-x text-center">
        <p data-reveal className="t-label tm-head-eyebrow !text-accent-text">
          Client Testimonials
        </p>
        <h2 id="proof-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h1 mx-auto mt-6 max-w-[900px]">
          Real Businesses. <span className="t-grad">Real Results.</span>
        </h2>
        <p data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-lead mx-auto mt-5 max-w-[620px]">
          Hear directly from our clients about their experience working with Madvert Labs.
        </p>
      </div>

      <div data-reveal="fade" style={{ ["--reveal-delay" as string]: 160 }} className="mt-12 md:mt-16">
        <TestimonialWall items={testimonials} />
      </div>

      {tiles.length ? (
        <div className="container-x mt-16 md:mt-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="t-label">Behind the results</p>
              <p className="mt-2 max-w-[520px] text-[15px] text-ink-2">Campaign, CRM and creative evidence, published only with client permission.</p>
            </div>
            <Cta href="/case-studies" variant="secondary" track="case_study_open" trackLabel="proof_section">
              Explore Real Case Studies
            </Cta>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {tiles.map((p, i) => (
              <li key={i} data-reveal style={{ ["--reveal-delay" as string]: i * 60 }} className={i === 4 ? "col-span-2 md:col-span-1" : ""}>
                {p.image ? (
                  <figure className="panel overflow-hidden">
                    <Image src={p.image.url} alt={p.image.alt || p.label} width={p.image.width ?? 800} height={p.image.height ?? 600} className="h-36 w-full object-cover" />
                    {p.caption ? <figcaption className="px-4 py-2.5 text-[12.5px] text-ink-3">{p.caption}</figcaption> : null}
                  </figure>
                ) : (
                  <Placeholder label={p.label} className="h-36" />
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
