/**
 * Generates public/sw.js from public/sw.template.js, stamping in a unique
 * build version so returning users always receive the latest cached assets.
 *
 * public/sw.js is .gitignore-d (generated artifact).
 * public/sw.template.js is the source of truth tracked in git.
 *
 * Called automatically via the "prebuild" npm script.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dir, "../public");

const template = readFileSync(resolve(pub, "sw.template.js"), "utf-8");

// Use VERCEL_GIT_COMMIT_SHA when available (Vercel sets this at build time),
// fall back to a millisecond timestamp for local builds.
const buildId = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? Date.now().toString(36);
const version = `load-master-${buildId}`;

const output = template.replace("BUILD_VERSION", version);
writeFileSync(resolve(pub, "sw.js"), output, "utf-8");

console.log(`[sw] Generated public/sw.js with CACHE="${version}"`);
