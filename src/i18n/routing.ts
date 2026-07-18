import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["ar", "en"],

  // Used when no locale matches — Arabic is the default
  defaultLocale: "ar",

  // Don't use browser language; always use default (ar) when no locale in URL
  localeDetection: false,

  // Arabic lives at `/`, English at `/en` — never keep `/ar` in the URL
  localePrefix: "as-needed",
});

/** URL prefix for a locale (`""` for default `ar`, `"/en"` for English). */
export function localePathPrefix(locale: string): string {
  return locale === routing.defaultLocale ? "" : `/${locale}`;
}

/**
 * Build a localized href with as-needed prefixing.
 * Examples: ("/dashboard", "ar") → "/dashboard"; ("/", "en") → "/en"
 */
export function localizeHref(path: string, locale: string): string {
  const normalized =
    !path || path === "/"
      ? "/"
      : path.startsWith("/")
        ? path
        : `/${path}`;
  const prefix = localePathPrefix(locale);
  if (!prefix) return normalized;
  return normalized === "/" ? prefix : `${prefix}${normalized}`;
}
