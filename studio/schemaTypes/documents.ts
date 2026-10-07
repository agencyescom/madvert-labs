import { defineArrayMember, defineField, defineType } from "sanity";

const slug = (source = "title") => defineField({ name: "slug", type: "slug", options: { source }, validation: (r) => r.required() });
const order = defineField({ name: "order", type: "number" });
const seo = defineField({ name: "seo", type: "seo" });

export const page = defineType({
  name: "page",
  type: "document",
  fields: [defineField({ name: "title", type: "string", validation: (r) => r.required() }), slug(), defineField({ name: "blocks", type: "array", of: [defineArrayMember({ type: "contentBlock" })] }), seo],
});

export const service = defineType({
  name: "service",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "route", type: "string", description: "e.g. /services/conversion" }),
    defineField({ name: "headline", type: "string" }),
    defineField({ name: "summary", type: "text", rows: 2 }),
    defineField({ name: "icon", type: "string" }),
    defineField({ name: "freeValue", type: "reference", to: [{ type: "leadMagnet" }] }),
    seo,
  ],
});

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "client", type: "reference", to: [{ type: "client" }] }),
    defineField({ name: "industry", type: "string" }),
    defineField({ name: "market", type: "string" }),
    defineField({
      name: "categories",
      type: "array",
      of: [{ type: "string" }],
      options: { list: ["acquisition", "seo", "branding", "studios", "automation", "technology"] },
      validation: (r) => r.min(1),
    }),
    defineField({ name: "services", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "summary", type: "text", rows: 2, validation: (r) => r.required() }),
    defineField({ name: "problem", type: "text" }),
    defineField({ name: "diagnosis", type: "text" }),
    defineField({ name: "move", title: "The move", type: "text" }),
    defineField({ name: "strategy", type: "text" }),
    defineField({ name: "execution", type: "text" }),
    defineField({ name: "creative", type: "text" }),
    defineField({ name: "system", type: "text" }),
    defineField({ name: "result", type: "text" }),
    defineField({ name: "learned", title: "What we learned", type: "text" }),
    defineField({ name: "metrics", type: "array", of: [{ type: "metric" }] }),
    defineField({ name: "testimonial", type: "reference", to: [{ type: "testimonial" }] }),
    defineField({ name: "videoUrl", title: "Client video URL", type: "url" }),
    defineField({ name: "featuredImage", type: "imageWithAlt" }),
    defineField({ name: "gallery", type: "array", of: [{ type: "imageWithAlt" }] }),
    defineField({ name: "publishedAt", type: "datetime" }),
    seo,
  ],
  orderings: [{ title: "Newest", name: "newest", by: [{ field: "publishedAt", direction: "desc" }] }],
});

export const resource = defineType({
  name: "resource",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slug(),
    defineField({ name: "kind", title: "Type", type: "string", options: { list: ["Playbook", "Guide", "Checklist", "Audit", "Portfolio", "Tool"] } }),
    defineField({ name: "category", type: "string", options: { list: ["acquire", "convert", "search", "brand", "automate", "build"] }, validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({ name: "outline", title: "What is inside", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "cover", type: "imageWithAlt" }),
    defineField({ name: "file", type: "file" }),
    defineField({ name: "externalUrl", type: "string" }),
    defineField({
      name: "gating",
      type: "string",
      options: { list: [{ title: "Open", value: "open" }, { title: "Email gated", value: "email" }, { title: "Form gated", value: "form" }, { title: "Qualified lead gated", value: "qualified" }] },
      initialValue: "email",
    }),
    defineField({ name: "form", type: "string", description: "Optional CRM form identifier" }),
    defineField({ name: "relatedService", type: "reference", to: [{ type: "service" }] }),
    defineField({ name: "featured", type: "boolean" }),
    seo,
  ],
});

export const leadMagnet = defineType({
  name: "leadMagnet",
  title: "Lead Magnet",
  type: "document",
  fields: [defineField({ name: "title", type: "string" }), defineField({ name: "resource", type: "reference", to: [{ type: "resource" }] }), defineField({ name: "ctaLabel", type: "string" })],
});

export const portfolioProject = defineType({
  name: "portfolioProject",
  title: "Portfolio Project (Madvert Studios)",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    slug(),
    defineField({ name: "format", type: "string", options: { list: ["Static", "Motion", "Explainer", "Cinematic", "Talking Head", "AI Commercial", "AI Influencer", "Real Production"] } }),
    defineField({ name: "client", type: "reference", to: [{ type: "client" }] }),
    defineField({ name: "videoUrl", type: "url" }),
    defineField({ name: "poster", type: "imageWithAlt" }),
    order,
  ],
});

