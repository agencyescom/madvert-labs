"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { scrollToSection } from "@/lib/scroll";

/** The booking section appears twice on the page: under the hero and near the end. */
export const BOOKING_SECTION_IDS = ["book-call", "book-call-2"] as const;
export type BookingInstance = (typeof BOOKING_SECTION_IDS)[number];

type Contact = { name: string; email: string; business: string };
type Ctx = {
  /** The visitor's details were saved, so the calendar can be shown. */
  saved: Contact | null;
  /** Which booking section shows the calendar (only one loads it). */
  calendarIn: BookingInstance | null;
  markSaved: (c: Contact, where: BookingInstance) => void;
  showCalendarIn: (where: BookingInstance) => void;
};

const BookingCtx = createContext<Ctx>({ saved: null, calendarIn: null, markSaved: () => {}, showCalendarIn: () => {} });

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<Contact | null>(null);
  const [calendarIn, setCalendarIn] = useState<BookingInstance | null>(null);
  const markSaved = useCallback((c: Contact, where: BookingInstance) => {
    setSaved(c);
    setCalendarIn(where);
  }, []);
  return <BookingCtx.Provider value={{ saved, calendarIn, markSaved, showCalendarIn: setCalendarIn }}>{children}</BookingCtx.Provider>;
}

export const useBooking = () => useContext(BookingCtx);

/** The booking section closest to where the visitor is now. */
export function nearestBookingId(): BookingInstance {
  let best: BookingInstance = BOOKING_SECTION_IDS[0];
  let bestDist = Infinity;
  for (const id of BOOKING_SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const d = Math.abs(el.getBoundingClientRect().top);
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return best;
}

export function scrollToBooking(id: BookingInstance = nearestBookingId()) {
  scrollToSection(id);
}
