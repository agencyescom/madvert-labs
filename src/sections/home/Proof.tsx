import Image from "next/image";
import { Cta } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Section";
import type { ProofItem, Testimonial } from "@/types/content";

export function Proof({ items, testimonials }: { items: ProofItem[]; testimonials: Testimonial[] }) {
  const t = testimonials.slice(0, 2);
  const tiles = items.slice(0, 6);
  return (
    <section className="section" aria-labelledby="proof-title">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <h2 id="proof-title" data-reveal className="t-h1 lg:col-span-7">
            Marketing Claims Are Cheap. <span className="t-grad">Proof Is More Useful.</span>
          </h2>
          <div data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="lg:col-span-4 lg:col-start-9 lg:justify-self-end">
            <Cta href="/case-studies" variant="secondary" track="case_study_open" trackLabel="proof_section">
              Explore Real Case Studies
            </Cta>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-6 lg:grid-cols-12">
          {t.map((q, i) => (
            <figure key={q.id} data-reveal style={{ ["--reveal-delay" as string]: i * 100 }} className={`panel flex flex-col justify-between p-7 md:col-span-3 lg:col-span-6 ${q.placeholder ? "!border-dashed" : ""}`}>
              <blockquote className="t-h3 !font-medium">“{q.quote}”</blockquote>
              <figcaption className="mt-8 flex items-center gap-3 text-[14px]">
                <span className="h-10 w-10 rounded-full bg-surface-2" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-ink">{q.name}</span>
                  <span className="text-ink-3">
                    {q.role}
                    {q.company ? `, ${q.company}` : ""}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
          {tiles.map((p, i) => (
            <div key={i} data-reveal style={{ ["--reveal-delay" as string]: 100 + i * 60 }} className={`md:col-span-2 ${["lg:col-span-5", "lg:col-span-4", "lg:col-span-3", "lg:col-span-3", "lg:col-span-4", "lg:col-span-5"][i % 6]}`}>
              {p.image ? (
                <figure className="panel overflow-hidden">
                  <Image src={p.image.url} alt={p.image.alt || p.label} width={p.image.width ?? 800} height={p.image.height ?? 600} className="h-56 w-full object-cover" />
                  {p.caption ? <figcaption className="px-5 py-3 text-[13px] text-ink-3">{p.caption}</figcaption> : null}
                </figure>
              ) : (
                <Placeholder label={p.label} className="h-56" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
