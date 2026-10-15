import Link from "next/link";
import { Arrow } from "@/components/ui/Button";
import { categoryOf, resourceCategoryLabel } from "@/lib/resource-categories";
import type { Resource } from "@/types/content";
import { BookMockup } from "./BookMockup";
import "@/styles/vault.css";

/** Vault card: always opens the resource's landing page, never the file directly. */
export function ResourceCard({
  r,
  related = false,
  headingLevel = "h3",
  trackLabel,
}: {
  r: Resource;
  related?: boolean;
  headingLevel?: "h2" | "h3" | "p";
  trackLabel?: string;
}) {
  const cat = categoryOf(r);
  const Heading = headingLevel;
  return (
    <Link
      href={`/resources/${r.slug}`}
      data-track="lead_magnet_click"
      data-track-label={trackLabel ?? r.slug}
      data-related-resource={related ? r.slug : undefined}
      className="vt-card vb-hover group/btn"
    >
      <div className="vt-card-art">
        <BookMockup resource={r} sizes="(min-width:1280px) 130px, (min-width:640px) 160px, 120px" depth={6} />
      </div>
      <div className="min-w-0 py-1">
        <span className="vt-pill" data-cat={cat}>
          {resourceCategoryLabel[cat]}
        </span>
        <Heading className="mt-3 font-display text-[17px] font-semibold leading-[1.22] tracking-[-0.01em] text-ink">{r.title}</Heading>
        <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.5] text-ink-3">{r.tagline ?? r.outcome ?? r.description}</p>
        <span className="vt-cta mt-4">
          {r.cardCta ?? "View Resource"} <Arrow />
        </span>
      </div>
    </Link>
  );
}
