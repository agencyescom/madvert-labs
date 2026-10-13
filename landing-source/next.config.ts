import type { NextConfig } from "next";

/**
 * Two build modes:
 *
 * - default (`npm run build`): a normal Next.js server build with the /api/apply route.
 * - `npm run build:custom-patches`: a static export for www.madvertlabs.com/custom-patches.
 *   `basePath` makes Next emit every script, chunk-loader, font and CSS URL under
 *   /custom-patches, so the output can be dropped into the main site's
 *   public/custom-patches/ folder without hand-editing generated bundles.
 *   Form submissions then go to the main site's /api/custom-patches/leads route.
 */
const EXPORT = process.env.CUSTOM_PATCHES_EXPORT === "1";
const BASE_PATH = EXPORT ? "/custom-patches" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(EXPORT
    ? {
        output: "export" as const,
        basePath: BASE_PATH,
        trailingSlash: false,
        images: { unoptimized: true },
      }
    : {
        images: {
          formats: ["image/avif", "image/webp"],
          deviceSizes: [390, 640, 768, 1024, 1280, 1440, 1920],
        },
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "Referrer-Policy", value: "origin-when-cross-origin" },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-DNS-Prefetch-Control", value: "on" },
                { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
              ],
            },
          ];
        },
      }),
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
    NEXT_PUBLIC_LEADS_ENDPOINT: process.env.NEXT_PUBLIC_LEADS_ENDPOINT || (EXPORT ? "/api/custom-patches/leads" : "/api/apply"),
  },
};

export default nextConfig;
