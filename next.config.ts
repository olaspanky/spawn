// next.config.ts
import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline", // Use the offline page for document requests
  },
});

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

// Wrap the config with withPWA
export default withPWA(nextConfig);