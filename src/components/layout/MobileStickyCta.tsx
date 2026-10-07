"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Cta } from "@/components/ui/Button";
import { site } from "@/lib/site";

/** Appears on small screens once the visitor has scrolled past the first viewport. Hidden on the contact flow. */
export function MobileStickyCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 520;
      setShow(window.scrollY > window.innerHeight * 0.9 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  if (pathname.startsWith("/contact") || pathname.startsWith("/challenge")) return null;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-[120%]"
      }`}
      style={{ background: "linear-gradient(to top, var(--bg) 55%, transparent)" }}
      aria-hidden={!show}
    >
      <Cta href={site.shortCta.href} size="md" track="strategy_call_click" trackLabel="mobile_sticky_cta" className="w-full" tabIndex={show ? 0 : -1}>
        {site.shortCta.label}
      </Cta>
    </div>
  );
}
