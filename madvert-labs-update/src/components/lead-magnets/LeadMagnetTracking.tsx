"use client";

import { useEffect } from "react";
import { trackLeadMagnet } from "@/analytics/track";

/** Fires lead_magnet_view once per landing page view, and tracks related resource clicks. */
export function LeadMagnetTracking({ name }: { name: string }) {
  useEffect(() => {
    trackLeadMagnet("lead_magnet_view", name);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-related-resource]");
      if (a) trackLeadMagnet("lead_magnet_related_resource_click", name, { related: a.dataset.relatedResource });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [name]);
  return null;
}
