import { requireOps } from "@/onboarding/server/auth";
import { audit } from "@/onboarding/server/events";
import { handle, json } from "@/onboarding/server/http";
import { onboardingPdf, pdfFileName } from "@/onboarding/server/pdf";
import { loadContext } from "@/onboarding/server/repo";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireOps();
    const { id } = await params;
    const ctx = await loadContext(id);
    if (!ctx) return json({ error: "Not found" }, 404);
    const bytes = await onboardingPdf(ctx);
    await audit({ onboardingId: id, actor: `team:${user}`, action: "pdf.generated" });
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFileName(ctx.onboarding.companyName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  });
}
