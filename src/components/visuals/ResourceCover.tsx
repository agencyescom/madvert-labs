import { MadvertMark } from "@/components/ui/MadvertMark";
import type { Resource } from "@/types/content";

const tints: Record<Resource["category"], string> = {
  acquire: "#00b4ff",
  convert: "#2dd4bf",
  search: "#38bdf8",
  brand: "#a78bfa",
  automate: "#00e5ff",
  build: "#34d399",
};

/** A premium digital report cover rendered in CSS, used until real cover art is uploaded to the CMS. */
export function ResourceCover({ resource, className = "" }: { resource: Pick<Resource, "title" | "kind" | "category">; className?: string }) {
  const tint = tints[resource.category];
  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden rounded-[18px] border border-white/10 bg-[#0b1222] p-5 text-white shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.08)] ${className}`}
    >
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 70% at 85% 0%, ${tint}40, transparent 60%)` }} aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "linear-gradient(rgb(255 255 255 / .04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .04) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden="true"
      />
      <svg viewBox="0 0 300 400" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M-10 330 C 80 360, 120 250, 170 250 S 250 150, 320 110" fill="none" stroke={tint} strokeWidth="1.5" opacity="0.8" />
        <path d="M-10 342 C 80 372, 120 262, 170 262 S 250 162, 320 122" fill="none" stroke={tint} strokeWidth="1" opacity="0.35" />
      </svg>
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent" aria-hidden="true" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <span className="font-display text-[9.5px] font-semibold uppercase tracking-[0.22em]" style={{ color: tint }}>
            {resource.kind}
          </span>
          <MadvertMark className="h-3 w-auto text-white/80" />
        </div>
        <p className="mt-auto font-display text-[19px] font-semibold leading-[1.15] tracking-tight">{resource.title}</p>
        <p className="mt-3 font-display text-[9px] uppercase tracking-[0.24em] text-white/50">Madvert Vault</p>
      </div>
    </div>
  );
}
