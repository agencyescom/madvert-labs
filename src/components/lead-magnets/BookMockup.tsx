import Image from "next/image";
import type { CSSProperties } from "react";
import { ResourceCover } from "@/components/visuals/ResourceCover";
import type { Resource } from "@/types/content";
import "@/styles/vault.css";

/**
 * The official cover artwork presented as a physical book: a real CSS 3D block with spine, page edges,
 * back board and a contact shadow. The artwork itself is only rotated a few degrees, never redrawn.
 */
export function BookMockup({
  resource,
  sizes = "200px",
  priority = false,
  depth = 10,
  className = "",
  shadow = true,
}: {
  resource: Pick<Resource, "title" | "kind" | "category" | "cover" | "artworkPending">;
  sizes?: string;
  priority?: boolean;
  /** Half thickness of the book in px. */
  depth?: number;
  className?: string;
  shadow?: boolean;
}) {
  const hasArt = Boolean(resource.cover && !resource.artworkPending);
  return (
    <div className={`vb ${className}`} style={{ "--vb-t": `${depth}px` } as CSSProperties}>
      <div className="vb-book">
        <div className="vb-back" aria-hidden="true" />
        <div className="vb-pages" aria-hidden="true" />
        <div className="vb-top" aria-hidden="true" />
        <div className="vb-spine" aria-hidden="true" />
        <div className="vb-front">
          {hasArt && resource.cover ? (
            <Image
              src={resource.cover.url}
              alt={resource.cover.alt || `${resource.title} cover`}
              width={resource.cover.width ?? 1086}
              height={resource.cover.height ?? 1448}
              sizes={sizes}
              priority={priority}
            />
          ) : (
            <ResourceCover resource={resource} className="!rounded-none !border-0 !shadow-none" />
          )}
          <span className="vb-hinge" aria-hidden="true" />
          <span className="vb-gloss" aria-hidden="true" />
        </div>
      </div>
      {shadow ? <div className="vb-shadow" aria-hidden="true" /> : null}
    </div>
  );
}
