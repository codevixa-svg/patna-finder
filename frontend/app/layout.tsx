import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "Patna Finder - Discover Patna's Best Businesses & Hidden Gems",
  description: "Find trusted businesses, compare services, read reviews, and explore Patna like never before. Your premium local discovery platform.",
  keywords: "Patna, business directory, local services, restaurants, doctors, coaching institutes, hidden gems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
