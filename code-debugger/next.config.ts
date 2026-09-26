import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/codespaces-blank",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
