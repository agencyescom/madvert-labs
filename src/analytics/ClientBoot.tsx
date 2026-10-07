"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "./track";
import type { AnalyticsEvent } from "./events";
import { captureAttribution, rememberCta } from "@/lib/attribution";

/**
 * One small client island that boots site-wide behaviour:
 * reveal observer, CTA click tracking (via data-track attributes), scroll milestones and attribution capture.
 */
export function ClientBoot() {
  const pathname = usePathname();

  // Reveal observer: watches every [data-reveal] node, including ones added after navigation.
  useEffect(() => {
    window.__madvertReady = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const scan = (root: ParentNode) =>
      root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    scan(document);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => n instanceof HTMLElement && scan(n.parentNode ?? n));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  // Attribution + SPA page views on every route change (the first view is sent by the vendor snippets).
  const first = useRef(true);
  useEffect(() => {
    captureAttribution();
    if (first.current) {
      first.current = false;
      return;
    }
    window.gtag?.("event", "page_view", { page_path: pathname, page_location: window.location.href });
    window.fbq?.("track", "PageView");
  }, [pathname]);

  // Click tracking for anything carrying data-track.
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const event = el.dataset.track as AnalyticsEvent;
      const label = el.dataset.trackLabel ?? el.textContent?.trim() ?? "";
      rememberCta(label);
      track(event, { label, page: window.location.pathname, href: el.getAttribute("href") ?? undefined });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Scroll depth milestones per page.
  useEffect(() => {
    const marks = [25, 50, 75, 90];
    const hit = new Set<number>();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max <= 0) return;
        const pct = (window.scrollY / max) * 100;
        for (const m of marks) {
          if (pct >= m && !hit.has(m)) {
            hit.add(m);
            track("scroll_depth", { percent: m, page: pathname });
          }
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
