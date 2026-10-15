import type { Metadata } from "next";
import { connection } from "next/server";
import type { TeamUser } from "@/onboarding/types";
import { hashToken } from "@/onboarding/server/crypto";
import { db } from "@/onboarding/server/db";
import { InviteForm } from "@/onboarding/ui/ops/TeamManager";

export const metadata: Metadata = { title: "Join Madvert Operations" };

export default async function OpsInvite({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const [u] = /^[A-Za-z0-9_-]{32,64}$/.test(token) ? await db().find<TeamUser>("team_users", { inviteHash: hashToken(token) }) : [];
  const valid = inviteValid(u);
  return <InviteForm token={token} valid={valid} email={valid ? u!.email : ""} name={valid ? u!.name : ""} reset={valid && u!.status === "active"} />;
}

function inviteValid(u?: TeamUser) {
  return Boolean(u && u.inviteExpiresAt && Date.parse(u.inviteExpiresAt) > Date.now() && u.status !== "disabled");
}
