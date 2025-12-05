import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "thread-stream", "@walletconnect/logger"],

  // Empty turbopack config to silence the warning (dev uses Turbopack by default)
  turbopack: {},

  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
    ],
  },

  // Webpack config for production builds
  webpack: (config) => {
    config.module.rules.push({
      test: /node_modules\/(thread-stream|pino)\/test\//,
      use: "null-loader",
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      "thread-stream/test": false,
    };

    return config;
  },
};

export default nextConfig;
