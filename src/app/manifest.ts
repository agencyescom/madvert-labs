import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Madvert",
    description: site.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1c",
    theme_color: "#0a0f1c",
    icons: [{ src: "/brand/app-icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
