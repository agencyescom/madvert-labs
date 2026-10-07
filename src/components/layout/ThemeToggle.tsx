"use client";

import { useEffect } from "react";
import { THEME_KEY } from "@/lib/theme";
import { track } from "@/analytics/track";

function current(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function apply(theme: "light" | "dark") {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
}

export function ThemeToggle({ className = "", withLabel = false, compact = false }: { className?: string; withLabel?: boolean; compact?: boolean }) {
  // Follow the OS preference live until the visitor makes a manual choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      try {
        if (localStorage.getItem(THEME_KEY)) return;
      } catch {}
      apply(mq.matches ? "light" : "dark");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = current() === "dark" ? "light" : "dark";
    apply(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    track("theme_switch", { theme: next });
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Switch between light and dark theme"
        title="Switch theme"
        className={`grid h-10 w-10 place-items-center rounded-full border border-line bg-glass text-ink transition-colors hover:border-line-strong ${className}`}
      >
        <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true" className="dark:hidden">
          <path d="M15.8 12.6A6.6 6.6 0 0 1 7.4 4.2a6.6 6.6 0 1 0 8.4 8.4z" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true" className="hidden dark:block">
          <circle cx="10" cy="10" r="3.6" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
          </g>
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={`group relative inline-flex h-10 items-center gap-2.5 rounded-full border border-line bg-glass px-1 text-ink-2 transition-colors duration-200 hover:border-line-strong hover:text-ink ${className}`}
    >
      <span className="relative flex h-8 w-[60px] items-center rounded-full">
        <span className="absolute left-0 top-0 h-8 w-8 rounded-full bg-[linear-gradient(140deg,#00b4ff,#00e5ff)] shadow-[0_4px_14px_-4px_rgb(0_180_255/0.7)] transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] dark:translate-x-7" />
        {/* sun */}
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" className="relative z-10 ml-2 text-on-accent dark:text-ink-3">
          <circle cx="10" cy="10" r="3.6" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
          </g>
        </svg>
        {/* moon */}
        <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" className="relative z-10 ml-auto mr-2 text-ink-3 dark:text-on-accent">
          <path d="M15.8 12.6A6.6 6.6 0 0 1 7.4 4.2a6.6 6.6 0 1 0 8.4 8.4z" fill="currentColor" />
        </svg>
      </span>
      {withLabel ? (
        <span className="pr-3 text-[14px] font-medium">
          <span className="dark:hidden">Light mode</span>
          <span className="hidden dark:inline">Dark mode</span>
        </span>
      ) : null}
    </button>
  );
}
