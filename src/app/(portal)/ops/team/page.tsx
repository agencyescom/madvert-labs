import type { Metadata } from "next";
import { connection } from "next/server";
import type { TeamUser } from "@/onboarding/types";
import { db } from "@/onboarding/server/db";
import { requireOpsPage } from "@/onboarding/server/ops";
import { OpsShell } from "@/onboarding/ui/ops/OpsKit";
import { TeamManager } from "@/onboarding/ui/ops/TeamManager";

export const metadata: Metadata = { title: "Team · Operations" };

export default async function OpsTeam() {
  await connection();
  const user = await requireOpsPage("admin");
  const users = (await db().find<TeamUser>("team_users"))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, status: u.status, lastLoginAt: u.lastLoginAt ?? null, invitePending: pending(u) }));
  return (
    <OpsShell user={user}>
      <TeamManager me={user} users={users} emailEnabled={Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)} />
    </OpsShell>
  );
}

function pending(u: TeamUser) {
  return Boolean(u.inviteHash && u.inviteExpiresAt && Date.parse(u.inviteExpiresAt) > Date.now());
}
