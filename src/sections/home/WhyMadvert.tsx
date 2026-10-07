const usps = [
  {
    title: "Advanced Marketers. Not Template Operators.",
    body: ["Every market has different customers, economics and friction.", "We do the thinking before we do the clicking."],
  },
  {
    title: "Growth Partner. Not a Single Service Vendor.",
    body: ["When the problem moves beyond the original scope, we do not look away.", "We follow the bottleneck."],
  },
  {
    title: "One Team Across the Digital Growth Journey.",
    body: ["Branding. Acquisition. Search. Creative. Automation. Technology. Data.", "One strategic direction."],
  },
  {
    title: "Certified Expertise With Real Execution Behind It.",
    body: ["Credentials matter.", "What happens after the certificate matters more."],
  },
  {
    title: "Qualified Opportunities Over Cheap Leads.",
    body: ["A lower CPL means very little if your sales team hates the leads.", "We optimise for business quality, not dashboard applause."],
  },
  {
    title: "Built for What Is Next.",
    body: ["Search changes. Platforms change. AI changes customer behaviour. Technology keeps moving.", "So do we."],
  },
];

export function WhyMadvert() {
  return (
    <section className="section" aria-labelledby="why-title">
      <div className="container-x grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+48px)]">
            <h2 id="why-title" data-reveal className="t-h1">
              One Growth Partner. <span className="t-grad">Fewer Excuses.</span>
            </h2>
          </div>
        </div>
        <ol className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:col-span-8">
          {usps.map((u, i) => (
            <li key={u.title} data-reveal style={{ ["--reveal-delay" as string]: (i % 2) * 90 }} className="border-t border-line py-9">
              <span className="font-display text-[13px] font-semibold text-accent-text">0{i + 1}</span>
              <h3 className="t-h3 mt-4">{u.title}</h3>
              <div className="mt-4 space-y-1.5 text-[16px] text-ink-2">
                {u.body.map((b) => (
                  <p key={b}>{b}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="container-x mt-20">
        <p data-reveal className="t-h2 mx-auto max-w-[920px] text-center">
          Hire Madvert Once. <span className="t-grad">Stop Building Your Marketing Department From Five Different WhatsApp Chats.</span>
        </p>
      </div>
    </section>
  );
}
