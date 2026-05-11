import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for the Android wrapper.
 *
 * Two supported strategies, both free:
 *
 *  1. RECOMMENDED — Hosted PWA wrapper.
 *     Deploy the Next.js app on Vercel (free tier), then set:
 *       server: { url: "https://your-app.vercel.app", cleartext: false }
 *     This gives full Next.js routing, server features and instant updates.
 *
 *  2. Local-only static wrapper.
 *     If you refactor to a fully static SPA, run `next build && next export -o out`
 *     and keep `webDir: "out"`. You'll then need to flatten dynamic routes
 *     into query parameters because Next static export doesn't pre-render
 *     unknown dynamic params.
 */
const config: CapacitorConfig = {
  appId: "com.loadmaster.app",
  appName: "Load Master",
  webDir: "out",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false,
  },
  // server: { url: "https://your-loadmaster.vercel.app", cleartext: false },
};

export default config;
