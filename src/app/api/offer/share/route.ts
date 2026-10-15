import { handle, json, sameOrigin, body } from "@/onboarding/server/http";
import { createOfferShare, sanitizeOfferInput, shareBase } from "@/onboarding/server/offers";
import { clientIp, rateLimit } from "@/integrations/rate-limit";

/** Public Offer Builder: save an offer and return a shareable link. */
export async function POST(req: Request) {
  return handle(async () => {
    if (!sameOrigin(req)) return json({ error: "Invalid origin" }, 403);
    if (!(await rateLimit(`offer-share:${clientIp(req)}`, 12, 3600)).ok) return json({ error: "Too many offers shared in the last hour. Try again later." }, 429);
    const b = await body<{ input: unknown }>(req);
    const input = sanitizeOfferInput(b.input);
    if (!input.outcome || !input.product) return json({ error: "Add at least what you sell and the outcome first." }, 400);
    const rec = await createOfferShare(input, "public");
    return json({ ok: true, url: `${shareBase(req)}/offer/${rec.id}` });
  });
}
