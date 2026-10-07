import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.max(70) }),
    defineField({ name: "description", type: "text", rows: 3, validation: (r) => r.max(170) }),
    defineField({ name: "image", title: "Social share image", type: "image" }),
    defineField({ name: "noindex", type: "boolean", initialValue: false }),
  ],
});

export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [defineField({ name: "alt", type: "string", validation: (r) => r.required() })],
});

export const metric = defineType({
  name: "metric",
  title: "Metric",
  type: "object",
  description: "Only real, verifiable client numbers.",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "value", type: "string", validation: (r) => r.required() }),
    defineField({ name: "context", type: "string", description: "Timeframe or baseline, e.g. 'vs previous 90 days'" }),
  ],
});

/** Reusable content blocks for flexible pages. */
export const contentBlock = defineType({
  name: "contentBlock",
  title: "Content block",
  type: "object",
  fields: [
    defineField({ name: "kind", type: "string", options: { list: ["statement", "capability", "freeValue", "faq", "cta", "richText"] } }),
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "headline", type: "string" }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "items", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "ctaLabel", type: "string" }),
    defineField({ name: "ctaHref", type: "string" }),
    defineField({ name: "image", type: "imageWithAlt" }),
  ],
});
