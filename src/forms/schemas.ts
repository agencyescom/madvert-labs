import { z } from "zod";

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const url = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v), "Please enter a valid website address");

export const attributionSchema = z
  .object({
    utm_source: optionalText(200),
    utm_medium: optionalText(200),
    utm_campaign: optionalText(200),
    utm_content: optionalText(200),
    utm_term: optionalText(200),
    gclid: optionalText(300),
    fbclid: optionalText(300),
    landing_page: optionalText(500),
    first_page: optionalText(500),
    referrer: optionalText(500),
    first_seen: optionalText(60),
    timestamp: optionalText(60),
    cta_clicked: optionalText(200),
  })
  .partial()
  .default({});

/** Spam guards shared by every public form: a honeypot and a minimum completion time. */
export const guardSchema = z.object({
  website_confirm: z.string().max(0, "Spam detected").optional().default(""),
  startedAt: z.coerce.number().int().positive(),
  turnstileToken: z.string().max(4096).optional(),
});

export const investmentOptions = [
  "Under 2,000 USD per month",
  "2,000 to 5,000 USD per month",
  "5,000 to 10,000 USD per month",
  "10,000 USD or more per month",
  "Not sure yet",
] as const;

export const growthBriefFields = z.object({
  name: z.string({ error: "Please tell us what to call you" }).trim().min(2, "Please tell us what to call you").max(120),
  business: z.string({ error: "A sentence about the business helps" }).trim().min(2, "A sentence about the business helps").max(1200),
  market: z.string({ error: "Which market do you serve?" }).trim().min(2, "Which market do you serve?").max(300),
  stuck: z.string({ error: "What feels stuck right now?" }).trim().min(5, "What feels stuck right now?").max(2000),
  tried: z.string().trim().max(2000).optional().default(""),
  greatResult: z.string({ error: "What would a great result look like?" }).trim().min(3, "What would a great result look like?").max(2000),
  investment: z.enum(investmentOptions, { message: "Please choose an option" }),
  email: z.string({ error: "Please enter a valid email" }).trim().email("Please enter a valid email").max(200),
  phone: optionalText(40),
  website: url,
});

export const growthBriefSchema = growthBriefFields.extend({
  type: z.literal("contact"),
  service: optionalText(80),
  intent: optionalText(80),
  attribution: attributionSchema,
  eventId: z.string().max(80),
  ...guardSchema.shape,
});

export const challengeFields = z.object({
  name: z.string({ error: "Please tell us your name" }).trim().min(2, "Please tell us your name").max(120),
  email: z.string({ error: "Please enter a valid email" }).trim().email("Please enter a valid email").max(200),
  phone: optionalText(40),
  business: z.string({ error: "Which business is this about?" }).trim().min(2, "Which business is this about?").max(300),
  website: url,
  problem: z.string({ error: "Describe the problem in a sentence or two" }).trim().min(10, "Describe the problem in a sentence or two").max(3000),
  tried: z.string().trim().max(3000).optional().default(""),
  whyDifficult: z.string().trim().max(3000).optional().default(""),
  desiredOutcome: z.string({ error: "What outcome do you want?" }).trim().min(3, "What outcome do you want?").max(2000),
  link: url,
});

export const challengeSchema = challengeFields.extend({
  type: z.literal("challenge"),
  attribution: attributionSchema,
  eventId: z.string().max(80),
  ...guardSchema.shape,
});

export const resourceRequestFields = z.object({
  email: z.string({ error: "Please enter a valid email" }).trim().email("Please enter a valid email").max(200),
  name: optionalText(120),
  business: optionalText(300),
  website: url,
  challenge: optionalText(1500),
});

export const resourceRequestSchema = resourceRequestFields.extend({
  type: z.literal("resource"),
  resourceSlug: z.string().trim().min(1).max(120),
  attribution: attributionSchema,
  eventId: z.string().max(80),
  ...guardSchema.shape,
});

export const bookingFields = z.object({
  name: z.string({ error: "Please enter your name" }).trim().min(2, "Please enter your name").max(120),
  email: z.string({ error: "Please enter a valid email" }).trim().email("Please enter a valid email").max(200),
  phone: z.string({ error: "Phone or WhatsApp helps us reach you" }).trim().min(6, "Phone or WhatsApp helps us reach you").max(40),
  business: z.string({ error: "Business name" }).trim().min(2, "Business name").max(200),
  website: url,
  problem: z.string({ error: "What is the main problem?" }).trim().min(5, "What is the main problem?").max(2000),
  market: z.string({ error: "Which market?" }).trim().min(2, "Which market?").max(300),
  notes: optionalText(2000),
});

export const bookingSchema = bookingFields.extend({
  start: z.string().datetime({ offset: true }),
  timezone: z.string().max(80),
  attribution: attributionSchema,
  eventId: z.string().max(80),
  ...guardSchema.shape,
});

export type GrowthBrief = z.infer<typeof growthBriefSchema>;
export type ChallengeSubmission = z.infer<typeof challengeSchema>;
export type ResourceRequest = z.infer<typeof resourceRequestSchema>;
export type BookingRequest = z.infer<typeof bookingSchema>;
