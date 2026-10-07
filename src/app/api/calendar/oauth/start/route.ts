import { NextResponse } from "next/server";
import { timingSafeEqual, randomBytes } from "node:crypto";
import { authUrl } from "@/integrations/google-calendar";

/** One-time owner authorisation. Visit /api/calendar/oauth/start?secret=CALENDAR_SETUP_SECRET */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.CALENDAR_SETUP_SECRET;
  const given = url.searchParams.get("secret") ?? "";
  if (!secret || !process.env.GOOGLE_CLIENT_ID || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(authUrl(url.origin, state));
  res.cookies.set("mv_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/api/calendar/oauth" });
  return res;
}
