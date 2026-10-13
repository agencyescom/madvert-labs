import { NAV_LINKS } from "@/lib/site";
import { Logo } from "../ui/Logo";

export function Footer() {
  return (
    <footer className="theme-dark border-t border-line">
      <div className="container-x py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo forceDark className="h-8 w-auto" />
            <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-subtle">Digital Marketing &amp; Growth Systems</p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-[0.9rem] sm:grid-cols-3">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="text-muted transition-colors hover:text-fg">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#book-call" className="font-semibold text-accent">
                  Book a Call
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-[0.78rem] leading-relaxed text-subtle md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Madvert Labs. All rights reserved.</p>
          <p className="max-w-2xl md:text-right">
            Founding beta pricing of $15 per accepted qualified RFQ is subject to qualification criteria agreed in writing before launch,
            campaign economics, geography and volume. RFQ volume and sales outcomes are not guaranteed.
          </p>
        </div>
      </div>
    </footer>
  );
}