export const testimonial = defineType({
  name: "testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", type: "text", validation: (r) => r.required() }),
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "company", type: "string" }),
    defineField({ name: "videoUrl", type: "url" }),
    defineField({ name: "permission", title: "Client approved for publication", type: "boolean", validation: (r) => r.required() }),
    order,
  ],
});

export const client = defineType({
  name: "client",
  type: "document",
  fields: [defineField({ name: "name", type: "string" }), defineField({ name: "logo", type: "imageWithAlt" }), defineField({ name: "showLogo", type: "boolean" }), order],
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [defineField({ name: "name", type: "string" }), defineField({ name: "role", type: "string" }), defineField({ name: "photo", type: "imageWithAlt" }), defineField({ name: "bio", type: "text" }), order],
});

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "scopes",
      type: "array",
      of: [{ type: "string" }],
      options: { list: ["home", "branding-marketing", "client-acquisition", "conversion", "studios", "automation-revenue-systems", "tech-product-development"] },
    }),
    order,
  ],
});

export const proofItem = defineType({
  name: "proofItem",
  title: "Proof Item",
  type: "document",
  fields: [
    defineField({ name: "kind", type: "string", options: { list: ["testimonial", "campaign", "crm", "creative", "certification", "video", "result"] } }),
    defineField({ name: "label", type: "string" }),
    defineField({ name: "caption", type: "string" }),
    defineField({ name: "image", type: "imageWithAlt" }),
    order,
  ],
});

export const insight = defineType({
  name: "insight",
  title: "Insight / Blog",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    slug(),
    defineField({ name: "excerpt", type: "text", rows: 2 }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }, { type: "imageWithAlt" }] }),
    defineField({ name: "publishedAt", type: "datetime" }),
    seo,
  ],
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "founderPhoto", type: "imageWithAlt", description: "Authentic photography of Usama" }),
    defineField({ name: "heroImage", type: "imageWithAlt", description: "Real founder or client photography for the home hero" }),
    defineField({ name: "showreelUrl", type: "url" }),
    defineField({ name: "showreelPoster", type: "imageWithAlt" }),
    defineField({ name: "certifications", type: "array", of: [defineArrayMember({ type: "object", fields: [defineField({ name: "name", type: "string" }), defineField({ name: "image", type: "imageWithAlt" })] })] }),
    seo,
  ],
});

export const calendarSettings = defineType({
  name: "calendarSettings",
  title: "Calendar Settings",
  type: "document",
  description: "Reference copy of booking settings. The live values are read from environment variables (see README).",
  fields: [
    defineField({ name: "ownerName", type: "string" }),
    defineField({ name: "calendarId", type: "string" }),
    defineField({ name: "timezone", type: "string" }),
    defineField({ name: "meetingMinutes", type: "number", initialValue: 30 }),
    defineField({ name: "bufferBefore", type: "number", initialValue: 15 }),
    defineField({ name: "bufferAfter", type: "number", initialValue: 15 }),
  ],
});

export const navigation = defineType({
  name: "navigation",
  type: "document",
  fields: [defineField({ name: "items", type: "array", of: [defineArrayMember({ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "href", type: "string" })] })] })],
});

export const footer = defineType({
  name: "footer",
  type: "document",
  fields: [defineField({ name: "brandLine", type: "string" }), defineField({ name: "finalLine", type: "string" })],
});
