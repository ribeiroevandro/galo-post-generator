import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    forceSwcTransforms: true,
  },
  images: {
    remotePatterns: [{ hostname: "*.public.blob.vercel-storage.com" }]
  }
};

export default nextConfig;
