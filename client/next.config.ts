import type { NextConfig } from 'next';
import path from 'path';
const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BASE_URL}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${BASE_URL}/auth/:path*`,
      },
    ];
  },
};
export default nextConfig;
