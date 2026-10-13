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
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // The /custom-patches landing page is a static export in public/custom-patches (source: landing-source/).
  async rewrites() {
    return [{ source: "/custom-patches", destination: "/custom-patches/index.html" }];
  },
  async redirects() {
    return [
      { source: "/resources/seo-and-ai-search-guide", destination: "/resources/seo-ai-search-playbook", permanent: true },
      { source: "/resources/seo-ai-search-guide", destination: "/resources/seo-ai-search-playbook", permanent: true },
      { source: "/resources/madvert-studios-portfolio", destination: "/resources/madvert-studios-showreel", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
