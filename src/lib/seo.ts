import type { Metadata } from "next";

const DEFAULT_LOCALE = "ar";

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
  siteName,
  robots = "index, follow",
}: SeoInput): Metadata {
  const baseUrl = getBaseUrl();
  const canonicalPath =
    locale === DEFAULT_LOCALE ? (path ? `/${path}` : "/") : path ? `/${locale}/${path}` : `/${locale}`;
  const canonicalUrl = baseUrl ? new URL(canonicalPath, baseUrl).href : undefined;
  const arPath = path ? `/${path}` : "/";
  const enPath = path ? `/en/${path}` : "/en";

  return {
    title,
    description,
    keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
    robots,
    openGraph: {
      type: "website",
      title,
      description,
      siteName,
      url: canonicalUrl,
      locale: locale === "ar" ? "ar_EG" : "en_GB",
      alternateLocale: locale === "ar" ? "en_GB" : "ar_EG",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: baseUrl
      ? {
          canonical: canonicalUrl,
          languages: {
            ar: new URL(arPath, baseUrl).href,
            en: new URL(enPath, baseUrl).href,
          },
        }
      : undefined,
  };
}
