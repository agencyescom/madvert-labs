"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { BOOK_HREF } from "@/lib/site";
import { BOOKING_SECTION_IDS } from "./BookingContext";

/**
 * Persistent "Book My Discovery Call" CTA for paid traffic. Phones get a full-width bottom bar,
 * larger screens a large floating button. It hides only while a booking section is on screen,
 * so it never covers the form or calendar. Clicks go to the nearest booking section.
 */
export function StickyBookCTA() {
  const [scrolled, setScrolled] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        setBookingVisible(visible.size > 0);
      },
      { threshold: 0.08 },
    );
    BOOKING_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const show = scrolled && !bookingVisible;
  const onClick = () => track("BookCallCTA", { location: "sticky" });

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Phones */}
          <motion.div
            key="bar"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[var(--nav-bg)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <a href={BOOK_HREF} onClick={onClick} className="btn btn-primary cta-glow w-full !min-h-[3.75rem] !text-[1.05rem]">
              <CalendarCheck className="h-5 w-5" aria-hidden /> Book My Discovery Call
            </a>
            <p className="mt-1.5 text-center text-[0.68rem] text-subtle">Founding beta · $15 per accepted qualified RFQ · ad spend included</p>
          </motion.div>
          {/* Tablet & desktop */}
          <motion.a
            key="pill"
            href={BOOK_HREF}
            onClick={onClick}
            className="btn btn-primary cta-glow fixed bottom-7 right-7 z-40 hidden !min-h-[4.25rem] !gap-3 !rounded-full !px-9 !text-[1.15rem] !font-extrabold shadow-lg md:inline-flex"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <CalendarCheck className="h-6 w-6" aria-hidden /> Book My Discovery Call
            <ArrowRight className="arrow h-5 w-5" aria-hidden />
          </motion.a>
        </>
      )}
    </AnimatePresence>
  );
}
