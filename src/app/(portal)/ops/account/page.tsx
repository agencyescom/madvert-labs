import type { Metadata } from "next";
import { connection } from "next/server";
import { requireOpsPage } from "@/onboarding/server/ops";
import { AccountForm } from "@/onboarding/ui/ops/TeamManager";
import { OpsShell } from "@/onboarding/ui/ops/OpsKit";

export const metadata: Metadata = { title: "Your account · Operations" };

export default async function OpsAccount() {
  await connection();
  const user = await requireOpsPage();
  return (
    <OpsShell user={user}>
      <AccountForm me={user} />
    </OpsShell>
  );
}
