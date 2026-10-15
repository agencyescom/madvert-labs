import Link from "next/link";
import { Arrow } from "@/components/ui/Button";
import type { Resource } from "@/types/content";
import { BookMockup } from "./BookMockup";
import "@/styles/vault.css";

const icons = [
  // frameworks
  <path key="a" d="M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l3 16M15 4l-3 16" />,
  // worksheets
  <path key="b" d="M7 3h7l5 5v13H7zM14 3v5h5M10 12h6M10 16h6" />,
  // examples
  <path key="c" d="M5 20V12M10 20V8M15 20v-6M20 20V5" />,
  // scale
  <path key="d" d="M13 2 5 13h6l-1 9 8-11h-6z" />,
];

/** Splits "Build That Offer, Then Retire" so the second half carries the accent. */
function splitTitle(t: string) {
  const m = t.match(/^(.+?[,.])\s+(.+)$/);
  return m ? [m[1].replace(/,$/, ""), m[2]] : [t, ""];
}

/** The Vault's single spotlight resource: dark premium panel, book on a lit podium, value points and one CTA. */
export function FeaturedResource({
  r,
  compact = false,
  wide = false,
  headingLevel = "h2",
}: {
  r: Resource;
  compact?: boolean;
  /** Full container width: value points get their own column on large screens. */
  wide?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const [a, b] = splitTitle(r.title);
  const H = headingLevel;
  const points = r.highlights?.slice(0, 4) ?? [];
  return (
    <article className={`vt-feature grid grid-cols-1 items-center gap-6 p-6 sm:p-9 ${compact ? "md:grid-cols-[1.05fr_1fr]" : wide ? "md:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.15fr_1fr_0.62fr]" : "md:grid-cols-[1.1fr_1fr]"}`} aria-label="Featured resource">
      <div className="order-2 md:order-1">
        <span className="vt-feature-badge">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z" fill="currentColor" />
          </svg>
          Featured Resource
        </span>
        <H className={`vt-feature-title mt-5 font-display font-extrabold uppercase leading-[0.95] tracking-[-0.02em] ${compact ? "text-[clamp(28px,3.2vw,40px)]" : "text-[clamp(32px,3.6vw,50px)]"}`}>
          {a}
          {b ? (
            <>
              {" "}
              <span className="accent block">{b}</span>
            </>
          ) : null}
        </H>
        <p className="mt-4 max-w-[40ch] text-[15.5px] leading-relaxed text-[#bccbe0]">{r.tagline ?? r.outcome}</p>
        {!compact ? (
          <ul className="mt-5 space-y-2 text-[14px] text-[#d5e3f3]">
            {r.outline.slice(0, 3).map((o) => (
              <li key={o} className="flex gap-2.5">
                <svg viewBox="0 0 16 16" width="16" height="16" className="mt-0.5 shrink-0 text-[#3fd4ff]" aria-hidden="true">
                  <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {o}
              </li>
            ))}
          </ul>
        ) : null}
        <Link
          href={`/resources/${r.slug}`}
          data-track="lead_magnet_click"
          data-track-label={`featured_${r.slug}`}
          className="vt-cta group/btn mt-7"
        >
          {r.cardCta ?? "Download Free"} <Arrow />
        </Link>
      </div>
      <Link href={`/resources/${r.slug}`} tabIndex={-1} aria-hidden="true" className="vb-hover order-1 mx-auto block w-full max-w-[300px] md:order-2 md:max-w-[340px]">
        <div className="vt-stage">
          <div className="vt-stage-glow" aria-hidden="true" />
          <div className="vt-podium" aria-hidden="true">
            <span className="vt-podium-ring" />
          </div>
          <div className="vt-float">
            <BookMockup resource={r} sizes="(min-width:768px) 220px, 180px" depth={11} priority={!compact} />
          </div>
        </div>
      </Link>
      {points.length && !compact ? (
        <ul className={`order-3 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 md:col-span-2 md:grid-cols-4 ${wide ? "xl:col-span-1 xl:grid-cols-1 xl:gap-5 xl:border-0 xl:pt-0" : ""}`}>
          {points.map((p, i) => (
            <li key={p} className="vt-feature-tile">
              <span>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {icons[i % icons.length]}
                </svg>
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
