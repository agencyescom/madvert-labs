import type { Metadata } from "next";
import { connection } from "next/server";
import { configStatus, requireOpsPage } from "@/onboarding/server/ops";
import { getSettings } from "@/onboarding/server/settings";
import { OpsShell } from "@/onboarding/ui/ops/OpsKit";
import { SettingsForm } from "@/onboarding/ui/ops/SettingsForm";

export const metadata: Metadata = { title: "Settings · Operations" };

export default async function OpsSettings() {
  await connection();
  const user = await requireOpsPage("admin");
  return (
    <OpsShell user={user}>
      <SettingsForm initial={await getSettings()} config={await configStatus()} />
    </OpsShell>
  );
}
