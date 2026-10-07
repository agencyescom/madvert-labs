import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Cta } from "@/components/ui/Button";
import { GrowthRibbon } from "@/components/visuals/GrowthRibbon";
import { footerNav, services, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-2">
      <GrowthRibbon shape="flat" className="absolute inset-x-0 -top-10 h-40 w-full" opacity={0.5} flowing={false} id="footer-ribbon" />
      <div className="container-x relative pb-10 pt-20 md:pt-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo descriptor height={64} />
            <p className="t-h3 mt-8 max-w-[420px]">{site.tagline}</p>
            <div className="mt-8">
              <Cta href={site.primaryCta.href} track="strategy_call_click" trackLabel="footer_cta">
                {site.primaryCta.label}
              </Cta>
            </div>
          </div>
          <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
            <p className="t-label">Madvert</p>
            <ul className="mt-5 grid gap-3">
              {footerNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[15px] text-ink-2 transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Services" className="md:col-span-3">
            <p className="t-label">Services</p>
            <ul className="mt-5 grid gap-3">
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-[15px] text-ink-2 transition-colors hover:text-ink">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="hairline mt-16" />
        <div className="mt-8 flex flex-col gap-4 text-[13.5px] text-ink-3 md:flex-row md:items-center md:justify-between">
          <p className="font-display tracking-[0.02em] text-ink-2">{site.footerLine}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <span>
              © {site.legalName}. {site.descriptor}.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
