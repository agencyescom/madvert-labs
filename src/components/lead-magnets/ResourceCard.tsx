import Link from "next/link";
import { Arrow } from "@/components/ui/Button";
import type { Resource } from "@/types/content";
import { LeadMagnetCover } from "./LeadMagnetCover";

/** Vault card: always opens the resource's landing page, never the file directly. */
export function ResourceCard({ r, related = false }: { r: Resource; related?: boolean }) {
  return (
    <Link
      href={`/resources/${r.slug}`}
      data-track="lead_magnet_click"
      data-track-label={r.slug}
      data-related-resource={related ? r.slug : undefined}
      className="vault-card group/btn block h-full rounded-[24px] border border-line bg-[var(--surface-card)] p-4 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5 hover:border-[rgb(0_200_255/0.35)] hover:shadow-[0_30px_60px_-30px_rgb(0_150_220/0.45)]"
    >
      <div className="overflow-hidden rounded-[14px] bg-bg-2 p-5">
        <div className="mx-auto max-w-[220px] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover/btn:-translate-y-1 group-hover/btn:rotate-[-1.5deg]">
          <LeadMagnetCover resource={r} size="sm" interactive={false} />
        </div>
      </div>
      <div className="px-1 pb-1 pt-5">
        <p className="t-label !text-[10.5px]">{r.badge ?? r.kind}</p>
        <p className="mt-2 font-display text-[17px] font-semibold leading-snug text-ink">{r.title}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-3">{r.outcome ?? r.description}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-accent-text">
          {r.cardCta ?? "Get the Guide"} <Arrow />
        </span>
      </div>
    </Link>
  );
}
