import type { ReactNode } from "react";
import Link from "next/link";
import { Arrow, Cta } from "@/components/ui/Button";
import { Glyph, type IconName } from "@/components/ui/Icon3D";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResourceCover } from "@/components/visuals/ResourceCover";
import { schema } from "@/lib/seo";
import type { Faq, Resource } from "@/types/content";

/** One large statement with a short cascade of supporting lines. */
export function Statement({
  title,
  accent,
  lines,
  closing,
  center = false,
  id,
  children,
}: {
  title: string;
  accent?: string;
  lines?: string[];
  closing?: ReactNode;
  center?: boolean;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="section">
      <div className={`container-x ${center ? "text-center" : ""}`}>
        <div className={`${center ? "mx-auto" : ""} max-w-[880px]`}>
          <h2 data-reveal className="t-h1">
            {title} {accent ? <span className="t-grad">{accent}</span> : null}
          </h2>
          {lines?.length ? (
            <div className={`mt-9 space-y-1.5 text-[18px] text-ink-2 ${center ? "mx-auto max-w-[560px]" : "max-w-[620px]"}`}>
              {lines.map((l, i) => (
                <p key={i} data-reveal style={{ ["--reveal-delay" as string]: 60 + i * 50 }}>
                  {l}
                </p>
              ))}
            </div>
          ) : null}
          {closing ? (
            <div data-reveal className={`t-h3 mt-9 ${center ? "mx-auto max-w-[640px]" : "max-w-[640px]"}`}>
              {closing}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** A capability area: headline, optional support line, capability list, optional visual. */
export function Capability({
  id,
  index,
  label,
  title,
  support,
  items,
  icon,
  visual,
  flip = false,
  cta,
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  support?: ReactNode;
  items?: { name: string; icon?: IconName }[];
  icon?: IconName;
  visual?: ReactNode;
  flip?: boolean;
  cta?: { label: string; href: string };
}) {
  const eyebrow = (
    <p data-reveal className="flex items-center gap-3 font-display text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-3">
      <span className="text-accent-text">{index}</span>
      <span className="h-px w-6 bg-[var(--line-strong)]" />
      {label}
    </p>
  );
  const heading = (
    <h2 id={`${id}-title`} data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h2 mt-6">
      {title}
    </h2>
  );
  const supportEl = support ? (
    <div data-reveal style={{ ["--reveal-delay" as string]: 110 }} className="t-lead max-w-[540px]">
      {support}
    </div>
  ) : null;
  const itemsEl = items?.length ? (
    <ul data-reveal style={{ ["--reveal-delay" as string]: 160 }} className="grid max-w-[560px] grid-cols-1 gap-2.5 sm:grid-cols-2">
      {items.map((it) => (
        <li key={it.name} className="flex items-center gap-3 rounded-xl border border-line bg-glass px-3.5 py-3 text-[14.5px] text-ink">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-bg">
            <Glyph name={it.icon ?? icon ?? "systems"} size={18} />
          </span>
          {it.name}
        </li>
      ))}
    </ul>
  ) : null;
  const ctaEl = cta ? (
    <div data-reveal>
      <Cta href={cta.href} variant="secondary" track="service_cta_click">
        {cta.label}
      </Cta>
    </div>
  ) : null;

  let body: ReactNode;
  if (visual) {
    body = (
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className={`lg:col-span-6 ${flip ? "lg:order-2 lg:col-start-7" : ""}`}>
          {eyebrow}
          {heading}
          <div className="mt-6 space-y-8">
            {supportEl}
            {itemsEl}
            {ctaEl}
          </div>
        </div>
        <div data-reveal="fade" className={`lg:col-span-6 ${flip ? "lg:order-1" : "lg:col-start-7"}`}>
          {visual}
        </div>
      </div>
    );
  } else if (itemsEl || supportEl) {
    // No visual: headline on one side, substance on the other, so the row stays balanced.
    body = (
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {eyebrow}
          {heading}
        </div>
        <div className="space-y-8 lg:col-span-6 lg:col-start-7 lg:pt-12">
          {supportEl}
          {itemsEl}
          {ctaEl}
        </div>
      </div>
    );
  } else {
    // Headline only: an editorial statement row.
    body = (
      <div className="grid grid-cols-1 items-baseline gap-6 lg:grid-cols-12">
        <div className="lg:col-span-3">{eyebrow}</div>
        <h2 id={`${id}-title`} data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h2 lg:col-span-9">
          {title}
        </h2>
      </div>
    );
  }

  const compact = !visual && !itemsEl && !supportEl;
  return (
    <section id={id} className={`${compact ? "py-10 md:py-14" : "section-tight"} scroll-mt-24`} aria-labelledby={`${id}-title`}>
      <div className="container-x">
        <div className={`hairline ${compact ? "mb-10 md:mb-14" : "mb-16 md:mb-20"}`} />
        {body}
      </div>
    </section>
  );
}

export function FreeValue({
  title,
  label,
  href,
  resource,
  body,
}: {
  title: string;
  label: string;
  href: string;
  resource?: Pick<Resource, "title" | "kind" | "category">;
  body?: string;
}) {
  return (
    <section className="section-tight" aria-labelledby="free-value-title">
      <div className="container-x">
        <div className="panel grid grid-cols-1 items-center gap-10 overflow-hidden p-8 sm:p-12 md:grid-cols-12 lg:p-16">
          <div className="md:col-span-7">
            <p data-reveal className="t-eyebrow">Free value</p>
            <h2 id="free-value-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h1 mt-5 !text-[clamp(30px,3.4vw,48px)]">
              {title}
            </h2>
            {body ? (
              <p data-reveal className="t-lead mt-5 max-w-[520px]">
                {body}
              </p>
            ) : null}
            <div data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="mt-9">
              <Cta href={href} track="free_value_click" trackLabel={label}>
                {label}
              </Cta>
            </div>
          </div>
          {resource ? (
            <div data-reveal="fade" className="md:col-span-4 md:col-start-9">
              <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
                <ResourceCover resource={resource} className="mx-auto max-w-[260px] rotate-[-3deg] transition-transform duration-500 hover:rotate-0" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** AEO: a concise "at a glance" answer block followed by real FAQs with FAQPage schema. */
export function AnswerBlock({
  service,
  glance,
  faqs,
}: {
  service: string;
  glance: { label: string; value: string }[];
  faqs: Faq[];
}) {
  return (
    <section className="section-tight" aria-labelledby="answers-title">
      <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 id="answers-title" data-reveal className="t-h2">
            {service}, <span className="t-grad">answered directly.</span>
          </h2>
          <dl data-reveal style={{ ["--reveal-delay" as string]: 80 }} className="mt-9 divide-y divide-[color:var(--line)] border-y border-line">
            {glance.map((g) => (
              <div key={g.label} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-4">
                <dt className="font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">{g.label}</dt>
                <dd className="text-[15.5px] text-ink-2">{g.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="t-label">Frequently asked</p>
          <div className="mt-5 divide-y divide-[color:var(--line)] border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-1" data-reveal>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-display text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ink-3 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="pb-5 pr-10 text-[15.5px] leading-relaxed text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
      {faqs.length ? <JsonLd data={schema.faq(faqs)} /> : null}
    </section>
  );
}

export function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group/btn inline-flex items-center gap-2 font-medium text-accent-text">
      {children}
      <Arrow />
    </Link>
  );
}
