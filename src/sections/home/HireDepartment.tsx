import { Cta } from "@/components/ui/Button";
import { Glyph, type IconName } from "@/components/ui/Icon3D";
import { Eyebrow } from "@/components/ui/Section";
import { MadvertMark } from "@/components/ui/MadvertMark";

const team: { label: string; icon: IconName }[] = [
  { label: "Strategy", icon: "strategy" },
  { label: "Paid Media", icon: "paidMedia" },
  { label: "SEO", icon: "seo" },
  { label: "Creative", icon: "studios" },
  { label: "Branding", icon: "branding" },
  { label: "Conversion", icon: "conversion" },
  { label: "CRM", icon: "crm" },
  { label: "Automation", icon: "automation" },
  { label: "Analytics", icon: "analytics" },
  { label: "Development", icon: "development" },
];

/** One integrated external growth team, visualised as ten disciplines on one Growth Ribbon. */
export function HireDepartment() {
  return (
    <section id="hire" className="section scroll-mt-20" aria-labelledby="hire-title">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[36px] border border-[rgb(0_200_255/0.22)] bg-[var(--surface-card)] p-7 shadow-[0_50px_120px_-60px_rgb(0_150_220/0.6)] backdrop-blur-sm sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_85%_10%,rgb(0_200_255/0.16),transparent_70%),radial-gradient(40%_50%_at_0%_100%,rgb(0_229_255/0.08),transparent_70%)]" aria-hidden="true" />
          <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <div data-reveal>
                <Eyebrow>One Team. One Direction.</Eyebrow>
              </div>
              <h2 id="hire-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h1 mt-6">
                Hire Your <span className="t-grad">Marketing Department.</span>
              </h2>
              <div data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="mt-7 space-y-4 text-[16.5px] leading-relaxed text-ink-2">
                <p>Your business may need paid media, SEO, content, creative, funnels, CRM, automation, analytics and technology.</p>
                <p>The problem is usually not finding each service.</p>
                <p className="text-ink">It is getting all of them to work together.</p>
                <p>Madvert Labs gives you one growth partner across the system.</p>
              </div>
              <div data-reveal style={{ ["--reveal-delay" as string]: 180 }} className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Cta href="#book" size="lg" track="strategy_call_click" trackLabel="hire_department">
                  Hire Your Marketing Department
                </Cta>
                <Cta href="/services" size="lg" variant="secondary" track="service_cta_click" trackLabel="hire_see_everything">
                  See Everything We Do
                </Cta>
              </div>
            </div>
            <div className="lg:col-span-7" data-reveal="fade">
              <div className="draw-on-reveal relative mx-auto aspect-square w-full max-w-[560px]">
                <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <defs>
                    <linearGradient id="hire-g" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0" stopColor="#00b4ff" />
                      <stop offset="1" stopColor="#00e5ff" />
                    </linearGradient>
                  </defs>
                  <circle cx="200" cy="200" r="150" fill="none" stroke="var(--line-strong)" strokeDasharray="2 6" />
                  <circle cx="200" cy="200" r="150" fill="none" stroke="url(#hire-g)" strokeWidth="2.5" pathLength={1} transform="rotate(-90 200 200)" style={{ filter: "drop-shadow(0 0 6px rgb(0 200 255 / .6))" }} />
                  {team.map((_, i) => {
                    const a = (i / team.length) * Math.PI * 2 - Math.PI / 2;
                    return <path key={i} d={`M200 200 L ${200 + 150 * Math.cos(a)} ${200 + 150 * Math.sin(a)}`} stroke="var(--line)" />;
                  })}
                  <circle cx="200" cy="200" r="150" fill="none" stroke="#bff7ff" strokeWidth="3" className="ribbon-flow" opacity=".55" />
                </svg>
                <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[26px] border border-[rgb(0_200_255/0.45)] bg-[var(--surface-solid)] shadow-[0_0_50px_-10px_rgb(0_200_255/0.7)] sm:h-28 sm:w-28">
                  <MadvertMark className="h-7 w-auto text-ink" />
                </div>
                {team.map((t, i) => {
                  const a = (i / team.length) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <div key={t.label} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${50 + 37.5 * Math.cos(a)}%`, top: `${50 + 37.5 * Math.sin(a)}%` }}>
                      <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-line-strong bg-[var(--surface-solid)] sm:h-12 sm:w-12">
                        <Glyph name={t.icon} size={22} />
                      </span>
                      <span className="mt-1.5 block whitespace-nowrap text-[10.5px] font-semibold text-ink-2 sm:text-[12px]">{t.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="relative mt-10 text-[12.5px] text-ink-3">One integrated external growth team working alongside your business.</p>
        </div>
      </div>
    </section>
  );
}
