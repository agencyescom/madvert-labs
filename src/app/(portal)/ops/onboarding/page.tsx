import type { Metadata } from "next";
import { connection } from "next/server";
import { configStatus, overview, requireOpsPage } from "@/onboarding/server/ops";
import { Dashboard } from "@/onboarding/ui/ops/Dashboard";
import { OpsShell } from "@/onboarding/ui/ops/OpsKit";

export const metadata: Metadata = { title: "Onboarding · Operations" };

export default async function OpsOnboarding() {
  await connection();
  const user = await requireOpsPage();
  return (
    <OpsShell user={user}>
      <Dashboard rows={await overview()} config={await configStatus()} />
    </OpsShell>
  );
}
