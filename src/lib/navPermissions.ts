import type { StaffPermissionKey } from "@/types/StaffPermission";

/**
 * Route → permission mapping for the owner dashboard, keyed by the sub-path
 * relative to `/dashboard/:menu`. Shared by the edge proxy and the sidebar so
 * both gate staff access consistently.
 *
 * - `OWNER_ONLY`  → only the menu owner/admin may access (never staff)
 * - permission key → staff must hold this permission (owner/admin always pass)
 * - unmapped routes fall back to `dashboard:access`
 */
export const OWNER_ONLY = "__owner_only__" as const;

export type RoutePermission = StaffPermissionKey | typeof OWNER_ONLY;

export const DASHBOARD_ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  "": "dashboard:access",
  analytics: "analytics:view",
  personal: OWNER_ONLY,
  subscription: OWNER_ONLY,
  "domain-transfer": OWNER_ONLY,
  import: "menu:import",
  categories: "menu:categories",
  items: "menu:items",
  "display-order": "menu:items",
  table: "menu:tables",
  orders: "orders:view",
  "delivery-orders": "delivery:view",
  staff: "staff:manage",
  advertisements: "ads:manage",
  settings: "settings:manage",
  history: "orders:view",
  ratings: "analytics:view",
};

/** Resolves the permission required for a dashboard sub-path (e.g. "settings/design"). */
export function permissionForDashboardSubpath(subpath: string): RoutePermission {
  const clean = subpath.replace(/^\/+|\/+$/g, "");
  if (clean === "") return "dashboard:access";
  if (DASHBOARD_ROUTE_PERMISSIONS[clean]) return DASHBOARD_ROUTE_PERMISSIONS[clean];
  const first = clean.split("/")[0];
  return DASHBOARD_ROUTE_PERMISSIONS[first] ?? "dashboard:access";
}
