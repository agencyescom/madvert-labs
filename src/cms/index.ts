import { cacheLife, cacheTag } from "next/cache";
import { getReadClient } from "./client";
import { queries } from "./queries";
import {
  fallbackCaseStudies,
  fallbackFaqs,
  fallbackPortfolio,
  fallbackProof,
  fallbackResources,
  fallbackSettings,
  fallbackTeam,
  fallbackTestimonials,
} from "./fallback";
import type { CaseStudy, Faq, PortfolioProject, ProofItem, Resource, SiteSettings, TeamMember, Testimonial } from "@/types/content";

/**
 * CMS access. Every reader is cached ("use cache") and tagged so the Sanity webhook
 * (/api/revalidate) can refresh content on publish. If Sanity is not configured, errors,
 * or returns nothing, the clearly marked local placeholders are used instead.
 */
async function fetchOr<T>(query: string, params: Record<string, unknown>, fallback: T, acceptEmpty = false): Promise<T> {
  const client = getReadClient();
  if (!client) return fallback;
  try {
    const data = await client.fetch<T>(query, params);
    if (data == null) return fallback;
    if (Array.isArray(data) && data.length === 0 && !acceptEmpty) return fallback;
    return data;
  } catch (err) {
    console.error("[cms] query failed, using fallback content", err);
    return fallback;
  }
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "caseStudy");
  return fetchOr(queries.caseStudies, {}, fallbackCaseStudies);
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "caseStudy");
  const all = await getCaseStudies();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getResources(): Promise<Resource[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "resource");
  return fetchOr(queries.resources, {}, fallbackResources);
}

export async function getResource(slug: string): Promise<Resource | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "resource");
  const all = await getResources();
  return all.find((r) => r.slug === slug) ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "testimonial");
  return fetchOr(queries.testimonials, {}, fallbackTestimonials);
}

export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "teamMember");
  return fetchOr(queries.team, {}, fallbackTeam);
}

export async function getFaqs(scope: string): Promise<Faq[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "faq");
  return fetchOr(queries.faqs, { scope }, fallbackFaqs[scope] ?? []);
}

export async function getPortfolio(): Promise<PortfolioProject[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "portfolioProject");
  return fetchOr(queries.portfolio, {}, fallbackPortfolio);
}

export async function getProof(): Promise<ProofItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "proofItem");
  return fetchOr(queries.proof, {}, fallbackProof);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms", "siteSettings");
  const data = await fetchOr<Partial<SiteSettings> | null>(queries.settings, {}, null);
  return {
    ...fallbackSettings,
    ...(data ?? {}),
    founderPhoto: data?.founderPhoto ?? fallbackSettings.founderPhoto,
    heroImage: data?.heroImage ?? fallbackSettings.heroImage,
    clientLogos: data?.clientLogos ?? [],
    certifications: data?.certifications ?? [],
  };
}
