import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/sitemap/data";

export default function robots(): MetadataRoute.Robots {
  const siteOrigin = getSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/en/dashboard",
        "/admin",
        "/en/admin",
        "/auth",
        "/en/auth",
        "/payment",
        "/en/payment",
        "/unauthorized",
        "/en/unauthorized",
      ],
    },
    // One entry point per locale (Google recommendation for multilingual sites)
    sitemap: [`${siteOrigin}/sitemap`, `${siteOrigin}/en/sitemap`],
    host: siteOrigin.replace(/^https?:\/\//, ""),
  };
}
