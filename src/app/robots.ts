import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/sitemap/data";

export default function robots(): MetadataRoute.Robots {
  const siteOrigin = getSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /auth is intentionally NOT disallowed here: every /auth/* page already
      // sets a "noindex, nofollow" meta tag in its own metadata. Blocking it in
      // robots.txt would prevent Google from ever crawling the page to see that
      // tag, which — per Google's own guidance — means a URL discovered via an
      // external link could still surface in search results with no snippet.
      // Allowing the crawl lets the noindex meta tag actually do its job.
      disallow: [
        "/dashboard",
        "/en/dashboard",
        "/admin",
        "/en/admin",
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
