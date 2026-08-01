import type { NextConfig } from "next";
const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
