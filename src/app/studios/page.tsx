import type { Metadata } from "next";
import Image from "next/image";
import { getFaqs, getPortfolio, getSiteSettings } from "@/cms";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Cta, PlayGlyph } from "@/components/ui/Button";
import { Eyebrow, Placeholder } from "@/components/ui/Section";
import { pageMetadata, schema } from "@/lib/seo";
import { AnswerBlock } from "@/sections/services/Blocks";
import { EditTimeline } from "@/sections/studios/EditTimeline";
import { Showreel } from "@/sections/studios/Showreel";
import { FinalCta } from "@/sections/shared/FinalCta";
import type { PortfolioProject } from "@/types/content";

const path = "/studios";
const description =
  "Madvert Studios: static ads, motion, explainers, cinematic films, talking head content, AI commercials and real production for brands that want to stop the scroll.";

export const metadata: Metadata = pageMetadata({ title: "Madvert Studios", description, path });

const formats = [
  { key: "Static", title: "A Static Ad Has One Frame to Make the Argument." },
  { key: "Motion", title: "Some Ideas Need to Move Before They Make Sense." },
  { key: "Explainer", title: "If the Customer Needs Three Calls to Understand It, We Should Probably Explain It Better." },
  { key: "Cinematic", title: "Sometimes Performance Needs Atmosphere." },
  { key: "Talking Head", title: "Authority Works Better With a Face." },
  { key: "AI Commercial", title: "Create What Used to Require a Film Set." },
  { key: "AI Influencer", title: "The Talent Can Be Digital. The Standard Still Has to Be Real." },
  { key: "Real Production", title: "Real People Still Matter." },
];

