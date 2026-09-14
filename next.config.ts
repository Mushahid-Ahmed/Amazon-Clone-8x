import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
  webpack: (config, { dev }) => {
    // The dev watcher must not observe the SQLite database or test artifacts:
    // every session/cart/order mutation writes to prisma/dev.db, and each write
    // used to trigger a root rebuild + Fast Refresh full reload, tearing down
    // in-flight navigations. Ignoring them keeps the dev server stable.
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/prisma/*.db",
          "**/prisma/*.db-journal",
          "**/prisma/*.db-wal",
          "**/prisma/*.db-shm",
          "**/test-results/**",
          "**/.agent-logs/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
