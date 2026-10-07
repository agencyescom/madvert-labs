import { Cta } from "@/components/ui/Button";

export const originChain = [
  ["A campaign would bring leads.", ""],
  ["Then we would notice the landing page was weak.", "We fixed it."],
  ["Then we saw the follow up was slow.", "We improved it."],
  ["Then we realised the CRM was missing.", "We built the system."],
  ["Then the team needed better tracking.", ""],
  ["Then automation.", ""],
  ["Then a custom tool.", ""],
  ["Then technology.", ""],
] as const;

export function AboutTeaser() {
  return (
    <section className="section" aria-labelledby="about-teaser-title">
      <div className="container-x grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 id="about-teaser-title" data-reveal className="t-h1">
            We Started With Marketing. <span className="t-grad">Then We Kept Finding Bigger Problems.</span>
          </h2>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <ol className="relative border-l border-line pl-8">
            {originChain.map(([a, b], i) => (
              <li key={a} data-reveal style={{ ["--reveal-delay" as string]: i * 60 }} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[37px] top-[9px] h-[9px] w-[9px] rounded-full border border-[#00e5ff] bg-bg" aria-hidden="true" />
                <p className="text-[17px] text-ink">{a}</p>
                {b ? <p className="mt-0.5 text-[15px] text-accent-text">{b}</p> : null}
              </li>
            ))}
          </ol>
          <div data-reveal className="mt-12 border-t border-line pt-10">
            <p className="t-h2">Businesses Rarely Have One Marketing Problem.</p>
            <p className="t-lead mt-3">They have connected problems.</p>
            <div className="mt-8">
              <Cta href="/about" variant="secondary">
                Read Our Story
              </Cta>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