function Frame({ p, className = "" }: { p?: PortfolioProject; className?: string }) {
  if (p?.poster) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-line-strong ${className}`}>
        <Image src={p.poster.url} alt={p.poster.alt || p.title} fill sizes="400px" className="object-cover" />
      </div>
    );
  }
  return <Placeholder label={p?.title ?? "[REAL CREATIVE WORK]"} className={`!rounded-2xl ${className}`} />;
}

export default async function StudiosPage() {
  const [portfolio, settings, faqs] = await Promise.all([getPortfolio(), getSiteSettings(), getFaqs("studios")]);
  const byFormat = (f: string) => portfolio.find((p) => p.format.toLowerCase() === f.toLowerCase());

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+40px)] md:pb-24" aria-labelledby="page-title">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_20%,rgb(245_158_11/0.10),transparent_70%),radial-gradient(50%_60%_at_20%_80%,rgb(167_139_250/0.10),transparent_70%)]" aria-hidden="true" />
        <div className="container-x relative">
          <Breadcrumbs items={[{ name: "Madvert Studios", path }]} />
          <div className="relative mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div data-reveal>
                <Eyebrow>Madvert Studios</Eyebrow>
              </div>
              <h1 id="page-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-display mt-7">
                People Do Not Skip Ads. <span className="t-grad">They Skip Boring Ads.</span>
              </h1>
              <p data-reveal style={{ ["--reveal-delay" as string]: 140 }} className="t-lead measure mt-7">
                Creative production for brands that want to stop the scroll, explain the value and look worth paying attention to.
              </p>
              <div data-reveal style={{ ["--reveal-delay" as string]: 200 }} className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Cta href="/contact?service=studios" size="lg" track="service_cta_click">
                  Make Something Worth Stopping For
                </Cta>
                <Cta href="#showreel" size="lg" variant="secondary" arrow={false} icon={<PlayGlyph />} track="showreel_play" trackLabel="hero_watch_showreel">
                  Watch the Showreel
                </Cta>
              </div>
            </div>
            <div className="relative hidden h-[460px] lg:col-span-5 lg:block" aria-hidden="true">
              <Frame p={portfolio[0]} className="float-frame absolute left-[6%] top-0 h-[220px] w-[170px] rotate-[-5deg]" />
              <Frame p={portfolio[1]} className="float-frame absolute right-0 top-[10%] h-[180px] w-[260px] rotate-[4deg] [animation-delay:-2s]" />
              <Frame p={portfolio[2]} className="float-frame absolute bottom-0 left-[22%] h-[200px] w-[300px] rotate-[-2deg] [animation-delay:-4s]" />
            </div>
          </div>
          <div data-reveal="fade" className="mt-16">
            <EditTimeline />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="attention-title">
        <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <h2 id="attention-title" data-reveal className="t-h1 lg:col-span-6">
            You Get Seconds. <span className="t-grad">Sometimes Less.</span>
          </h2>
          <div data-reveal className="flex items-end gap-6 lg:col-span-5 lg:col-start-8" aria-hidden="true">
            {["3", "2", "1"].map((n, i) => (
              <span key={n} className="font-display text-[clamp(80px,10vw,150px)] font-semibold leading-none tracking-tighter" style={{ opacity: 1 - i * 0.3, color: i === 2 ? "var(--accent-text)" : undefined }}>
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12" aria-label="Formats">
        <div className="container-x">
          <ol>
            {formats.map((f, i) => (
              <li key={f.key} className="grid grid-cols-1 items-center gap-8 border-t border-line py-12 md:grid-cols-12 md:py-16">
                <p data-reveal className="font-display text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-3 md:col-span-2">
                  <span className="text-accent-text">0{i + 1}</span> {f.key}
                </p>
                <h3 data-reveal style={{ ["--reveal-delay" as string]: 60 }} className={`t-h2 md:col-span-6 ${i % 2 ? "md:order-3 md:col-span-6" : ""}`}>
                  {f.title}
                </h3>
                <div data-reveal="fade" className={`md:col-span-4 ${i % 2 ? "md:order-2 md:col-span-4" : ""}`}>
                  <Frame p={byFormat(f.key)} className={`aspect-video w-full ${i % 2 ? "rotate-[1.5deg]" : "rotate-[-1.5deg]"}`} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="showreel" className="section scroll-mt-20" aria-labelledby="showreel-title">
        <div className="container-x">
          <h2 id="showreel-title" data-reveal className="t-h1 max-w-[840px]">
            Do Not Take Our Word for It. <span className="t-grad">Press Play.</span>
          </h2>
          <div data-reveal="fade" className="mt-12">
            <Showreel url={settings.showreelUrl} poster={settings.showreelPoster} />
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {portfolio.map((p) => (
              <li key={p.slug}>
                {p.videoUrl ? (
                  <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" data-track="portfolio_open" data-track-label={p.slug} className="block">
                    <Frame p={p} className="aspect-[4/5]" />
                    <span className="mt-2 block text-[13px] text-ink-2">{p.title}</span>
                  </a>
                ) : (
                  <>
                    <Frame p={p} className="aspect-[4/5]" />
                    <span className="mt-2 block text-[13px] text-ink-3">{p.format}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AnswerBlock
        service="Madvert Studios"
        glance={[
          { label: "Who it is for", value: "Brands whose ads, content or explainers are not earning attention or explaining the value clearly." },
          { label: "Formats", value: "Static, motion, explainer, cinematic, talking head, AI commercials, AI influencers and real production." },
          { label: "Process", value: "Brief and angle, script and storyboard, production, edit, then testing variations in market." },
          { label: "Measured by", value: "Thumb stop rate, hold rate, click through and the downstream quality of leads or sales." },
        ]}
        faqs={faqs}
      />

      <FinalCta title="Make the Next Scroll" accent="Stop Here." primary={{ label: "Start a Creative Project", href: "/contact?service=studios" }} track="service_cta_click" />

      <JsonLd data={schema.service({ name: "Madvert Studios", serviceType: "Creative and video production", description, path, audience: "Brands and established businesses" })} />
    </>
  );
}
