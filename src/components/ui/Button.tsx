import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "link";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-display font-semibold tracking-[-0.005em] transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "text-on-accent bg-[linear-gradient(100deg,#00b4ff,#00e5ff)] shadow-[0_10px_30px_-12px_rgb(0_180_255/0.65)] hover:shadow-[0_14px_40px_-12px_rgb(0_200_255/0.8)] hover:-translate-y-px active:translate-y-0",
  secondary:
    "text-ink border border-line-strong bg-glass hover:border-[color:var(--accent)] hover:bg-glass-strong backdrop-blur",
  ghost: "text-ink hover:text-accent-text",
  link: "text-accent-text underline-offset-4 hover:underline !px-0 !h-auto",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[14px]",
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-7 text-[16px]",
};

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      className={`transition-transform duration-200 group-hover/btn:translate-x-0.5 ${className}`}
    >
      <path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayGlyph() {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-full border border-line-strong" aria-hidden="true">
      <svg viewBox="0 0 12 12" width="10" height="10">
        <path d="M3.5 2.2v7.6L9.8 6z" fill="currentColor" />
      </svg>
    </span>
  );
}

type CtaProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  icon?: ReactNode;
  /** Analytics event name; picked up by the global tracker. */
  track?: string;
  trackLabel?: string;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

export function Cta({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = variant !== "ghost",
  icon,
  track,
  trackLabel,
  className = "",
  ...rest
}: CtaProps) {
  return (
    <Link
      href={href}
      data-track={track}
      data-track-label={trackLabel ?? (typeof children === "string" ? children : undefined)}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon}
      <span>{children}</span>
      {arrow ? <Arrow /> : null}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className = "",
  ...rest
}: { variant?: Variant; size?: Size; arrow?: boolean } & ComponentProps<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow ? <Arrow /> : null}
    </button>
  );
}
