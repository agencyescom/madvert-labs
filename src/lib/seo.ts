import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  image?: string;
  type?: "website" | "article" | "profile";
}): Metadata {
  const url = absoluteUrl(path);
  const images = image ? [{ url: image }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, siteName: site.name, type, images, locale: "en_US" },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

const ORG_ID = `${site.url}/#organization`;
const PERSON_ID = `${site.url}/#founder`;

export const schema = {
  organization: () => ({
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: site.name,
    alternateName: "Madvert",
    description: `${site.name} is a ${site.descriptor.toLowerCase()} company. ${site.tagline}`,
    slogan: site.tagline,
    url: site.url,
    logo: absoluteUrl("/brand/app-icon-512.png"),
    founder: { "@id": PERSON_ID },
    knowsAbout: [
      "Branding",
      "Digital marketing",
      "Paid media",
      "Search engine optimisation",
      "AI search visibility",
      "Conversion rate optimisation",
      "Creative production",
      "CRM and marketing automation",
      "Custom software development",
    ],
  }),
  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    publisher: { "@id": ORG_ID },
  }),
  founder: () => ({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.founder.name,
    jobTitle: "Founder",
    image: absoluteUrl("/images/usama-abbas-dahri.jpg"),
    worksFor: { "@id": ORG_ID },
  }),
  webPage: (name: string, description: string, path: string) => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${site.url}/#website` },
    about: { "@id": ORG_ID },
  }),
  breadcrumbs: (items: { name: string; path: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  }),
  service: (s: { name: string; description: string; path: string; serviceType: string; audience?: string }) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    serviceType: s.serviceType,
    description: s.description,
    url: absoluteUrl(s.path),
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
    audience: s.audience ? { "@type": "BusinessAudience", audienceType: s.audience } : undefined,
  }),
  faq: (items: { q: string; a: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }),
  article: (a: { headline: string; description: string; path: string; image?: string; datePublished?: string; type?: string }) => ({
    "@context": "https://schema.org",
    "@type": a.type ?? "Article",
    headline: a.headline,
    description: a.description,
    url: absoluteUrl(a.path),
    image: a.image,
    datePublished: a.datePublished,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  }),
};
