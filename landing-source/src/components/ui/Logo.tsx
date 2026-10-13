import Image from "next/image";
import { asset } from "@/lib/paths";

/** Wordmark that swaps artwork by theme (no CSS recolouring of the brand asset). */
export function Logo({ className = "h-8 w-auto", forceDark = false }: { className?: string; forceDark?: boolean }) {
  return (
    <span className="inline-flex items-center" aria-label="Madvert Labs">
      {!forceDark && (
        <Image
          src={asset("/brand/logo-on-light-nav.png")}
          alt="Madvert Labs"
          width={1217}
          height={258}
          priority
          className={`${className} dark:hidden`}
        />
      )}
      <Image
        src={asset("/brand/logo-on-dark.png")}
        alt={forceDark ? "Madvert Labs" : ""}
        aria-hidden={!forceDark}
        width={1161}
        height={282}
        priority
        className={`${className} ${forceDark ? "" : "hidden dark:block"}`}
      />
    </span>
  );
}

/** Vector brand mark (open A + dot), theme-aware via currentColor. */
export function Mark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" className={className} aria-hidden>
      <polygon points="31,0 54,0 100,70 79,70 42,12 21,70 0,70" fill="currentColor" />
      <circle cx="42" cy="46" r="9" fill="url(#mlg)" />
      <defs>
        <linearGradient id="mlg" x1="0" x2="1">
          <stop offset="0" stopColor="#00B4FF" />
          <stop offset="1" stopColor="#00E5FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
