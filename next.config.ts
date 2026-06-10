import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Vercel deployment
  output: "standalone",

  // Suppress pdfkit canvas warning (optional peer dep not needed for server-side PDF gen)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];
    }
    return config;
  },
};

export default nextConfig;
