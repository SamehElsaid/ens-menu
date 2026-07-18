import type { Metadata } from "next";
import { localizeHref } from "@/i18n/routing";

/**
 * Base URL for canonical and Open Graph URLs.
 * Set NEXT_PUBLIC_APP_URL in .env (e.g. https://ensmenu.com)
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

export type SeoInput = {
  locale: string;
  path: string;
  title: string;
  description: string;
  keywords: string;
  coreKeywords?: string;
  siteName: string;
  robots?: "index, follow" | "noindex, nofollow";
};

/**
 * Builds full SEO metadata for a page (Open Graph, Twitter, alternates, keywords).
 * path: segment without locale, e.g. "" for home, "auth/login" for login (localePrefix as-needed).
 */
export function buildSeoMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  coreKeywords,
  siteName,
  robots = "index, follow",
}: SeoInput): Metadata {
  const mergedKeywords = [keywords, coreKeywords].filter(Boolean).join(",");
  const baseUrl = getBaseUrl();
  const canonicalPath = localizeHref(path ? `/${path}` : "/", locale);
  const canonicalUrl = baseUrl ? new URL(canonicalPath, baseUrl).href : undefined;

  return {
    title: { absolute: title },
    description,
    keywords: mergedKeywords.split(",").map((k) => k.trim()).filter(Boolean),
    robots,
    openGraph: {
      type: "website",
      title,
      description,
      siteName,
      url: canonicalUrl,
      // Each locale is treated as its own site — no cross-locale alternates
      locale: locale === "ar" ? "ar_EG" : "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
  };
}