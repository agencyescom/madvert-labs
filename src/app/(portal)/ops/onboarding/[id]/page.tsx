import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { detail, requireOpsPage } from "@/onboarding/server/ops";
import { Detail } from "@/onboarding/ui/ops/Detail";
import { OpsShell } from "@/onboarding/ui/ops/OpsKit";

export const metadata: Metadata = { title: "Client onboarding · Operations" };

export default async function OnboardingDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const user = await requireOpsPage();
  const { id } = await params;
  const d = await detail(id);
  if (!d) notFound();
  const { ctx, ...rest } = d;
  const o = ctx.onboarding;
  // Only what the team view needs; token hashes and ciphertexts stay on the server.
  const view = {
    ...rest,
    onboarding: { id: o.id, companyName: o.companyName, contact: o.contact, status: o.status, expiresAt: o.expiresAt, tokenHint: o.tokenHint, accountManager: o.accountManager, strategist: o.strategist ?? "", assignedOwner: o.assignedOwner ?? "", lastClientActivityAt: o.lastClientActivityAt ?? null, startedAt: o.startedAt ?? null, createdAt: o.createdAt, completedAt: o.completedAt ?? null },
    engagement: ctx.engagement,
    answers: ctx.answers,
    template: { business: ctx.template.business.map((s) => ({ key: s.key, title: s.title, questions: s.questions.map((q) => ({ key: q.key, label: q.label })) })) },
    social: ctx.social,
    folders: ctx.folders,
    booking: ctx.booking,
    delegated: ctx.delegated.map((t) => ({ ...t, tokenHash: undefined })),
    secrets: ctx.secrets.map((s) => ({ id: s.id, platform: s.platform, label: s.label, username: s.username ?? "", createdAt: s.createdAt, revealedCount: s.revealedCount })),
    guarantees: ctx.guarantees,
    objections: ctx.objections,
    strategyNotes: ctx.workshop?.strategyNotes ?? "",
    offerStatus: ctx.workshop?.status ?? (o.offerMode === "kickoff" ? "skipped" : "not_started"),
  };
  return (
    <OpsShell user={user}>
      <Detail d={view} />
    </OpsShell>
  );
}
