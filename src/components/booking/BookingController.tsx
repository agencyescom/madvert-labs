"use client";

import { useEffect, useRef, useState } from "react";
import { MadvertBookingCalendar } from "./MadvertBookingCalendar";

function isBookingLink(el: HTMLElement) {
  if (el.hasAttribute("data-open-booking")) return true;
  const href = el.getAttribute("href") ?? "";
  return href === "#book" || href.endsWith("/contact#book");
}

/**
 * Every booking CTA goes to the same experience: smooth scroll to the page's #book section when it exists,
 * otherwise a modal (desktop) / full screen sheet (mobile) with the same calendar.
 */
export function BookingController() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
      const el = (ev.target as HTMLElement | null)?.closest<HTMLElement>("a,[data-open-booking]");
      if (!el || !isBookingLink(el)) return;
      // Capture phase: runs before Next.js <Link>, which skips navigation when defaultPrevented.
      // (No stopPropagation, so CTA click tracking still fires.)
      ev.preventDefault();
      const section = document.getElementById("book");
      if (section) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", "#book");
        return;
      }
      lastFocus.current = el;
      setOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      lastFocus.current?.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Book a Business Strategy Call">
      <button type="button" aria-label="Close" className="anim-fade absolute inset-0 cursor-default bg-[rgb(5_9_18/0.72)] backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="anim-menu relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--surface-solid)] sm:h-[min(92vh,980px)] sm:max-w-[920px] sm:rounded-[28px] sm:border sm:border-line-strong sm:shadow-[0_40px_120px_-30px_rgb(0_0_0/0.6)]">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
          <div>
            <p className="t-eyebrow !text-[11px]">Partner Up with MADVERT Labs</p>
            <p className="mt-1 font-display text-[18px] font-semibold">Book Your Business Strategy Call</p>
          </div>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink" aria-label="Close booking">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5">
          <MadvertBookingCalendar context="modal" eager />
        </div>
      </div>
    </div>
  );
}
