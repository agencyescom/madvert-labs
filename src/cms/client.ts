import { createClient, type SanityClient } from "@sanity/client";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-01-01",
};

export const cmsEnabled = Boolean(sanityConfig.projectId);

let readClient: SanityClient | null = null;

export function getReadClient(): SanityClient | null {
  if (!cmsEnabled) return null;
  readClient ??= createClient({
    projectId: sanityConfig.projectId!,
    dataset: sanityConfig.dataset,
    apiVersion: sanityConfig.apiVersion,
    useCdn: !process.env.SANITY_API_READ_TOKEN,
    token: process.env.SANITY_API_READ_TOKEN,
    perspective: "published",
  });
  return readClient;
}

export function getWriteClient(): SanityClient | null {
  if (!cmsEnabled || !process.env.SANITY_API_WRITE_TOKEN) return null;
  return createClient({
    projectId: sanityConfig.projectId!,
    dataset: sanityConfig.dataset,
    apiVersion: sanityConfig.apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
  });
}
