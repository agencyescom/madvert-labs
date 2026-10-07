import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSettings, getTeam } from "@/cms";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow, Placeholder } from "@/components/ui/Section";
import { GrowthRibbon } from "@/components/visuals/GrowthRibbon";
import { pageMetadata, schema } from "@/lib/seo";
import { site } from "@/lib/site";
import { Statement } from "@/sections/services/Blocks";
import { FounderBlock } from "@/sections/shared/FounderBlock";
import { FinalCta } from "@/sections/shared/FinalCta";

const description =
  "Madvert Labs is a digital marketing and growth systems company. We did not set out to do everything. We kept finding problems nobody else owned.";

export const metadata: Metadata = pageMetadata({ title: "About Us", description, path: "/about", type: "profile" });

const origin: [string, string?][] = [
  ["A client needed leads.", "So we ran campaigns."],
  ["The leads arrived."],
  ["Then we noticed the landing page was weak.", "We fixed it."],
  ["Then the follow up was slow.", "We improved it."],
  ["Then the CRM was missing.", "We built the system."],
  ["Then reporting was fragmented."],
  ["Then automation was needed."],
  ["Then a custom tool made more sense than another subscription."],
];

export default async function AboutPage() {
  const [team, settings] = await Promise.all([getTeam(), getSiteSettings()]);
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+40px)] md:pb-24" aria-labelledby="page-title">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="bg-aura pointer-events-none absolute inset-0" aria-hidden="true" />
        <GrowthRibbon shape="wave" spread={60} className="absolute -bottom-20 left-0 h-[260px] w-full" opacity={0.4} id="about-ribbon" />
        <div className="container-x relative">
          <Breadcrumbs items={[{ name: "About Us", path: "/about" }]} />
          <div className="mt-14 max-w-[980px]">
            <div data-reveal>
              <Eyebrow>About Madvert Labs</Eyebrow>
            </div>
            <h1 id="page-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-display mt-7 !text-[clamp(36px,4.6vw,66px)]">
              We Did Not Set Out to Do Everything. <span className="t-grad">We Kept Finding Problems Nobody Else Owned.</span>
            </h1>
            <p data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="t-lead measure mt-7">
              That is how a marketing company became a growth systems company.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="origin-title">
        <div className="container-x grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+48px)]">
              <h2 id="origin-title" data-reveal className="t-h1">
                It Started <span className="t-grad">With Marketing.</span>
              </h2>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ol className="relative border-l border-line pl-8">
              {origin.map(([a, b], i) => (
                <li key={a} data-reveal style={{ ["--reveal-delay" as string]: i * 50 }} className="relative pb-8 last:pb-0">
                  <span className="absolute -left-[37px] top-[10px] h-[9px] w-[9px] rounded-full border border-[#00e5ff] bg-bg" aria-hidden="true" />
                  <p className="text-[19px] text-ink">{a}</p>
                  {b ? <p className="mt-1 text-[16px] text-accent-text">{b}</p> : null}
                </li>
              ))}
            </ol>
            <div data-reveal className="mt-14 border-t border-line pt-10">
              <p className="t-h2">Businesses Rarely Have One Marketing Problem.</p>
              <p className="t-lead mt-4">They have connected problems.</p>
              <p className="t-lead mt-1 text-ink">And connected problems need connected thinking.</p>
            </div>
          </div>
        </div>
      </section>

      <Statement title="Madvert Labs Is a Digital Marketing" accent="and Growth Systems Company." center>
        <p data-reveal className="t-lead mx-auto mt-6 max-w-[620px] text-center">
          {site.tagline} {site.promise}
        </p>
      </Statement>

      <Statement
        title="The Business Problem"
        accent="Comes First."
        lines={["We do not believe every business needs Meta Ads.", "Or SEO.", "Or an AI agent.", "Or a new website.", "Every business needs the right answer to the right problem."]}
        closing="That is why diagnosis comes before prescription."
      />

      <section className="section-tight" aria-label="Standards">
        <div className="container-x">
          <div className="hairline mb-20" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-10">
            <div>
              <h2 data-reveal className="t-h1">
                Good Enough <span className="t-grad">Is Expensive.</span>
              </h2>
            </div>
            <div>
              <h2 data-reveal className="t-h1">
                Built for <span className="t-grad">What Is Next.</span>
              </h2>
              <div data-reveal className="mt-8 space-y-1.5 text-[17px] text-ink-2">
                <p>The market does not wait.</p>
                <p>Search is changing.</p>
                <p>AI is changing customer expectations.</p>
                <p>Creative production is changing.</p>
                <p>Automation is changing how teams work.</p>
                <p className="pt-4 text-ink">We continuously learn, test and adopt proven new methods so our clients are not running yesterday&apos;s playbook in tomorrow&apos;s market.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FounderBlock photo={settings.founderPhoto} />

      <section className="section-tight" aria-labelledby="team-title">
        <div className="container-x">
          <h2 id="team-title" data-reveal className="t-h1 max-w-[900px]">
            Specialists Where Specialisation Matters. <span className="t-grad">One Direction Where Direction Matters.</span>
          </h2>
          <ul className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {team.map((m, i) => (
              <li key={`${m.name}-${i}`} data-reveal style={{ ["--reveal-delay" as string]: i * 70 }}>
                {m.photo ? (
                  <Image src={m.photo.url} alt={m.photo.alt || m.name} width={600} height={750} className="aspect-[4/5] w-full rounded-2xl border border-line object-cover" />
                ) : (
                  <Placeholder label={m.name === site.founder.name ? "[REAL FOUNDER PHOTO]" : "[REAL TEAM PHOTO]"} className="aspect-[4/5]" />
                )}
                <p className="mt-4 font-display text-[16px] font-semibold">{m.name}</p>
                <p className="text-[14px] text-ink-3">{m.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-label="Fit">
        <div className="container-x grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div data-reveal className="panel p-8 sm:p-12">
            <p className="t-eyebrow">Who we work with</p>
            <h2 className="t-h2 mt-5">Built for Businesses That Are Already Moving.</h2>
          </div>
          <div data-reveal style={{ ["--reveal-delay" as string]: 100 }} className="panel p-8 sm:p-12">
            <p className="t-eyebrow">Who we are not for</p>
            <h2 className="t-h2 mt-5">We Are Probably Not the Cheapest Option. That Is Intentional.</h2>
            <div className="mt-6 space-y-3 text-[16px] text-ink-2">
              <p>If you need ten social posts at the lowest possible price, there are easier options.</p>
              <p>If you want guaranteed rankings next month, we are not the right people.</p>
              <p>If you only want vanity metrics, we will probably ask too many questions.</p>
              <p className="text-ink">But if you want somebody to understand the business, challenge assumptions and take ownership of the growth system, we should talk.</p>
            </div>
          </div>
        </div>
      </section>

      <FinalCta title="Bring Us the Business Problem." accent="We Will Start There." primary={site.founderCta} />
      <JsonLd data={schema.webPage("About Madvert Labs", description, "/about")} />
    </>
  );
}
