import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: Do NOT set output: "standalone" on Vercel — Vercel manages its own output format.
  // output: "standalone" is only for self-hosted / Docker deployments.

  // Use Turbopack (default in Next.js 16) with an empty config to silence warnings
  turbopack: {},
};

export default nextConfig;
