import { ArrowRight, CalendarCheck } from "lucide-react";
import { track } from "@/lib/analytics";
import { BOOK_HREF } from "@/lib/site";
import { Reveal } from "./motion";

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "left",
  className = "",
  titleClassName = "",
  id,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  id?: string;
}) {
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}>
      {eyebrow && (
        <Reveal>
          <p className={`eyebrow ${center ? "justify-center" : ""}`}>{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 id={id} className={`display h2 mt-4 ${titleClassName}`}>
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.12}>
          <p className={`lead mt-5 ${center ? "mx-auto" : ""} max-w-2xl`}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Primary CTA. The page's single conversion goal is a booked discovery call. */
export function ApplyButton({
  children = "Book My Discovery Call",
  className = "",
  size,
  onClick,
  href = BOOK_HREF,
}: {
  children?: React.ReactNode;
  className?: string;
  size?: "sm";
  onClick?: () => void;
  href?: string;
}) {
  return (
    <a href={href} onClick={onClick} className={`btn btn-primary ${size === "sm" ? "btn-sm" : ""} ${className}`}>
      <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
      <ArrowRight className="arrow h-4 w-4 shrink-0" aria-hidden />
    </a>
  );
}

/** Every "Book a Call" control scrolls to the booking section (#book-call) on this page. */
export function BookCallButton({
  children = "Book a Call",
  className = "",
  size,
  variant = "secondary",
  location,
}: {
  children?: React.ReactNode;
  className?: string;
  size?: "sm";
  variant?: "primary" | "secondary";
  location: string;
}) {
  return (
    <a
      href={BOOK_HREF}
      onClick={() => track("BookCallCTA", { location })}
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-secondary"} ${size === "sm" ? "btn-sm" : ""} ${className}`}
    >
      <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </a>
  );
}

/** Small "DEMO / ILLUSTRATIVE" label used wherever sample figures appear. */
export function DemoTag({ children = "Demo data" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-line-strong px-2 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-subtle">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
      {children}
    </span>
  );
}

export function RFQs() {
  return (
    <>
      RFQ<span className="normal-case">s</span>
    </>
  );
}
