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
        "/unauthorized",
        "/en/unauthorized",
      ],
    },
    sitemap: `${siteOrigin}/sitemap-index.xml`,
    host: siteOrigin.replace(/^https?:\/\//, ""),
  };
}
