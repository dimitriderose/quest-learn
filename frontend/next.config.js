/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Disable ESLint during build for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checks during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  reactStrictMode: true,
  
  // Read env vars from environment
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
}

module.exports = nextConfig
