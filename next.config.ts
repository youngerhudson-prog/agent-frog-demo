import type { NextConfig } from "next";

// Standalone demo: no server code, no data, no external services. Mirrors offerready's Tailwind setup.
const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
