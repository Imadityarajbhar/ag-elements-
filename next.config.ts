import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    // Default deviceSizes is [640,750,828,1080,1200,1920,2048,3840]. 3840 is
    // dropped: a full repo audit of every `sizes` prop in this app (see the
    // image-pipeline audit) found no usage wider than `100vw` on mobile /
    // `50vw` on desktop (the homepage hero is the single `100vw` case) — 2048
    // already covers that comfortably. Trimmed to reduce the space of
    // possible Vercel Image Optimization transformations now that the
    // account's Hobby-plan quota has been exhausted (confirmed via live
    // `402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED` responses in production).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
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
