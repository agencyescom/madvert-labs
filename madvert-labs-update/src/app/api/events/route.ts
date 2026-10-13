import { after, NextResponse } from "next/server";
import { z } from "zod";
import { attributionSchema } from "@/forms/schemas";
import { getLeadMagnet } from "@/content/lead-magnets";
import { clientIp, rateLimit } from "@/integrations/rate-limit";
import { dispatchEvent } from "@/integrations/webhooks";

const schema = z.object({
  event: z.enum(["calendar_opened", "calendar_booked"]),
  leadMagnet: z.string().max(120).optional(),
  context: z.string().max(80).optional(),
  page: z.string().max(300).optional(),
  attribution: attributionSchema,
});

/** Funnel hooks from the browser (calendar opened / booked) forwarded to the configured CRM webhooks. */
export async function POST(req: Request) {
  const limit = await rateLimit(`events:${clientIp(req)}`, 30, 600);
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });
  const d = parsed.data;
  const lm = d.leadMagnet ? getLeadMagnet(d.leadMagnet) : undefined;
  after(() =>
    dispatchEvent({
      event: `madvert.${d.event}`,
      occurred_at: new Date().toISOString(),
      page: d.page,
      context: d.context,
      lead_magnet: lm?.title,
      lead_source: lm?.sourceId,
      ...d.attribution,
    }),
  );
  return NextResponse.json({ ok: true });
}
