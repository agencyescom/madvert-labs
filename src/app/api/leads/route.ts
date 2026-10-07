import { NextResponse } from "next/server";
import { z } from "zod";
import { getResource } from "@/cms";
import { getWriteClient } from "@/cms/client";
import { challengeSchema, growthBriefSchema, resourceRequestSchema } from "@/forms/schemas";
import { processLead, requestContext } from "@/integrations/leads";
import { clientIp, rateLimit } from "@/integrations/rate-limit";
import { spamCheck } from "@/integrations/spam";
import type { LeadPayload } from "@/integrations/types";

const MAX_UPLOAD = 8 * 1024 * 1024;
const ALLOWED_UPLOADS = ["application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function fail(status: number, error: string, fields?: Record<string, string[]>) {
  return NextResponse.json({ ok: false, error, fields }, { status });
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = await rateLimit(`leads:${ip}`, 8, 600);
  if (!limit.ok) return fail(429, "Too many submissions. Please try again in a few minutes.");

  let raw: Record<string, unknown>;
  let file: File | null = null;
  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      raw = JSON.parse(String(fd.get("payload") ?? "{}"));
      const f = fd.get("file");
      if (f instanceof File && f.size > 0) file = f;
    } else {
      raw = await req.json();
    }
  } catch {
    return fail(400, "Invalid request");
  }

  const schema = z.discriminatedUnion("type", [growthBriefSchema, challengeSchema, resourceRequestSchema]);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return fail(422, "Please check the highlighted fields.", z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
  const data = parsed.data;

  const spam = await spamCheck(data, ip);
  if (spam) {
    // Bots get a success-shaped response so they learn nothing; nothing is processed.
    console.warn("[leads] rejected as spam:", spam);
    return NextResponse.json({ ok: true });
  }

  const base = {
    eventId: data.eventId,
    submittedAt: new Date().toISOString(),
    attribution: data.attribution,
    request: requestContext(req),
  };

  if (data.type === "contact") {
    const lead: LeadPayload = {
      ...base,
      kind: "growth_brief",
      contact: { name: data.name, email: data.email, phone: data.phone, business: data.business, website: data.website },
      answers: {
        business: data.business,
        market: data.market,
        stuck: data.stuck,
        tried: data.tried,
        great_result: data.greatResult,
        investment: data.investment,
      },
      service: data.service,
      intent: data.intent,
    };
    processLead(lead);
    return NextResponse.json({ ok: true });
  }

  if (data.type === "challenge") {
    let attachmentUrl: string | undefined;
    if (file) {
      if (file.size > MAX_UPLOAD) return fail(413, "Files must be 8 MB or smaller.");
      if (!ALLOWED_UPLOADS.includes(file.type)) return fail(415, "Please upload a PDF, image, spreadsheet, document or slide file.");
      const writer = getWriteClient();
      if (!writer) return fail(400, "File uploads are not available right now. Please share a link instead.");
      const asset = await writer.assets.upload(file.type.startsWith("image/") ? "image" : "file", Buffer.from(await file.arrayBuffer()), {
        filename: file.name.slice(0, 120),
        contentType: file.type,
      });
      attachmentUrl = asset.url;
    }
    const lead: LeadPayload = {
      ...base,
      kind: "challenge",
      contact: { name: data.name, email: data.email, phone: data.phone, business: data.business, website: data.website },
      answers: { problem: data.problem, tried: data.tried, why_difficult: data.whyDifficult, desired_outcome: data.desiredOutcome, link: data.link },
      attachmentUrl,
      intent: "challenge-madvert",
    };
    processLead(lead);
    return NextResponse.json({ ok: true });
  }

  // resource
  const resource = await getResource(data.resourceSlug);
  if (!resource) return fail(404, "Resource not found");
  if ((resource.gating === "form" || resource.gating === "qualified") && (!data.name || !data.business)) {
    return fail(422, "Please complete the form.", { name: ["Required"], business: ["Required"] });
  }
  if (resource.gating === "qualified" && !data.challenge) return fail(422, "Please complete the form.", { challenge: ["Required"] });
  const lead: LeadPayload = {
    ...base,
    kind: "resource",
    contact: { name: data.name, email: data.email, business: data.business, website: data.website },
    answers: { challenge: data.challenge },
    resource: { slug: resource.slug, title: resource.title, gating: resource.gating },
    service: resource.relatedService,
  };
  processLead(lead);
  // Qualified resources are reviewed by the team before they are sent.
  const downloadUrl = resource.gating === "qualified" ? undefined : resource.fileUrl ?? resource.externalUrl;
  return NextResponse.json({ ok: true, downloadUrl, delivery: downloadUrl ? "instant" : "email" });
}
