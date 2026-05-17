import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Load Master — HVAC load calculator",
  description:
    "Fast, transparent HVAC heating and cooling load calculations for multi-zone buildings. Free, local-first.",
  manifest: "/manifest.webmanifest",
  applicationName: "Load Master",
  appleWebApp: {
    capable: true,
    title: "Load Master",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Load Master — HVAC load calculator",
    description:
      "Fast, transparent heating and cooling load calculations for multi-zone buildings. Free, local-first, no login.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Load Master — HVAC load calculator",
    description:
      "Fast, transparent heating and cooling load calculations. Free, open-source.",
  },
  keywords: [
    "HVAC",
    "heating load",
    "cooling load",
    "load calculation",
    "HVAC calculator",
    "building energy",
    "thermal load",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
