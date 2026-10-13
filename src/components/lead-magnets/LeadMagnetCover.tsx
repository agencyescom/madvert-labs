"use client";

import Image from "next/image";
import { useRef } from "react";
import { ResourceCover } from "@/components/visuals/ResourceCover";
import type { Resource } from "@/types/content";

/**
 * Official lead magnet artwork presented as a premium printed guide: page thickness, soft cyan rim light,
 * a slow float and a light sweep. Desktop pointers get a very slight perspective response; the artwork itself
 * is never distorted beyond a few degrees.
 */
export function LeadMagnetCover({
  resource,
  priority = false,
  size = "lg",
  interactive = true,
}: {
  resource: Pick<Resource, "title" | "kind" | "category" | "cover" | "artworkPending">;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (!interactive || e.pointerType !== "mouse" || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
    ref.current.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };
  const sizes = size === "lg" ? "(min-width:1024px) 440px, 80vw" : size === "md" ? "320px" : "240px";

  return (
    <div className={`lm-cover-stage ${interactive ? "lm-float" : ""}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={ref} className="lm-cover relative">
        <div className="lm-cover-glow" aria-hidden="true" />
        <div className="lm-cover-pages" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-[10px] shadow-[0_40px_80px_-30px_rgb(0_20_60/0.55)]">
          {resource.cover && !resource.artworkPending ? (
            <Image
              src={resource.cover.url}
              alt={resource.cover.alt || resource.title}
              width={resource.cover.width ?? 1086}
              height={resource.cover.height ?? 1448}
              priority={priority}
              sizes={sizes}
              className="block h-auto w-full"
            />
          ) : (
            <ResourceCover resource={resource} className="!rounded-[10px]" />
          )}
          <div className="lm-cover-sheen" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
