import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cms.agelements.in',
      }
      // Note: the bare `agelements.in` apex domain (the Next.js frontend
      // itself, pre-migration home of the WordPress install) was removed —
      // confirmed unused by both a full repo search and a live crawl of all
      // 114 published products (0/386 image URLs reference it). It now
      // returns a Vercel-edge 403 for /wp-content paths, not a normal 404,
      // so leaving it whitelisted only made a future regression harder to
      // diagnose. See the image pipeline audit report for the verification.
    ],
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig);
