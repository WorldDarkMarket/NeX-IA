import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Permitir origens de desenvolvimento cross-origin
  allowedDevOrigins: [
    "preview-chat-5dbeaab1-1c98-4306-867e-08a76de81f2d.space.z.ai",
  ],
};

export default nextConfig;
