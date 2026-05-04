/**
 * Enforces cashier ACL on dashboard URLs (owner-linked dashboard accounts).
 * Paths must match next-intl `usePathname()` (locale prefix optional).
 */

const FIRST_SUBPATH_TO_PAGE_KEY: Record<string, string> = {
  personal: "personal",
  categories: "categories",
  items: "items",
  table: "table",
  staff: "staff",
  advertisements: "advertisements",
  settings: "settings",
  history: "history",
};

/** Routes under /dashboard that are never for cashiers (owner / legacy). */
const OWNER_ONLY_TOP_SEGMENTS = new Set(["cashiers", "advertisements"]);

export type CashierAcl = {
  menuIds: number[];
  pageKeys: string[];
};

/** Strip /ar or /en prefix from pathname. */
export function stripLocaleFromPath(pathname: string): string {
  const p = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  return p.startsWith("/") ? p : `/${p}`;
}

/**
 * Where to send a cashier when the current URL is not allowed.
 */
export function cashierSafeRedirect(acl: CashierAcl): string {
  const { menuIds, pageKeys } = acl;
  if (!menuIds.length) return "/dashboard";
  const mid = menuIds[0];
  const keys = pageKeys.length ? pageKeys : ["overview"];
  const order: string[] = [
    "overview",
    "personal",
    "categories",
    "items",
    "table",
    "staff",
    "advertisements",
    "settings",
    "history",
  ];
  const pick = order.find((k) => keys.includes(k)) ?? keys[0] ?? "overview";
  if (pick === "overview") return `/dashboard/${mid}`;
  return `/dashboard/${mid}/${pick}`;
}

export type CashierPathResult =
  | { ok: true }
  | { ok: false; redirect: string };

/**
 * Returns whether a cashier may access this pathname.
 */
export function evaluateCashierDashboardPath(
  pathname: string,
  acl: CashierAcl,
): CashierPathResult {
  const p = stripLocaleFromPath(pathname).replace(/\/+$/, "") || "/";
  const { menuIds, pageKeys } = acl;
  if (!menuIds.length || !pageKeys.length) {
    if (p === "/dashboard") return { ok: true };
    return { ok: false, redirect: "/dashboard" };
  }

  const keySet = new Set(pageKeys);

  if (!p.startsWith("/dashboard")) return { ok: true };

  // /dashboard — menu picker
  if (p === "/dashboard") return { ok: true };

  const parts = p.split("/").filter(Boolean);
  // parts: ['dashboard', ...]
  if (parts.length < 2) return { ok: true };

  const top = parts[1];

  if (OWNER_ONLY_TOP_SEGMENTS.has(top)) {
    return { ok: false, redirect: "/dashboard" };
  }

  const menuIdRaw = top;
  if (!/^\d+$/.test(menuIdRaw)) {
    return { ok: false, redirect: cashierSafeRedirect(acl) };
  }

  const menuId = parseInt(menuIdRaw, 10);
  if (!menuIds.includes(menuId)) {
    return { ok: false, redirect: cashierSafeRedirect(acl) };
  }

  // /dashboard/:menuId only → overview
  if (parts.length === 2) {
    if (keySet.has("overview")) return { ok: true };
    return {
      ok: false,
      redirect: `/dashboard/${menuId}${pickFirstAllowedSubpath(keySet)}`,
    };
  }

  const sub = parts[2];
  const pageKey = FIRST_SUBPATH_TO_PAGE_KEY[sub];
  if (!pageKey) {
    return { ok: false, redirect: `/dashboard/${menuId}` };
  }

  if (keySet.has(pageKey)) return { ok: true };

  return {
    ok: false,
    redirect: `/dashboard/${menuId}${pickFirstAllowedSubpath(keySet)}`,
  };
}

function pickFirstAllowedSubpath(keySet: Set<string>): string {
  const order: string[] = [
    "overview",
    "personal",
    "categories",
    "items",
    "table",
    "staff",
    "advertisements",
    "settings",
    "history",
  ];
  const pathSeg: Record<string, string> = {
    overview: "",
    personal: "/personal",
    categories: "/categories",
    items: "/items",
    table: "/table",
    staff: "/staff",
    advertisements: "/advertisements",
    settings: "/settings",
    history: "/history",
  };
  for (const k of order) {
    if (keySet.has(k)) return pathSeg[k] ?? "";
  }
  return "";
}
