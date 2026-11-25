import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blog", destination: "/thoughts", permanent: true },
      { source: "/blog/:slug", destination: "/thoughts/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
