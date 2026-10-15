import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Two root layouts (marketing site + onboarding portal) need a global 404.
  experimental: { globalNotFound: true },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [40, 75, 85],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // The /custom-patches landing page is a static export in public/custom-patches (source: landing-source/).
  async rewrites() {
    return [{ source: "/custom-patches", destination: "/custom-patches/index.html" }];
  },
  async redirects() {
    return [
      { source: "/case-studies/better-leads-not-more-leads", destination: "/case-studies", permanent: true },
      { source: "/case-studies/ads-working-follow-up-not", destination: "/case-studies", permanent: true },
      { source: "/case-studies/strong-business-weak-presence", destination: "/case-studies", permanent: true },
      { source: "/resources/seo-and-ai-search-guide", destination: "/resources/seo-ai-search-playbook", permanent: true },
      { source: "/resources/seo-ai-search-guide", destination: "/resources/seo-ai-search-playbook", permanent: true },
      { source: "/resources/madvert-studios-portfolio", destination: "/resources/madvert-studios-showreel", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Private portal: never cached or indexed, and the bearer link never leaks through Referer.
      {
        source: "/(onboarding|ops)/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
