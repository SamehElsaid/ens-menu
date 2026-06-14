"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useMemo } from "react";
import {
  dispatchCloseNavOverlays,
  isSameRouteNavigation,
  normalizePathname,
} from "@/lib/safeNavigation";
import { routing } from "@/i18n/routing";

type RouterHref = Parameters<ReturnType<typeof useRouter>["push"]>[0];
type RouterOptions = Parameters<ReturnType<typeof useRouter>["push"]>[1];

function hrefToPath(href: RouterHref, locale: string): string {
  if (typeof href === "string") {
    const base =
      locale === routing.defaultLocale ? "" : `/${locale}`;
    const path = href.startsWith("/") ? href : `/${href}`;
    return `${typeof window !== "undefined" ? window.location.origin : ""}${base}${path === "/" ? "" : path}`;
  }

  const pathname = href.pathname ?? "/";
  const base =
    locale === routing.defaultLocale ? "" : `/${locale}`;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const search = href.query
    ? `?${new URLSearchParams(href.query as Record<string, string>).toString()}`
    : "";
  return `${typeof window !== "undefined" ? window.location.origin : ""}${base}${path === "/" ? "" : path}${search}`;
}

function isSameProgrammaticRoute(
  currentPathname: string,
  currentLocale: string,
  href: RouterHref,
  targetLocale?: string,
): boolean {
  const nextLocale = targetLocale ?? currentLocale;
  if (nextLocale !== currentLocale) {
    return false;
  }

  const targetPath =
    typeof href === "string"
      ? normalizePathname(href)
      : normalizePathname(href.pathname ?? "/");

  return normalizePathname(currentPathname) === targetPath;
}

export function useSafeRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  return useMemo(() => {
    const push = (href: RouterHref, options?: RouterOptions) => {
      const targetLocale = options?.locale ?? locale;
      if (isSameProgrammaticRoute(pathname, locale, href, targetLocale)) {
        dispatchCloseNavOverlays();
        return;
      }

      const targetUrl = hrefToPath(href, targetLocale);
      if (isSameRouteNavigation(window.location.href, targetUrl)) {
        dispatchCloseNavOverlays();
        return;
      }

      router.push(href, options);
    };

    const replace = (href: RouterHref, options?: RouterOptions) => {
      const targetLocale = options?.locale ?? locale;
      if (isSameProgrammaticRoute(pathname, locale, href, targetLocale)) {
        dispatchCloseNavOverlays();
        return;
      }

      const targetUrl = hrefToPath(href, targetLocale);
      if (isSameRouteNavigation(window.location.href, targetUrl)) {
        dispatchCloseNavOverlays();
        return;
      }

      router.replace(href, options);
    };

    return { ...router, push, replace };
  }, [router, pathname, locale]);
}
