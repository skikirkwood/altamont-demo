import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en-US", "en-CA", "fr-CA"],
    defaultLocale: "en-US",
  },
  /** Some preview setups mistakenly use `/blog/api/draft`; Next.js only serves `/api/draft`. */
  async rewrites() {
    return [{ source: "/blog/api/draft", destination: "/api/draft" }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
    ],
  },
};

export default nextConfig;
