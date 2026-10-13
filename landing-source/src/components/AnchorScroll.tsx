"use client";

import { useEffect } from "react";
import { scrollToSection } from "@/lib/scroll";
import { nearestBookingId } from "./BookingContext";

/** Routes every same-page "#section" link through scrollToSection (see src/lib/scroll.ts). */
export function AnchorScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      const id = a?.getAttribute("href")?.slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      // The booking section is on the page twice; go to whichever is closer.
      scrollToSection(id === "book-call" ? nearestBookingId() : id);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
