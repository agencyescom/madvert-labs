"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full border border-line-strong bg-surface-2 p-1 ${className}`}
    >
      <span className="sr-only">Theme</span>
      <Sun className="absolute left-2.5 h-3.5 w-3.5 text-subtle" aria-hidden />
      <Moon className="absolute right-2.5 h-3.5 w-3.5 text-subtle" aria-hidden />
      <motion.span
        className="relative z-10 grid h-7 w-7 place-items-center rounded-full bg-surface shadow-md ring-1 ring-line"
        animate={{ x: dark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
      >
        {dark ? <Moon className="h-3.5 w-3.5 text-accent" aria-hidden /> : <Sun className="h-3.5 w-3.5 text-accent" aria-hidden />}
      </motion.span>
    </button>
  );
}
