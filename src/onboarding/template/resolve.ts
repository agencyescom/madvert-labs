import type { CustomQuestion, Engagement, TemplateOverride } from "../types";
import { accessPlan } from "./access";
import { ASSET_SECTIONS } from "./assets";
import { BUSINESS_SECTIONS, OFFER_SECTIONS, type Question, type SectionDef } from "./questions";

export interface ResolvedTemplate {
  business: SectionDef[];
  offer: SectionDef[];
  access: { key: string; required: boolean }[];
  assets: { key: string; required: boolean }[];
}

/**
 * Builds the onboarding for one engagement: the base template, filtered by the engagement's services,
 * with the admin's overrides (hide, required, labels, help, order) and custom questions applied.
 */
export function resolveTemplate(
  engagement: Pick<Engagement, "services" | "ecommerce" | "localBusiness">,
  overrides: TemplateOverride[] = [],
  custom: CustomQuestion[] = [],
): ResolvedTemplate {
  const ov = new Map(overrides.map((o) => [o.id, o]));
  const apply = (sections: SectionDef[]) =>
    sections
      .filter((s) => !ov.get(`section:${s.key}`)?.hidden)
      .map((s) => {
        const extra: Question[] = custom
          .filter((c) => c.sectionKey === s.key)
          .map((c) => ({
            key: `custom_${c.id}`,
            label: c.label,
            type: c.type === "multi" ? "multi" : c.type === "select" ? "select" : c.type,
            options: c.options,
            required: c.required,
            help: c.help,
            showIf: c.showIf ? { key: c.showIf.key, equals: c.showIf.equals } : undefined,
            order: c.order,
            custom: true,
          }));
        const questions = [...s.questions, ...extra]
          .filter((q) => !q.services || q.services.some((x) => engagement.services.includes(x)))
          .map((q, i) => {
            const o = ov.get(`${s.key}.${q.key}`);
            return {
              ...q,
              order: o?.order ?? q.order ?? i * 10,
              required: o?.required ?? q.required ?? false,
              label: o?.label || q.label,
              help: o?.help ?? q.help,
              hidden: o?.hidden ?? false,
            };
          })
          .filter((q) => !q.hidden)
          .sort((a, b) => a.order - b.order);
        return { ...s, title: ov.get(`section:${s.key}`)?.label || s.title, intro: ov.get(`section:${s.key}`)?.help ?? s.intro, questions };
      });

  return {
    business: apply(BUSINESS_SECTIONS),
    offer: apply(OFFER_SECTIONS),
    access: accessPlan(engagement).map((a) => ({ key: a.platform.key, required: a.required })),
    assets: ASSET_SECTIONS.map((s) => ({ key: s.key, required: s.requiredFor.some((x) => engagement.services.includes(x)) })),
  };
}
