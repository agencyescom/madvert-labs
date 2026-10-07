import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Eyebrow } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/seo";
import { BookingWidget } from "@/forms/BookingWidget";
import { ContactFlow } from "@/forms/ContactFlow";

const description = "Tell Madvert Labs what is happening, what you have tried and what a great result looks like. Send a growth brief or book a business strategy call with Usama.";

export const metadata: Metadata = pageMetadata({ title: "Contact Us", description, path: "/contact" });

const next = [
  "We review your business before the conversation.",
  "We identify the obvious questions and gaps.",
  "We talk about the business, not a generic package.",
  "If there is a fit, we show you where we would start.",
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-12 pt-[calc(var(--header-h)+40px)]" aria-labelledby="page-title">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="bg-aura pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-x relative">
          <Breadcrumbs items={[{ name: "Contact Us", path: "/contact" }]} />
          <div className="mt-14 max-w-[900px]">
            <div data-reveal>
              <Eyebrow>Contact Us</Eyebrow>
            </div>
            <h1 id="page-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-display mt-7 !text-[clamp(36px,4.4vw,62px)]">
              Let Us Talk About the Business <span className="t-grad">Before We Talk About the Service.</span>
            </h1>
            <p data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="t-lead measure mt-7">
              Tell us what is happening, what you have already tried and what a great result would look like.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24" aria-label="Growth brief">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <ContactFlow />
          </div>
          <aside className="lg:col-span-4" aria-labelledby="next-title">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+32px)]">
              <h2 id="next-title" className="t-h3">
                What Happens Next?
              </h2>
              <ol className="mt-6 space-y-5">
                {next.map((n, i) => (
                  <li key={n} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-strong font-display text-[13px] font-semibold text-accent-text">{i + 1}</span>
                    <span className="pt-1 text-[15.5px] text-ink-2">{n}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <section id="book" className="section scroll-mt-20 border-t border-line" aria-labelledby="book-title">
        <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="book-title" className="t-h1">
              Prefer a <span className="t-grad">Conversation?</span>
            </h2>
            <p className="t-lead mt-6">Book a Business Strategy Call with Usama and bring the real numbers.</p>
            <p className="t-small mt-6">30 minutes. Your time zone is detected automatically and you can change it.</p>
          </div>
          <div className="lg:col-span-8">
            <BookingWidget />
          </div>
        </div>
      </section>

      <section className="section-tight border-t border-line">
        <div className="container-x text-center">
          <p className="t-h2 mx-auto max-w-[860px]">
            No Generic Pitch. No Pressure. <span className="t-grad">Just a Serious Conversation About Growth.</span>
          </p>
        </div>
      </section>
    </>
  );
}
