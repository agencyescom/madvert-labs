import { Cta } from "@/components/ui/Button";
import { GrowthRibbon } from "@/components/visuals/GrowthRibbon";
import type { ReactNode } from "react";

export function FinalCta({
  title,
  accent,
  children,
  primary,
  secondary,
  micro,
  track = "strategy_call_click",
}: {
  title: string;
  accent?: string;
  children?: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string; track?: string };
  micro?: string;
  track?: string;
}) {
  return (
    <section className="section relative overflow-hidden" aria-labelledby="final-cta-title">
      <div className="bg-aura pointer-events-none absolute inset-0" aria-hidden="true" />
      <GrowthRibbon shape="wave" spread={90} className="absolute inset-x-0 top-1/2 h-[340px] w-full -translate-y-1/2" opacity={0.45} id="final-ribbon" />
      <div className="container-x relative">
        <div className="panel mx-auto max-w-[980px] !bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-6 py-16 text-center sm:px-12 md:py-24">
          <h2 id="final-cta-title" data-reveal className="t-h1 mx-auto max-w-[820px]">
            {title} {accent ? <span className="t-grad">{accent}</span> : null}
          </h2>
          {children ? (
            <div data-reveal style={{ ["--reveal-delay" as string]: 100 }} className="t-lead mx-auto mt-7 max-w-[560px]">
              {children}
            </div>
          ) : null}
          <div data-reveal style={{ ["--reveal-delay" as string]: 180 }} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
            <Cta href={primary.href} size="lg" track={track} trackLabel={primary.label} className="!whitespace-normal text-center">
              {primary.label}
            </Cta>
            {secondary ? (
              <Cta href={secondary.href} size="lg" variant="secondary" track={secondary.track ?? "free_value_click"} className="!whitespace-normal text-center">
                {secondary.label}
              </Cta>
            ) : null}
          </div>
          {micro ? <p className="t-small mt-7">{micro}</p> : null}
        </div>
      </div>
    </section>
  );
}
