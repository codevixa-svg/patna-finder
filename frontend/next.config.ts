import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export disabled - causes issues with dynamic client-side routes
  // Use standard Next.js build and deploy to platform that supports it (Vercel, Netlify)
  // OR manually copy .next/static and public folders for static hosting
  // output: process.env.NODE_ENV === "production" ? "export" : undefined,
  
  // Keep trailing slash for better static hosting compatibility
  trailingSlash: true,

  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      // Laravel API uploads in local development.
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
      // Production API and frontend hosts.
      {
        protocol: "https",
        hostname: "patnafinderapi.codevixa.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "patna-finder.codevixa.com",
        pathname: "/**",
      },
      // Admin-provided external image URLs.
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;
