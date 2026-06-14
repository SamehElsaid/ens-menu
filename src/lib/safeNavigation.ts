import { routing } from "@/i18n/routing";
import { stopHolyLoader } from "holy-loader";

export const CLOSE_NAV_OVERLAYS_EVENT = "ensmenu:close-nav-overlays";

const LOCALE_PREFIX = /^\/(ar|en)(?=\/|$)/;

function toAbsoluteUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (typeof window === "undefined") {
    return url;
  }
  return new URL(url, window.location.origin).href;
}

/** Path without locale prefix, query, hash, or trailing slash (except root). */
export function normalizePathname(pathOrUrl: string): string {
  let pathname = pathOrUrl;
  if (pathOrUrl.includes("://")) {
    try {
      pathname = new URL(pathOrUrl).pathname;
    } catch {
      pathname = pathOrUrl;
    }
  } else {
    pathname = pathOrUrl.split("?")[0]?.split("#")[0] ?? pathOrUrl;
  }

  const withoutLocale = pathname.replace(LOCALE_PREFIX, "") || "/";
  if (withoutLocale.length > 1 && withoutLocale.endsWith("/")) {
    return withoutLocale.slice(0, -1);
  }
  return withoutLocale;
}

export function resolveLocaleFromPath(pathOrUrl: string): string {
  let pathname = pathOrUrl;
  if (pathOrUrl.includes("://")) {
    try {
      pathname = new URL(pathOrUrl).pathname;
    } catch {
      pathname = pathOrUrl;
    }
  } else {
    pathname = pathOrUrl.split("?")[0]?.split("#")[0] ?? pathOrUrl;
  }

  const match = pathname.match(LOCALE_PREFIX);
  return match?.[1] ?? routing.defaultLocale;
}

export function isExternalNavigationTarget(anchor: HTMLAnchorElement): boolean {
  const opensExternally = anchor.target && anchor.target !== "_self";
  if (opensExternally || anchor.hasAttribute("download")) {
    return true;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return true;
  }

  try {
    const absolute = toAbsoluteUrl(href);
    if (!absolute.startsWith("http")) {
      return true;
    }
    const currentHost = window.location.hostname.replace(/^www\./, "");
    const targetHost = new URL(absolute).hostname.replace(/^www\./, "");
    return currentHost !== targetHost;
  } catch {
    return true;
  }
}

export function isSameRouteNavigation(
  currentUrl: string,
  targetUrl: string,
  options?: { ignoreSearchParams?: boolean },
): boolean {
  const ignoreSearchParams = options?.ignoreSearchParams ?? true;

  try {
    const current = new URL(toAbsoluteUrl(currentUrl));
    const target = new URL(toAbsoluteUrl(targetUrl));

    if (
      normalizePathname(current.pathname) !== normalizePathname(target.pathname)
    ) {
      return false;
    }

    if (resolveLocaleFromPath(current.href) !== resolveLocaleFromPath(target.href)) {
      return false;
    }

    if (!ignoreSearchParams && current.search !== target.search) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function dispatchCloseNavOverlays(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(CLOSE_NAV_OVERLAYS_EVENT));
}

export function cancelSameRouteNavigation(
  event: Pick<MouseEvent, "preventDefault" | "stopPropagation">,
): void {
  event.preventDefault();
  event.stopPropagation();
  stopHolyLoader();
  dispatchCloseNavOverlays();
}

export function shouldBlockSameRouteClick(
  anchor: HTMLAnchorElement,
  modifierKeys?: Pick<MouseEvent, "ctrlKey" | "metaKey" | "shiftKey" | "altKey">,
): boolean {
  if (modifierKeys?.ctrlKey || modifierKeys?.metaKey || modifierKeys?.shiftKey) {
    return false;
  }

  if (isExternalNavigationTarget(anchor)) {
    return false;
  }

  const href = anchor.href;
  if (!href) {
    return false;
  }

  return isSameRouteNavigation(window.location.href, href);
}

export function createSafeLinkClickHandler(
  options: {
    currentPathname: string;
    currentLocale: string;
    href?: string;
    onSameRoute?: () => void;
    onNavigate?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  },
): (event: React.MouseEvent<HTMLAnchorElement>) => void {
  const { currentPathname, currentLocale, href, onSameRoute, onNavigate } =
    options;

  return (event) => {
    const targetHref =
      href ??
      event.currentTarget.getAttribute("href") ??
      event.currentTarget.href;

    if (!targetHref) {
      onNavigate?.(event);
      return;
    }

    const currentUrl = `${window.location.origin}${currentLocale === routing.defaultLocale ? "" : `/${currentLocale}`}${currentPathname === "/" ? "" : currentPathname}`;

    const sameRoute =
      isSameRouteNavigation(window.location.href, targetHref) ||
      isSameRouteNavigation(currentUrl, targetHref) ||
      normalizePathname(currentPathname) === normalizePathname(targetHref);

    if (sameRoute && resolveLocaleFromPath(targetHref) === currentLocale) {
      event.preventDefault();
      event.stopPropagation();
      stopHolyLoader();
      dispatchCloseNavOverlays();
      onSameRoute?.();
      onNavigate?.(event);
      return;
    }

    onNavigate?.(event);
  };
}
