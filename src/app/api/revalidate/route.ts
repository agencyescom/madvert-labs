import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/** Sanity webhook target: POST with header "x-revalidate-secret" and body { "_type": "caseStudy" }. */
export async function POST(req: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  const given = req.headers.get("x-revalidate-secret") ?? "";
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { _type?: string };
  const tag = body._type && /^[a-zA-Z]{2,40}$/.test(body._type) ? body._type : "cms";
  revalidateTag(tag, "max");
  if (tag !== "cms") revalidateTag("cms", "max");
  return NextResponse.json({ ok: true, revalidated: tag });
}
