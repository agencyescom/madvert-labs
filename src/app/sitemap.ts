import type { MetadataRoute } from "next";
import { getCaseStudies, getResources } from "@/cms";
import { absoluteUrl, pillars } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [studies, resources] = await Promise.all([getCaseStudies(), getResources()]);
  const fixed = ["/", "/services", "/case-studies", "/resources", "/about", "/contact", "/challenge", ...pillars.map((p) => p.href)];
  return [
    ...fixed.map((p) => ({ url: absoluteUrl(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...studies.filter((s) => !s.placeholder).map((s) => ({ url: absoluteUrl(`/case-studies/${s.slug}`), lastModified: s.publishedAt, priority: 0.7 })),
    ...resources.map((r) => ({ url: absoluteUrl(`/resources/${r.slug}`), priority: 0.6 })),
  ];
}
