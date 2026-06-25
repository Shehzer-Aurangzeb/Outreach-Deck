import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Outfit } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Outreach Deck",
    template: "%s · Outreach Deck",
  },
  description:
    "A personal tool for managing job-search networking — daily LinkedIn outreach, AI-drafted messages, and a contact pipeline.",
  applicationName: "Outreach Deck",
  authors: [{ name: "Shehzer Abbasi" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Outreach Deck",
    description:
      "A personal tool for managing job-search networking — daily LinkedIn outreach, AI-drafted messages, and a contact pipeline.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Outreach Deck",
    description:
      "A personal tool for managing job-search networking — daily LinkedIn outreach, AI-drafted messages, and a contact pipeline.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b", // --color-void
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
