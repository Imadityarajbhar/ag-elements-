import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'ag-elements.test',
      },
      {
        protocol: 'https',
        hostname: 'ag-elements.test',
      },
      {
        protocol: 'https',
        hostname: 'agelements.in',
      }
    ],
  },
};

export default nextConfig;
