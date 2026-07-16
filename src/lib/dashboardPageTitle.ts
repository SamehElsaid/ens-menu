import { navSections, type NavItem } from "@/components/Dashboard/data";

export type DashboardTitleRef = {
  namespace: string;
  key: string;
};

/** Path suffix (after /dashboard/:menuId/) → translation ref */
const NESTED_PATH_TITLES: Record<string, DashboardTitleRef> = {
  "settings/design": { namespace: "settingsDesignPage", key: "title" },
  "settings/media": { namespace: "settingsMediaPage", key: "title" },
  import: { namespace: "MenuImport", key: "pageTitle" },
};

/** /dashboard/:segment when segment is not a menu slug */
const TOP_LEVEL_DASHBOARD_SEGMENTS: Record<string, DashboardTitleRef> = {
  advertisements: { namespace: "Dashboard", key: "Advertisements" },
};

function buildSegmentLabelMap(): Record<string, string> {
  const map: Record<string, string> = {};
  const items: NavItem[] = [];

  for (const section of navSections) {
    items.push(...section.items);
  }

  for (const item of items) {
    if (item.link === undefined) continue;
    map[item.link] = item.label;
  }

  return map;
}

const SEGMENT_TO_DASHBOARD_LABEL = buildSegmentLabelMap();

function resolveFromRestPath(rest: string): DashboardTitleRef {
  const nestedKeys = Object.keys(NESTED_PATH_TITLES).sort(
    (a, b) => b.length - a.length,
  );
  for (const path of nestedKeys) {
    if (rest === path || rest.startsWith(`${path}/`)) {
      return NESTED_PATH_TITLES[path];
    }
  }

  const firstSegment = rest.split("/")[0];
  const dashboardLabel = SEGMENT_TO_DASHBOARD_LABEL[firstSegment];

  if (dashboardLabel) {
    return { namespace: "Dashboard", key: dashboardLabel };
  }

  return { namespace: "Dashboard", key: "Overview" };
}

/**
 * Resolve page title from layout segments below `app/.../dashboard/`.
 * e.g. [] → menus list, ["slug"] → overview, ["slug", "analytics"] → analytics
 */
export function resolveDashboardPageTitleFromSegments(
  segments: string[],
): DashboardTitleRef | null {
  if (segments.length === 0) {
    return { namespace: "Menus", key: "title" };
  }

  if (segments.length === 1) {
    const top = TOP_LEVEL_DASHBOARD_SEGMENTS[segments[0]];
    if (top) return top;
    return { namespace: "Dashboard", key: "Overview" };
  }

  return resolveFromRestPath(segments.slice(1).join("/"));
}

/** Strip locale prefix for pathname fallback parsing */
export function normalizeDashboardPathname(pathname: string): string {
  let p = pathname.replace(/\/$/, "") || "/";
  if (p === "/en") return "/";
  if (p.startsWith("/en/")) p = p.slice(3) || "/";
  return p;
}

/**
 * Fallback when layout segments are unavailable.
 */
export function resolveDashboardPageTitleRef(
  pathname: string,
): DashboardTitleRef | null {
  const normalized = normalizeDashboardPathname(pathname);

  if (normalized === "/dashboard") {
    return { namespace: "Menus", key: "title" };
  }

  const menuRoute = normalized.match(/^\/dashboard\/([^/]+)(?:\/(.*))?$/);
  if (!menuRoute) return null;

  const first = menuRoute[1];
  const rest = menuRoute[2] ?? "";

  if (!rest) {
    const top = TOP_LEVEL_DASHBOARD_SEGMENTS[first];
    if (top) return top;
    return { namespace: "Dashboard", key: "Overview" };
  }

  return resolveFromRestPath(rest);
}

export const DASHBOARD_BRAND_TITLE = "ENSmenu";

export function formatDashboardDocumentTitle(pageTitle?: string): string {
  if (!pageTitle?.trim()) return DASHBOARD_BRAND_TITLE;
  return `${DASHBOARD_BRAND_TITLE} - ${pageTitle.trim()}`;
}

/** Keeps the browser tab in sync (Next.js metadata may reset <title> after navigation). */
export function syncDocumentTitle(title: string): void {
  if (typeof document === "undefined") return;

  document.title = title;

  let el = document.head.querySelector("title");
  if (!el) {
    el = document.createElement("title");
    document.head.appendChild(el);
  }
  if (el.textContent !== title) {
    el.textContent = title;
  }
}

export function watchDocumentTitle(
  desiredTitle: string,
  onResync: () => void,
): () => void {
  if (typeof document === "undefined") return () => undefined;

  onResync();

  const titleEl = document.head.querySelector("title");
  const observer = new MutationObserver(() => {
    if (document.title !== desiredTitle) {
      onResync();
    }
  });

  if (titleEl) {
    observer.observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  observer.observe(document.head, {
    childList: true,
    subtree: true,
  });

  const intervalId = window.setInterval(() => {
    if (document.title !== desiredTitle) {
      onResync();
    }
  }, 800);

  return () => {
    observer.disconnect();
    window.clearInterval(intervalId);
  };
}
