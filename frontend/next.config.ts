import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Read env vars from root .env.local
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;
