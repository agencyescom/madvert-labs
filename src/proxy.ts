import { NextResponse, type NextRequest } from "next/server";

/**
 * 1. Subdomain: when ONBOARDING_HOST is set (e.g. onboarding.madvertlabs.com), that host serves only
 *    the onboarding portal, Madvert Operations and the Offer Builder; marketing pages redirect to the
 *    main site, and portal paths on the main site redirect to the subdomain. Same Vercel project.
 * 2. Optimistic gate for Operations: no session cookie → sign in (307). The session itself is
 *    verified on the server in every Operations page and API route.
 */

const PORTAL = /^\/(onboarding|ops|offer-builder|offer)(\/|$)/;
const SHARED = /^\/(api|_next|brand|images|icon|apple-icon|manifest|robots|favicon)/;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const portalHost = process.env.ONBOARDING_HOST?.toLowerCase();
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const signedIn = Boolean(request.cookies.get("mv_ops")?.value);

  if (portalHost) {
    const mainSite = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://madvertlabs.com").replace(/\/$/, "");
    if (host === portalHost) {
      if (pathname === "/") return NextResponse.redirect(new URL(signedIn ? "/ops/onboarding" : "/offer-builder", request.url));
      if (!PORTAL.test(pathname) && !SHARED.test(pathname) && !/\.\w{2,5}$/.test(pathname)) return NextResponse.redirect(`${mainSite}${pathname}${search}`, 308);
    } else if (PORTAL.test(pathname) && !host.startsWith("localhost") && !host.endsWith(".vercel.app")) {
      return NextResponse.redirect(`https://${portalHost}${pathname}${search}`, 308);
    }
  }

  if (pathname === "/ops" || pathname.startsWith("/ops/")) {
    if (pathname.startsWith("/ops/login") || pathname.startsWith("/ops/invite/")) return NextResponse.next();
    if (!signedIn) return NextResponse.redirect(new URL("/ops/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|mp4|webm|pdf|txt|xml|js|css|woff2?)$).*)"] };
