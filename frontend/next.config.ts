import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep normal server rendering for local development. Use static export only
  // for a production build deployed to shared hosting.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,

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
