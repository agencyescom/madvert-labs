import type { CaseStudy, CaseStudyCategory, Metric } from "@/types/content";

/** A value counts as real content only if it is non-empty and not a bracketed placeholder like "[INDUSTRY]". */
export function isReal(v: string | null | undefined): v is string {
  if (!v) return false;
  const t = v.trim();
  return t.length > 0 && !/\[[^\]]*\]/.test(t);
}

/** Only verified metrics: real values on non-placeholder studies. Renders nothing when absent. */
export function verifiedMetrics(s: CaseStudy): Metric[] {
  if (s.placeholder) return [];
  return (s.metrics ?? []).filter((m) => isReal(m.label) && isReal(m.value));
}

export const categoryLabels: Record<CaseStudyCategory, string> = {
  acquisition: "Client Acquisition",
  seo: "SEO",
  branding: "Branding",
  studios: "Studios",
  automation: "Automation",
  technology: "Technology",
};

export function primaryCategory(s: CaseStudy): CaseStudyCategory {
  return s.categories?.[0] ?? "acquisition";
}

/** Card kicker: "Industry · Market" when real, otherwise the category / system type. */
export function caseKicker(s: CaseStudy): string {
  const real = [s.industry, s.market ?? s.region].filter(isReal);
  if (real.length) return real.join(" · ");
  return isReal(s.systemType) ? s.systemType : categoryLabels[primaryCategory(s)];
}

export function oneLiner(s: CaseStudy): string {
  return (isReal(s.oneLiner) ? s.oneLiner : s.summary) ?? "";
}
