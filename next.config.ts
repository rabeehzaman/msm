import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.101"],
  experimental: {
    // Going back to a page opened in the last 30 seconds shows it at once from the phone's memory.
    // Any save clears this (server actions revalidate their pages), so a saved change always shows.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
