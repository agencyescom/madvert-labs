import type { Metadata } from "next";
import { connection } from "next/server";
import { GUIDE_PLATFORMS } from "@/onboarding/guides/defaults";
import { getGuides, resolveGuides } from "@/onboarding/server/guides";
import { requireOpsPage } from "@/onboarding/server/ops";
import { getSettings, publicIntegrations } from "@/onboarding/server/settings";
import { GuideEditor } from "@/onboarding/ui/ops/GuideEditor";
import { OpsShell } from "@/onboarding/ui/ops/OpsKit";

export const metadata: Metadata = { title: "Guides · Operations" };

export default async function OpsGuides() {
  await connection();
  const user = await requireOpsPage("admin");
  const raw = await getGuides();
  const preview = resolveGuides(raw, publicIntegrations(await getSettings()));
  const steps = raw.map((g, i) => ({ ...g, screenshotUrl: preview[i].screenshotUrl, screenshotKey: undefined }));
  return (
    <OpsShell user={user}>
      <GuideEditor steps={steps} platforms={GUIDE_PLATFORMS} />
    </OpsShell>
  );
}
