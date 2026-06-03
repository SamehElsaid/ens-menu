import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/sitemap-menus-:page(\\d{4})\\.xml",
        destination: "/sitemap-menus/:page",
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.easykash.net",
        pathname: "/assets/images/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withBundleAnalyzer(withNextIntl(nextConfig));
