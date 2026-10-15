import type { Metadata } from "next";
import { connection } from "next/server";
import { requireOpsPage } from "@/onboarding/server/ops";
import { getSettings } from "@/onboarding/server/settings";
import { SERVICES } from "@/onboarding/template/services";
import { CreateForm } from "@/onboarding/ui/ops/CreateForm";
import { OpsShell } from "@/onboarding/ui/ops/OpsKit";

export const metadata: Metadata = { title: "New onboarding · Operations" };

export default async function NewOnboarding() {
  await connection();
  const user = await requireOpsPage();
  const s = await getSettings();
  return (
    <OpsShell user={user}>
      <CreateForm services={Object.entries(SERVICES).map(([key, v]) => ({ key, label: v.label }))} defaults={s.defaults} emailEnabled={Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)} />
    </OpsShell>
  );
}
