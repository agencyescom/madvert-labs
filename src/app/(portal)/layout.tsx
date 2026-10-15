import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "../globals.css";
import "@/styles/onboarding.css";
import { PORTAL_THEME_KEY } from "@/onboarding/ui/theme";

const heading = Sora({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["400", "500", "600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

/** Portal + Operations are private, per-request and never cached or indexed. */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Madvert Labs Onboarding", template: "%s | Madvert Labs" },
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1c" },
    { media: "(prefers-color-scheme: light)", color: "#f4fbfc" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Light by default (premium light onboarding); a manual choice is remembered.
const themeScript = `(function(){var d=document.documentElement;try{var s=localStorage.getItem('${PORTAL_THEME_KEY}');d.setAttribute('data-theme',s==='dark'?'dark':'light');}catch(e){d.setAttribute('data-theme','light');}})();`;

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${heading.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
