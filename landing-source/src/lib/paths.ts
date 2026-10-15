/**
 * Public asset URLs. The page is deployed under a sub-path (www.madvertlabs.com/custom-patches),
 * so every file in /public must be requested with the base path. next/image does not add it for
 * unoptimised static exports, and hand-written URLs never get it — always go through `asset()`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const asset = (path: string) => `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
