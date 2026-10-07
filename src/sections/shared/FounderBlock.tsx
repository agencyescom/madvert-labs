import Image from "next/image";
import { Cta } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Section";
import { site } from "@/lib/site";
import type { ImageAsset } from "@/types/content";

const whys = [
  "Why are the leads weak?",
  "Why did conversion drop?",
  "Why did the customer disappear?",
  "Why does the business look smaller online than it really is?",
  "Why is the team still doing this manually?",
  "Why can we not build something better?",
];

export function FounderBlock({ photo, headingLevel = "h2" }: { photo?: ImageAsset; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <section className="section relative overflow-hidden" aria-labelledby="founder-title">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div data-reveal="fade" className="lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px]">
            <div className="absolute -inset-3 rounded-[34px] bg-[radial-gradient(circle_at_70%_10%,rgb(0_180_255/0.25),transparent_60%)] blur-2xl" aria-hidden="true" />
            {photo ? (
              <Image src={photo.url} alt={photo.alt || site.founder.name} fill sizes="(min-width:1024px) 460px, 90vw" className="rounded-[28px] border border-line object-cover" />
            ) : (
              <Placeholder label="[AUTHENTIC USAMA PHOTOGRAPHY]" className="absolute inset-0 !rounded-[28px]" />
            )}
            <div className="absolute -bottom-5 left-6 right-6 rounded-2xl border border-line bg-surface px-5 py-4 shadow-[var(--shadow-lg)]">
              <p className="font-display text-[16px] font-semibold">{site.founder.name}</p>
              <p className="text-[13px] text-ink-3">{site.founder.role}</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <H id="founder-title" data-reveal className="t-h1">
            Meet Usama. <span className="t-grad">The Person Asking “Why?” One More Time.</span>
          </H>
          <ul className="mt-9 space-y-2.5">
            {whys.map((w, i) => (
              <li key={w} data-reveal style={{ ["--reveal-delay" as string]: 60 + i * 70 }} className="flex items-baseline gap-4 text-[17px] text-ink-2">
                <span className="font-display text-[12px] font-semibold text-accent-text">0{i + 1}</span>
                {w}
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-9 space-y-2 text-[16.5px] text-ink-2">
            <p>That curiosity shapes how Madvert works.</p>
            <p>We do not stop at the first visible problem.</p>
            <p>We keep looking until the business logic makes sense.</p>
          </div>
          <p data-reveal className="t-h3 mt-8">The Channel Is Never More Important Than the Business Behind It.</p>
          <div data-reveal className="mt-9">
            <Cta href={site.founderCta.href} size="lg" track="strategy_call_click" trackLabel="founder_cta" className="!whitespace-normal">
              {site.founderCta.label}
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
