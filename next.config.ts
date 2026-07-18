import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});


const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/sitemap-index.xml",
        destination: "/sitemap",
        permanent: true,
      },
      {
        source: "/sitemap.xml",
        destination: "/sitemap",
        permanent: true,
      },
      {
        source: "/sitemap-main.xml",
        destination: "/sitemap-main",
        permanent: true,
      },
      {
        source: "/sitemap-main-ar.xml",
        destination: "/sitemap-main",
        permanent: true,
      },
      {
        source: "/sitemap-main-en.xml",
        destination: "/en/sitemap-main",
        permanent: true,
      },
      {
        source: "/sitemap-knowledge-base.xml",
        destination: "/sitemap-knowledge-base",
        permanent: true,
      },
      {
        source: "/sitemap-knowledge-base-ar.xml",
        destination: "/sitemap-knowledge-base",
        permanent: true,
      },
      {
        source: "/sitemap-knowledge-base-en.xml",
        destination: "/en/sitemap-knowledge-base",
        permanent: true,
      },
      {
        source: "/sitemap-menus-:page(\\d{4})\\.xml",
        destination: "/sitemap-menus/:page",
        permanent: true,
      },
      {
        source: "/sitemap-menus-ar-:page(\\d{4})\\.xml",
        destination: "/sitemap-menus/:page",
        permanent: true,
      },
      {
        source: "/sitemap-menus-en-:page(\\d{4})\\.xml",
        destination: "/en/sitemap-menus/:page",
        permanent: true,
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
      {
        protocol: "https",
        hostname: "ensapi.ensbot.net",
      },
      {
        protocol: "https",
        hostname: "api.ensmenu.com",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withBundleAnalyzer(withNextIntl(nextConfig));
