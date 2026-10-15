import { Cta } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { GrowthSystem } from "@/components/visuals/growth-system/GrowthSystem";

/** One integrated external growth team: seven modules that assemble into one system on the Madvert Growth Ribbon. */
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
            <div className="lg:col-span-7">
              <div className="mx-auto w-full max-w-[600px] lg:py-6">
                <GrowthSystem />
              </div>
            </div>
          </div>
          <p className="relative mt-10 text-[12.5px] text-ink-3">One integrated external growth team working alongside your business.</p>
        </div>
      </div>
    </section>
  );
}
