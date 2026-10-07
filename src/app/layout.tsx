import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { IconDefs } from "@/components/ui/Icon3D";
import { ClientBoot } from "@/analytics/ClientBoot";
import { AnalyticsScripts } from "@/analytics/AnalyticsScripts";
import { JsonLd } from "@/components/seo/JsonLd";
import { themeBootScript } from "@/lib/theme";
import { schema } from "@/lib/seo";
import { site } from "@/lib/site";

const heading = Sora({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["400", "500", "600", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.descriptor}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Madvert Labs connects branding, customer acquisition, conversion, creative, automation and technology into one intelligent growth system built around your business.",
  applicationName: site.name,
  authors: [{ name: site.founder.name }],
  creator: site.name,
  openGraph: { siteName: site.name, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1c" },
    { media: "(prefers-color-scheme: light)", color: "#f4fbfc" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${heading.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <IconDefs />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileStickyCta />
        <ClientBoot />
        <AnalyticsScripts />
        <JsonLd data={[schema.organization(), schema.website(), schema.founder()]} />
      </body>
    </html>
  );
}
