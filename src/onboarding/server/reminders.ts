import "server-only";
import type { Onboarding, OnboardingEvent } from "../types";
import { clientActionable, missingItems } from "../progress";
import { db } from "./db";
import { sendReminder } from "./emails";
import { emit } from "./events";
import { currentLink, loadContext, progressInput } from "./repo";

/**
 * Friendly reminders: 24 hours, 3 days and 5 days after onboarding started, at most three in total.
 * Skipped when the client was active in the last 12 hours, and stopped entirely once only optional
 * items (or items waiting on Madvert) remain. Also emits MISSING_ACCESS once a day while the kickoff
 * is booked but required access is still missing.
 */
const SCHEDULE = [
  { key: "24h", afterHours: 24 },
  { key: "3d", afterHours: 72 },
  { key: "5d", afterHours: 120 },
];

export async function runReminders(nowMs = Date.now()) {
  const all = await db().find<Onboarding>("onboardings", { status: "active" });
  const report = { checked: all.length, sent: 0, skipped: 0, missingAccess: 0 };
  for (const o of all) {
    if (Date.parse(o.expiresAt) < nowMs) continue;
    const ctx = await loadContext(o.id);
    if (!ctx) continue;
    const input = progressInput(ctx);
    const missing = missingItems(input);
    const actionable = clientActionable(missing);

    // MISSING_ACCESS (for the team / CRM), at most once per day.
    const missingAccess = missing.filter((m) => m.phase === "access" && m.required && m.state !== "Awaiting verification");
    if (ctx.booking?.status === "booked" && missingAccess.length) {
      const events = await db().find<OnboardingEvent>("events", { onboardingId: o.id, name: "MISSING_ACCESS" });
      if (!events.some((e) => nowMs - Date.parse(e.createdAt) < 20 * 3600_000)) {
        await emit(o, "MISSING_ACCESS", { items: missingAccess.map((m) => m.key).join(","), count: missingAccess.length });
        report.missingAccess++;
      }
    }

    if (!o.startedAt || !actionable.length) continue;
    const started = Date.parse(o.startedAt);
    const due = SCHEDULE.filter((s) => nowMs - started >= s.afterHours * 3600_000 && !o.reminders.some((r) => r.key === s.key));
    if (!due.length) continue;
    if (o.lastClientActivityAt && nowMs - Date.parse(o.lastClientActivityAt) < 12 * 3600_000) {
      report.skipped++;
      continue;
    }
    const step = due[due.length - 1]; // never send a backlog of reminders at once
    const link = currentLink(o);
    if (!link) {
      report.skipped++;
      continue;
    }
    const delivered = await sendReminder({ to: o.contact.email, firstName: o.contact.firstName, url: link, items: actionable.map((i) => i.label), nth: o.reminders.length });
    const at = new Date(nowMs).toISOString();
    // Mark every due step as handled so skipped steps are not sent later.
    await db().put<Onboarding>("onboardings", { ...o, reminders: [...o.reminders, ...due.map((d) => ({ key: d.key, sentAt: at }))], updatedAt: at });
    await emit(o, "REMINDER_SENT", { step: step.key, delivered, open_items: actionable.length });
    report.sent++;
  }
  return report;
}
