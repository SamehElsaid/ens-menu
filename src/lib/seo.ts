import type { Metadata } from "next";

const DEFAULT_LOCALE = "ar";

/**
 * Base URL for canonical and Open Graph URLs.
 * Set NEXT_PUBLIC_APP_URL in .env (e.g. https://ensmenu.com)
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

/** Deduplicated merge of comma-separated keyword strings (case-insensitive). */
export function mergeSeoKeywords(...parts: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    for (const k of part.split(",").map((s) => s.trim()).filter(Boolean)) {
      const key = k.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(k);
      }
    }
  }
  return result;
}

export type SeoInput = {
  locale: string;
  path: string;
  title: string;
  description: string;
  keywords: string;
  /** Global terms appended to every public page (e.g. free, electronic menu, QR code). */
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
  const baseUrl = getBaseUrl();
  const canonicalPath =
    locale === DEFAULT_LOCALE ? (path ? `/${path}` : "/") : path ? `/${path}` : `/${locale}`;
  const canonicalUrl = baseUrl ? new URL(canonicalPath, baseUrl).href : undefined;
  const arPath = path ? `/${path}` : "/";
  const enPath = path ? `/en/${path}` : "/en";
  const mergedKeywords = mergeSeoKeywords(coreKeywords, keywords);

  return {
    title,
    description,
    keywords: mergedKeywords,
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

export function getSeoBaseUrl(): string {
  return getBaseUrl();
}
