/**
 * Image loader for Cloudflare Workers (no platform image optimizer needed).
 * - Sanity CDN images are resized and converted on Sanity's CDN (w, q, auto=format).
 * - Local images in /public are already pre-sized WebP/JPG and are served as static assets.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://cdn.sanity.io/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 80));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  }
  // Width hint keeps srcset entries distinct; static asset serving ignores the query string.
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
