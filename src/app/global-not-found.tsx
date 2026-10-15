import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Cta } from "@/components/ui/Button";
import { MadvertMark } from "@/components/ui/MadvertMark";
import { themeBootScript } from "@/lib/theme";

const heading = Sora({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["400", "500", "600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = { title: "Page not found | Madvert Labs", robots: { index: false } };

/** 404 for unmatched URLs (the app has two root layouts: the site and the onboarding portal). */
export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${heading.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <section className="relative grid min-h-[100vh] place-items-center overflow-hidden">
          <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="container-x relative text-center">
            <MadvertMark className="mx-auto h-12 w-auto text-ink" />
            <p className="t-label mt-10">404</p>
            <h1 className="t-h1 mt-4">
              This route leaks. <span className="t-grad">Let us get you back on track.</span>
            </h1>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Cta href="/">Back to Home</Cta>
              <Cta href="/contact" variant="secondary">
                Talk to Us
              </Cta>
            </div>
          </div>
        </section>
      </body>
    </html>
  );
}
