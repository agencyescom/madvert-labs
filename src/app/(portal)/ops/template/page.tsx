import type { Metadata } from "next";
import { connection } from "next/server";
import type { CustomQuestion, TemplateOverride } from "@/onboarding/types";
import { db } from "@/onboarding/server/db";
import { requireOpsPage } from "@/onboarding/server/ops";
import { BUSINESS_SECTIONS, OFFER_SECTIONS } from "@/onboarding/template/questions";
import { OpsShell } from "@/onboarding/ui/ops/OpsKit";
import { TemplateEditor } from "@/onboarding/ui/ops/TemplateEditor";

export const metadata: Metadata = { title: "Onboarding template · Operations" };

export default async function OpsTemplate() {
  await connection();
  const user = await requireOpsPage();
  const sections = [...BUSINESS_SECTIONS, ...OFFER_SECTIONS].map((s) => ({
    key: s.key,
    title: s.title,
    intro: s.intro ?? "",
    questions: s.questions.map((q) => ({ key: q.key, label: q.label, type: q.type, required: Boolean(q.required), help: q.help ?? "" })),
  }));
  return (
    <OpsShell user={user}>
      <TemplateEditor sections={sections} overrides={await db().find<TemplateOverride>("template_overrides")} custom={await db().find<CustomQuestion>("custom_questions")} />
    </OpsShell>
  );
}
