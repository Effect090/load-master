/** @type {import('next').NextConfig} */

/**
 * Content-Security-Policy
 *
 * - script-src needs 'unsafe-inline' + 'unsafe-eval' because Next.js App Router
 *   injects inline scripts for hydration and some bundler internals use eval.
 * - style-src needs 'unsafe-inline' because Tailwind CSS ships inline styles.
 * - img-src allows data: (favicon, chart SVGs) and blob: (jsPDF canvas export).
 * - connect-src includes Supabase (auth/API) when configured.
 * - worker-src blob: 'self' — required by the service worker registration.
 * - frame-ancestors 'none' supersedes X-Frame-Options in modern browsers.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHost = "";
try {
  if (SUPABASE_URL) supabaseHost = new URL(SUPABASE_URL).origin;
} catch {
  /* ignore invalid URL in env */
}
const connectSrc = [
  "'self'",
  "https://*.supabase.co",
  "wss://*.supabase.co",
  // Vercel Analytics & Speed Insights
  "https://*.vercel-insights.com",
  "https://vitals.vercel-insights.com",
];
if (supabaseHost) {
  connectSrc.push(supabaseHost);
  if (supabaseHost.startsWith("https://")) {
    connectSrc.push(supabaseHost.replace("https://", "wss://"));
  }
}

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src ${connectSrc.join(" ")}`,
  "media-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "worker-src blob: 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Clickjacking protection (legacy browsers — modern ones use CSP frame-ancestors)
  { key: "X-Frame-Options", value: "DENY" },
  // Leak less referrer info to third-party origins
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features the app doesn't need
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Force HTTPS for 1 year once visited
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // DNS prefetch for performance (safe)
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // The actual CSP
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
