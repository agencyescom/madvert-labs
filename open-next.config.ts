// OpenNext adapter config for Cloudflare Workers.
// Default: prerendered pages are served from Workers static assets (zero extra setup).
// When Sanity is connected and you want publish-time revalidation to persist, switch to the
// R2 cache (see README → "Cloudflare: enable the R2 cache").
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

const config = defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});

// `npm run build` runs the OpenNext build (so Cloudflare's default build command works),
// and OpenNext runs the plain Next.js build through `build:next` to avoid a loop.
config.buildCommand = "npm run build:next";

export default config;
