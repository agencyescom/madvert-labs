import { AccentHeadline } from "@/components/ui/Section";

const messages = [
  { from: "Ads Agency", text: "Ask the website guy.", tone: "#60a5fa" },
  { from: "Web Developer", text: "Pixel seems fine from our side.", tone: "#a78bfa" },
  { from: "SEO Team", text: "SEO traffic is increasing.", tone: "#34d399" },
  { from: "Ads Agency", text: "Leads are coming from Meta.", tone: "#60a5fa" },
  { from: "Account Manager", text: "Sales says quality is poor.", tone: "#fbbf24" },
];

const dashboards = ["Meta Ads", "Google Ads", "GA4", "Search Console", "CRM", "Email", "Call tracking", "Social", "Shopify", "Hotjar", "Looker", "Sheets"];

export function Fragmentation() {
  return (
    <section className="section overflow-hidden" aria-labelledby="frag-title">
      <div className="container-x grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <div data-reveal>
            <AccentHeadline as="h2" text="Seven Vendors. Twelve Dashboards. Nobody Owns the Outcome." className="t-h1" />
          </div>
          <ul data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="mt-10 flex max-w-[520px] flex-wrap gap-2" aria-label="Twelve separate dashboards">
            {dashboards.map((d) => (
              <li key={d} className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-3">
                {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div data-reveal className="panel mx-auto max-w-[480px] overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 font-display text-[13px] font-bold text-ink-2">GP</span>
              <div className="min-w-0">
                <p className="truncate font-display text-[15px] font-semibold">Growth Project (Vendors)</p>
                <p className="text-[12px] text-ink-3">Ads Agency, Web Developer, SEO Team, Designer, Account Manager…</p>
              </div>
            </div>
            <ol className="space-y-3 px-5 py-6" aria-label="Group chat between vendors">
              {messages.map((m, i) => (
                <li key={i} data-reveal style={{ ["--reveal-delay" as string]: 200 + i * 260 }} className="max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-2.5">
                    <p className="text-[11.5px] font-semibold" style={{ color: m.tone }}>
                      {m.from}
                    </p>
                    <p className="text-[15px] text-ink">{m.text}</p>
                  </div>
                </li>
              ))}
              <li data-reveal style={{ ["--reveal-delay" as string]: 200 + messages.length * 260 + 200 }} className="pt-2 text-center">
                <span className="inline-block rounded-full bg-surface-2 px-3 py-1 text-[12px] text-ink-3">Owner has left 14 groups.</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="container-x mt-24 md:mt-32">
        <div className="mx-auto max-w-[900px] text-center">
          <div data-reveal>
            <h3 className="t-h1">
              That Is Not a Marketing System. <span className="t-grad">That Is Organised Confusion.</span>
            </h3>
          </div>
          <p data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-lead mx-auto mt-6 max-w-[560px]">
            One business should not need five disconnected partners to grow.
          </p>
        </div>
      </div>
    </section>
  );
}
