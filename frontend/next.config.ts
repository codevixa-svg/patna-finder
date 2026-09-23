import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Hostinger deployment
  output: 'export',
  
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      // Laravel API uploads in dev (http://localhost:8000/storage/...).
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
      // Production: Backend API subdomain
      {
        protocol: 'https',
        hostname: 'patnafinderapi.codevixa.com',
        pathname: '/**',
      },
      // Frontend subdomain
      {
        protocol: 'https',
        hostname: 'patna-finder.codevixa.com',
        pathname: '/**',
      },
      // Admin-provided external image URLs
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
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
