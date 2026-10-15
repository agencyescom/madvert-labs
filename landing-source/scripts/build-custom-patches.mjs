#!/usr/bin/env node
/**
 * Builds the static /custom-patches page for the main Madvert Labs site.
 *
 *   npm run build:custom-patches                      → ./dist/custom-patches
 *   npm run build:custom-patches -- --target <dir>    → also replaces <dir> with the build
 *                                                       (e.g. ../madvert-labs/public/custom-patches)
 *
 * Static export can't contain route handlers, so src/app/api is moved aside for the build and
 * always restored. Form submissions go to the main site's /api/custom-patches/leads.
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const api = join(root, "src/app/api");
const parked = join(root, ".api-parked");
const out = join(root, "out");
const dist = join(root, "dist/custom-patches");
const targetIdx = process.argv.indexOf("--target");
const target = targetIdx > -1 ? resolve(process.argv[targetIdx + 1]) : null;

if (existsSync(parked)) throw new Error(`${parked} exists — restore it to src/app/api before building.`);
renameSync(api, parked);
try {
  rmSync(out, { recursive: true, force: true });
  execSync("npx next build", { cwd: root, stdio: "inherit", env: { ...process.env, CUSTOM_PATCHES_EXPORT: "1" } });
} finally {
  renameSync(parked, api);
}

// Drop the export's 404 page (the main site has its own). Keep the __next.*.txt files:
// the Next client prefetches them, and removing them causes 404s.
for (const f of readdirSync(out)) {
  if (f === "404.html" || f.startsWith("_not-found")) rmSync(join(out, f), { recursive: true, force: true });
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(out, dist, { recursive: true });
console.log(`\n✓ Static page written to ${dist}`);

if (target) {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(out, target, { recursive: true });
  console.log(`✓ Copied to ${target}`);
}
