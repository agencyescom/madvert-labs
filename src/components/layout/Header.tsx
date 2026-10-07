"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Cta, Arrow } from "@/components/ui/Button";
import { Icon3D } from "@/components/ui/Icon3D";
import { mainNav, services, site, pillars } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const megaId = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMegaOpen(false);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (megaOpen) {
        setMegaOpen(false);
        megaTrigger.current?.focus();
      }
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!megaOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("header")) setMegaOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [megaOpen]);

  const openMega = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }, []);
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 140);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const solid = scrolled || megaOpen;

  return (
    <>
      <a href="#main" className="sr-only-focusable fixed left-4 top-3 z-[80] rounded-full bg-surface px-4 py-2 text-sm text-ink">
        Skip to content
      </a>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300"
        style={{
          backgroundColor: solid ? "var(--header-bg)" : "transparent",
          backdropFilter: solid ? "blur(18px) saturate(1.4)" : "none",
          WebkitBackdropFilter: solid ? "blur(18px) saturate(1.4)" : "none",
          borderBottom: `1px solid ${solid ? "var(--line)" : "transparent"}`,
        }}
        onMouseLeave={scheduleClose}
      >
        <div
          className="container-x flex items-center justify-between gap-6 transition-[height] duration-300"
          style={{ height: scrolled ? 64 : 76 }}
        >
          <div className="shrink-0">
            <Logo height={scrolled ? 26 : 30} priority className="transition-[height] duration-300" />
          </div>

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {mainNav.map((item) =>
                "mega" in item && item.mega ? (
                  <li key={item.href} onMouseEnter={openMega}>
                    <button
                      ref={megaTrigger}
                      type="button"
                      aria-expanded={megaOpen}
                      aria-controls={megaId}
                      onClick={(e) => setMegaOpen((v) => (e.detail === 0 ? !v : true))}
                      className={`relative flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[14px] font-medium transition-colors 2xl:px-3.5 2xl:text-[14.5px] ${
                        isActive("/services") || megaOpen ? "text-ink" : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      {item.label}
                      <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}>
                        <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {isActive("/services") ? <ActiveDot /> : null}
                    </button>
                  </li>
                ) : (
                  <li key={item.href} onMouseEnter={scheduleClose}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={`relative flex h-10 items-center whitespace-nowrap rounded-full px-3 text-[14px] font-medium transition-colors 2xl:px-3.5 2xl:text-[14.5px] ${
                        isActive(item.href) ? "text-ink" : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      {item.label}
                      {isActive(item.href) ? <ActiveDot /> : null}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <div className="sm:hidden">
              <ThemeToggle compact />
            </div>
            <div className="hidden md:block">
              <Cta href={site.shortCta.href} size="sm" track="strategy_call_click" trackLabel="header_cta">
                {site.shortCta.label}
              </Cta>
            </div>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-glass xl:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="relative block h-3 w-4" aria-hidden="true">
                <span className={`absolute left-0 h-[1.6px] w-4 rounded bg-ink transition-all duration-300 ${mobileOpen ? "top-[5px] rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 top-[5px] h-[1.6px] w-4 rounded bg-ink transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`absolute left-0 h-[1.6px] w-4 rounded bg-ink transition-all duration-300 ${mobileOpen ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mega menu */}
        {megaOpen ? (
            <div
              id={megaId}
              onMouseEnter={openMega}
              className="anim-menu absolute inset-x-0 top-full hidden border-b border-line xl:block"
              style={{ backgroundColor: "var(--header-bg)", backdropFilter: "blur(22px) saturate(1.4)", WebkitBackdropFilter: "blur(22px) saturate(1.4)" }}
            >
              <div className="container-x grid grid-cols-12 gap-8 py-9">
                <div className="col-span-3 border-r border-line pr-8">
                  <p className="t-label">What we do</p>
                  <p className="t-h3 mt-4">Everything between attention and revenue. Connected.</p>
                  <Link href="/services" className="group/btn mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-accent-text">
                    See how Madvert works <Arrow />
                  </Link>
                </div>
                <ul className="col-span-9 grid grid-cols-3 gap-x-6 gap-y-2">
                  {services.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        data-track="service_cta_click"
                        data-track-label={`mega_${s.key}`}
                        className="group/btn flex items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-glass-strong"
                      >
                        <Icon3D name={s.icon} size="sm" />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
                            {s.title}
                            <Arrow className="opacity-0 transition-opacity group-hover/btn:opacity-100" />
                          </span>
                          <span className="mt-1 block text-[13.5px] leading-snug text-ink-3">{s.summary}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/studios" className="group/btn flex items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-glass-strong">
                      <Icon3D name="studios" size="sm" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
                          Madvert Studios
                          <Arrow className="opacity-0 transition-opacity group-hover/btn:opacity-100" />
                        </span>
                        <span className="mt-1 block text-[13.5px] leading-snug text-ink-3">{pillars.find((p) => p.key === "studios")?.summary}</span>
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
      </header>

      {/* Mobile navigation */}
      {mobileOpen ? (
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="anim-fade fixed inset-0 z-40 overflow-y-auto bg-bg pt-[76px] xl:hidden"
          >
            <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
            <nav aria-label="Mobile" className="container-x relative pb-10 pt-6">
              <ul className="divide-y divide-[color:var(--line)] border-y border-line">
                {mainNav
                  .filter((i) => !("mega" in i))
                  .slice(0, 1)
                  .map((item) => (
                    <MobileLink key={item.href} href={item.href} active={isActive(item.href)} label={item.label} />
                  ))}
                <li className="py-5">
                  <p className="t-label mb-4">What We Do</p>
                  <ul className="grid gap-1">
                    {pillars.map((s) => (
                      <li key={s.href}>
                        <Link href={s.href} className="flex items-center gap-3.5 rounded-xl py-2.5">
                          <Icon3D name={s.icon} size="xs" />
                          <span className="font-display text-[16px] font-medium">{s.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                {mainNav
                  .filter((i) => !("mega" in i))
                  .slice(1)
                  .map((item) => (
                    <MobileLink key={item.href} href={item.href} active={isActive(item.href)} label={item.label} />
                  ))}
              </ul>
              <div className="mt-8 flex flex-col gap-4">
                <Cta href={site.founderCta.href} size="lg" track="strategy_call_click" trackLabel="mobile_menu_cta" className="w-full !whitespace-normal">
                  {site.shortCta.label}
                </Cta>
                <ThemeToggle withLabel className="self-start" />
              </div>
            </nav>
          </div>
        ) : null}
    </>
  );
}

function ActiveDot() {
  return <span aria-hidden="true" className="absolute bottom-0.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />;
}

function MobileLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center justify-between py-4 font-display text-[22px] font-semibold tracking-tight ${active ? "text-accent-text" : "text-ink"}`}
      >
        {label}
        <Arrow />
      </Link>
    </li>
  );
}
