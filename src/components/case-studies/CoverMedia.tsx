import Image from "next/image";
import type { CaseStudy } from "@/types/content";
import { CaseCover } from "./CaseCover";
import { primaryCategory } from "./utils";

/**
 * Case study cover. Portrait covers (PDF page renders) are shown whole, as a tilted document on a
 * blurred, tinted backdrop of the same artwork; landscape covers fill the frame; no cover → branded SVG.
 */
export function CoverMedia({ study, sizes, priority = false, className = "cs-card-img" }: { study: CaseStudy; sizes: string; priority?: boolean; className?: string }) {
  const c = study.cover ?? study.featuredImage;
  if (!c?.url) return <CaseCover category={primaryCategory(study)} className={className} />;
  const portrait = (c.height ?? 0) > (c.width ?? 1);
  if (!portrait) return <Image src={c.url} alt={c.alt || ""} fill sizes={sizes} priority={priority} className={`${className} object-cover`} />;
  return (
    <div className="cs-poster">
      <Image src={c.url} alt="" aria-hidden="true" fill sizes="200px" quality={40} className="cs-poster-bg" />
      <span className="cs-poster-tint" aria-hidden="true" />
      <div className="cs-poster-doc" style={{ aspectRatio: `${c.width} / ${c.height}` }}>
        <Image src={c.url} alt={c.alt || ""} fill sizes={sizes} priority={priority} className="cs-poster-img" />
      </div>
    </div>
  );
}
