import "server-only";
import { after } from "next/server";
import { dispatchEvent } from "@/integrations/webhooks";
import type { AuditLog, EventName, Onboarding, OnboardingEvent } from "../types";
import { newId } from "./crypto";
import { db } from "./db";

/**
 * Automation events for CRM / GoHighLevel / n8n.
 * Sent to ONBOARDING_WEBHOOK_URL plus the site's existing automation webhooks
 * (GOHIGHLEVEL_WEBHOOK_URL, ZAPIER_WEBHOOK_URL, MAKE_WEBHOOK_URL, N8N_WEBHOOK_URL, GENERIC_WEBHOOK_URL).
 * Payloads carry identifiers and status only: never passwords, credential values, tokens or file contents.
 */

const ONCE: EventName[] = ["ONBOARDING_STARTED", "BUSINESS_INFO_COMPLETED", "ACCESS_STARTED", "ASSETS_UPLOADED", "ONBOARDING_COMPLETE", "OFFER_COMPLETED", "OFFER_SKIPPED"];

type Data = Record<string, string | number | boolean | null>;

async function deliver(payload: Record<string, unknown>) {
  const url = process.env.ONBOARDING_WEBHOOK_URL;
  const jobs: Promise<unknown>[] = [dispatchEvent(payload)];
  if (url) {
    jobs.push(
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.ONBOARDING_WEBHOOK_SECRET ? { "x-madvert-signature": process.env.ONBOARDING_WEBHOOK_SECRET } : {}),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      }).then((r) => {
        if (!r.ok) throw new Error(`onboarding webhook ${r.status}`);
      }),
    );
  }
  const res = await Promise.allSettled(jobs);
  res.forEach((r) => r.status === "rejected" && console.error("[onboarding events]", r.reason));
  return res.filter((r) => r.status === "fulfilled").length;
}

export async function emit(onboarding: Pick<Onboarding, "id" | "clientId" | "engagementId" | "companyName" | "contact">, name: EventName, data: Data = {}) {
  if (ONCE.includes(name)) {
    const existing = await db().find<OnboardingEvent>("events", { onboardingId: onboarding.id, name });
    if (existing.length) return null;
  }
  const event: OnboardingEvent = { id: newId("evt_"), onboardingId: onboarding.id, name, data, delivered: 0, createdAt: new Date().toISOString() };
  await db().put("events", event);
  const payload = {
    event: `onboarding.${name}`,
    event_id: event.id,
    occurred_at: event.createdAt,
    onboarding_id: onboarding.id,
    client_id: onboarding.clientId,
    engagement_id: onboarding.engagementId,
    company_name: onboarding.companyName,
    email: onboarding.contact.email,
    first_name: onboarding.contact.firstName,
    tags: ["onboarding", name.toLowerCase()],
    ...data,
  };
  const run = async () => {
    event.delivered = await deliver(payload);
    await db().put("events", event);
  };
  try {
    after(run);
  } catch {
    await run();
  }
  return event;
}

export async function audit(entry: Omit<AuditLog, "id" | "createdAt">) {
  await db().put<AuditLog>("audit_logs", { ...entry, id: newId("aud_"), createdAt: new Date().toISOString() });
}
