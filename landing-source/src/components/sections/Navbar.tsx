"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/site";
import { ThemeToggle } from "../ThemeToggle";
import { Logo } from "../ui/Logo";
import { BookCallButton } from "../ui/primitives";
import { AnnouncementBar } from "./AnnouncementBar";
import { EASE } from "../ui/motion";

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(NAV_LINKS.map((l) => l.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        open
          ? "border-b border-line bg-bg"
          : scrolled
            ? "border-b border-line bg-[var(--nav-bg)] backdrop-blur-xl"
            : "border-b border-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <div
        className="overflow-hidden transition-[height] duration-300"
        style={{ height: scrolled || open ? 0 : "var(--bar-h)" }}
        aria-hidden={scrolled || open}
      >
        <AnnouncementBar />
      </div>
      <nav className="container-x flex h-[68px] items-center justify-between gap-4" aria-label="Primary">
        <a href="#top" className="shrink-0" aria-label="Madvert Labs — back to top" onClick={() => setOpen(false)}>
          <Logo className="h-[26px] w-auto sm:h-7" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.id} className="relative">
              <a
                href={`#${l.id}`}
                className={`relative block rounded-lg px-3.5 py-2 text-[0.88rem] font-medium transition-colors ${
                  active === l.id ? "text-fg" : "text-muted hover:text-fg"
                }`}
                aria-current={active === l.id ? "true" : undefined}
              >
                {l.label}
                {active === l.id && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-grad"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <ThemeToggle className="hidden sm:inline-flex" />
          <BookCallButton size="sm" variant="primary" location="nav" className="hidden sm:inline-flex" />
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl border border-line-strong bg-surface lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[68px] z-40 overflow-y-auto bg-bg lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="container-x flex min-h-full flex-col pb-10 pt-6">
              <ul className="divide-y divide-line border-y border-line">
                {NAV_LINKS.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i + 0.05, ease: EASE }}
                  >
                    <a
                      href={`#${l.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-5 text-2xl font-bold tracking-tight"
                    >
                      {l.label}
                      <ArrowRight className="h-5 w-5 text-subtle" aria-hidden />
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex items-center justify-between rounded-2xl border border-line bg-surface p-4">
                <span className="text-sm font-medium text-muted">Appearance</span>
                <ThemeToggle />
              </div>
              <div className="mt-auto pt-8">
                <p className="mb-3 text-center text-sm text-muted">Founding beta · $15 per accepted qualified RFQ · Ad spend included</p>
                <span onClick={() => setOpen(false)}>
                  <BookCallButton variant="primary" location="nav_mobile" className="w-full">
                    Book My Discovery Call
                  </BookCallButton>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
