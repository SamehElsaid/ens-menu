import type { Metadata } from "next";
import { localizeHref, routing } from "@/i18n/routing";
import { getSiteOrigin } from "@/lib/sitemap/data";

/**
 * Base URL for canonical and Open Graph URLs.
 * Always resolves to a stable origin (prefers NEXT_PUBLIC_APP_URL, normalizes www).
 */
function getBaseUrl(): string {
  return getSiteOrigin();
}

/**
 * Absolute URL for a locale-agnostic `path` in a given `locale`, without ever
 * introducing a lone trailing slash on the bare origin (e.g. always
 * "https://www.ensmenu.com", never "https://www.ensmenu.com/"). Using `new
 * URL()` for the root path would always add one back, which is what caused
 * the canonical/hreflang mismatch on the homepage — see
 * ensmenu.com-audit/findings/hreflang.md.
 */
function absoluteLocalizedUrl(
  baseUrl: string,
  path: string,
  locale: string,
): string {
  const localizedPath = localizeHref(path ? `/${path}` : "/", locale);
  return localizedPath === "/" ? baseUrl : new URL(localizedPath, baseUrl).href;
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
  const canonicalUrl = baseUrl
    ? absoluteLocalizedUrl(baseUrl, path, locale)
    : undefined;

  // Redundant HTML-level hreflang (in addition to the HTTP Link header next-intl's
  // middleware already emits) so international targeting doesn't have a single
  // point of failure — see ensmenu.com-audit/findings/hreflang.md recommendation #3.
  const languages: Record<string, string> | undefined = baseUrl
    ? Object.fromEntries([
        ...routing.locales.map((loc) => [
          loc,
          absoluteLocalizedUrl(baseUrl, path, loc),
        ]),
        ["x-default", absoluteLocalizedUrl(baseUrl, path, routing.defaultLocale)],
      ])
    : undefined;

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
      locale: locale === "ar" ? "ar_EG" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
          languages,
        }
      : undefined,
  };
}