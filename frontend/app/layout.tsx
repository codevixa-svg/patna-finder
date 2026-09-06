import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Patna Finder - Discover Patna's Best Businesses & Hidden Gems",
    template: "%s | Patna Finder",
  },
  description:
    "Find trusted businesses, compare services, read reviews, and explore Patna like never before. Your premium local discovery platform.",
  keywords:
    "Patna, business directory, local services, restaurants, doctors, coaching institutes, hidden gems",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Patna Finder",
    url: siteUrl,
  },
  // Google Discover: allow large image previews in cards (Chrome / feed)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // RSS feed powers the "Follow" button inside Google Discover
  alternates: {
    types: {
      "application/rss+xml": `${siteUrl}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. QuickBooks injects
    // `data-qb-installed` on <html>) mutate <html>/<body> before React
    // hydrates, causing false-positive attribute mismatch errors.
    // This only suppresses warnings for these two elements' own attributes —
    // hydration mismatches deeper in the tree are still reported.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
