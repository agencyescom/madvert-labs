import { Check, Minus } from "lucide-react";
import { Reveal } from "../ui/motion";

const GOOD = [
  "You already manufacture or reliably fulfill custom patches.",
  "You actively serve U.S. customers.",
  "You have spare production capacity.",
  "Your sales team can quote quickly.",
  "You have proven fulfillment.",
  "You have sufficient margins.",
  "You can respond to RFQs professionally.",
  "You want consistent inbound opportunities.",
  "You can support meaningful recurring volume.",
];
const NOT = [
  "You are just starting.",
  "You have no production capacity.",
  "You cannot quote customers quickly.",
  "You only want 2–3 leads occasionally.",
  "Your margins cannot support customer acquisition.",
  "You expect Madvert Labs to guarantee sales.",
  "You cannot handle U.S. customers reliably.",
];

export function IdealPartner() {
  return (
    <section id="who-its-for" aria-labelledby="fit-title" className="section-y relative border-t border-line bg-bg-2">
      <div className="container-x">
        <div className="max-w-4xl">
          <Reveal>
            <p className="eyebrow">Who it&rsquo;s for</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="fit-title" className="display h2 mt-4">
              Built for patch businesses that can <span className="text-grad">actually handle more orders.</span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal className="card border-[var(--accent-line)] p-6 shadow-md sm:p-8">
            <p className="flex items-center gap-2.5 text-lg font-extrabold uppercase">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-grad text-navy">
                <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
              </span>
              Good fit
            </p>
            <ul className="mt-6 grid gap-3">
              {GOOD.map((g) => (
                <li key={g} className="flex items-start gap-3 text-[0.98rem] font-medium leading-snug">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={3} aria-hidden />
                  {g}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="card p-6 sm:p-8">
            <p className="flex items-center gap-2.5 text-lg font-extrabold uppercase text-muted">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-3 text-subtle">
                <Minus className="h-4 w-4" strokeWidth={3} aria-hidden />
              </span>
              Not a fit
            </p>
            <ul className="mt-6 grid gap-3">
              {NOT.map((g) => (
                <li key={g} className="flex items-start gap-3 text-[0.98rem] leading-snug text-muted">
                  <Minus className="mt-0.5 h-4 w-4 shrink-0 text-subtle" strokeWidth={3} aria-hidden />
                  {g}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="mt-14">
          <p className="display mx-auto max-w-4xl text-center text-[clamp(1.35rem,2.6vw,2.1rem)] leading-[1.12]">
            We would rather work with fewer manufacturers who can <span className="text-grad">convert and fulfill demand properly.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
