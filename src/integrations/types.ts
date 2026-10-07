import type { Attribution } from "@/lib/attribution";

export type LeadKind = "growth_brief" | "challenge" | "resource" | "booking";

export type LeadPayload = {
  kind: LeadKind;
  eventId: string;
  submittedAt: string;
  contact: { name?: string; email: string; phone?: string; business?: string; website?: string };
  answers: Record<string, string | undefined>;
  service?: string;
  intent?: string;
  resource?: { slug: string; title?: string; gating?: string };
  booking?: { start: string; end: string; timezone: string; eventLink?: string; meetLink?: string };
  attachmentUrl?: string;
  attribution: Partial<Attribution>;
  request: { ip?: string; userAgent?: string; pageUrl?: string; fbp?: string; fbc?: string; gaClientId?: string };
};
