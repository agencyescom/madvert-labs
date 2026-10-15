import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for Madvert Operations: no session cookie → straight to sign in (HTTP 307).
 * The session itself is verified (signature + expiry) on the server in every Operations page and API route.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/ops/login")) return NextResponse.next();
  if (!request.cookies.get("mv_ops")?.value) return NextResponse.redirect(new URL("/ops/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/ops", "/ops/:path*"] };
