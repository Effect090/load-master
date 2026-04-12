import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "CasaFoot – Play Football in Casablanca",
  description:
    "Find matches, join games, build your player card. The social football app for Casablanca.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "CasaFoot",
    description: "Play football in Casablanca. Join matches, build your player card.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#07090F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-[#07090F] text-cf-text antialiased font-sans">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
