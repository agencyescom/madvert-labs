import type { Metadata } from "next";
import { connection } from "next/server";
import type { DelegatedTask } from "@/onboarding/types";
import { delegateByToken } from "@/onboarding/server/auth";
import { db } from "@/onboarding/server/db";
import { audit } from "@/onboarding/server/events";
import { loadContext } from "@/onboarding/server/repo";
import { clientState, delegateState } from "@/onboarding/server/views";
import { DelegateApp } from "@/onboarding/ui/DelegateApp";
import { LinkProblem } from "@/onboarding/ui/LinkProblem";

export const metadata: Metadata = { title: "Onboarding task" };

export default async function DelegatedTaskPage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const d = await delegateByToken(token);
  if (!d) return <LinkProblem reason="expired" />;
  let task = d.task;
  if (task.status === "sent") {
    task = { ...task, status: "opened", openedAt: new Date().toISOString() };
    await db().put<DelegatedTask>("delegated_tasks", task);
    await audit({ onboardingId: task.onboardingId, actor: `delegate:${task.id}`, action: "delegate.opened" });
  }
  const ctx = await loadContext(d.onboarding.id);
  if (!ctx) return <LinkProblem reason="invalid" />;
  const state = delegateState(await clientState(ctx), task);
  return (
    <DelegateApp
      initial={state}
      token={token}
      from={d.onboarding.contact.firstName}
      task={{ id: task.id, taskKey: task.taskKey, taskLabel: task.taskLabel, message: task.message, name: task.name, status: task.status }}
    />
  );
}
