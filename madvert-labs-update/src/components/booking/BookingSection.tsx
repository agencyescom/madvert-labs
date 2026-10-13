import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Section";
import { GrowthRibbon } from "@/components/visuals/GrowthRibbon";
import { MadvertBookingCalendar } from "./MadvertBookingCalendar";

export type BookingCopy = { eyebrow?: string; title?: string; accent?: string; body?: ReactNode; context?: string };

/** "Partner Up with MADVERT Labs": the booking section placed before the footer on important pages. */
export function BookingSection({
  eyebrow = "Ready When You Are",
  title = "Partner Up with",
  accent = "MADVERT Labs.",
  body = "Tell us where growth is getting stuck. We’ll look at the business, the current system and the next most valuable move.",
  context = "default",
}: BookingCopy) {
  return (
    <section id="book" className="section relative scroll-mt-20 overflow-hidden" aria-labelledby="book-title">
      <div className="booking-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <GrowthRibbon shape="wave" spread={70} className="absolute inset-x-0 top-24 h-[260px] w-full" opacity={0.35} id="book-ribbon" />
      <div className="container-x relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+40px)]">
            <div data-reveal>
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
            <h2 id="book-title" data-reveal style={{ ["--reveal-delay" as string]: 60 }} className="t-h1 mt-6">
              {title} <span className="t-grad">{accent}</span>
            </h2>
            <div data-reveal style={{ ["--reveal-delay" as string]: 120 }} className="t-lead mt-6">
              {body}
            </div>
            <ul data-reveal style={{ ["--reveal-delay" as string]: 180 }} className="mt-8 space-y-2 text-[15px] text-ink-2">
              {["No generic pitch.", "No pressure.", "Just a serious conversation about growth."].map((l) => (
                <li key={l} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" aria-hidden="true" />
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="booking-frame rounded-[28px] p-2 sm:p-3">
            <MadvertBookingCalendar context={context} />
          </div>
        </div>
      </div>
    </section>
  );
}
