import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com"
      },
      {
        protocol: "https",
        hostname: "picsum.photos"
      },
      {
        protocol: "https",
        hostname: "undraw.co"
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com"
      }
    ]
  }
};

export default nextConfig;
