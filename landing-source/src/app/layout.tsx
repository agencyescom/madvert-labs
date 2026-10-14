import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@/components/Analytics";
import { Providers } from "@/components/Providers";
import { themeInitScript } from "@/components/ThemeProvider";
import { META_PIXEL_ID, metaPixelScript } from "@/lib/analytics";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: SITE.url },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: `${SITE.url}/brand/og.jpg`, width: 1200, height: 675, alt: "Madvert Labs — Digital Marketing & Growth Systems" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [`${SITE.url}/brand/og.jpg`],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#05080e" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.png`, slogan: SITE.tagline },
    {
      "@type": "Service",
      name: SITE.offer,
      provider: { "@type": "Organization", name: SITE.name },
      serviceType: "Customer acquisition for custom patch and embroidery manufacturers",
      areaServed: { "@type": "Country", name: "United States" },
      description: SITE.description,
      offers: {
        "@type": "Offer",
        name: "Founding beta pricing",
        price: "15",
        priceCurrency: "USD",
        description: "Per accepted qualified RFQ. Meta ad spend included.",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* Meta Pixel base code, as provided by Meta: in <head> so PageView fires before hydration. */}
        {META_PIXEL_ID && <script id="meta-pixel" dangerouslySetInnerHTML={{ __html: metaPixelScript(META_PIXEL_ID) }} />}
      </head>
      <body>
        {META_PIXEL_ID && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
          </noscript>
        )}
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
