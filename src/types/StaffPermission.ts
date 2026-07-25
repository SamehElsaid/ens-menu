/**
 * Staff RBAC permission keys — must stay in sync with the backend catalog
 * (`ens-menu-back/src/config/staffPermissions.catalog.ts`). Human labels are
 * resolved via next-intl using `StaffPermissions.keys.<key>`.
 */
export const STAFF_PERMISSION_KEYS = [
  "orders:view",
  "orders:confirm",
  "orders:cancel",
  "orders:edit_items",
  "orders:prepare",
  "orders:deliver",
  "orders:complete",
  "dashboard:access",
  "menu:view",
  "menu:categories",
  "menu:items",
  "menu:tables",
  "menu:import",
  "delivery:view",
  "staff:manage",
  "settings:manage",
  "analytics:view",
  "ads:manage",
] as const;

export type StaffPermissionKey = (typeof STAFF_PERMISSION_KEYS)[number];

/**
 * Kept in the catalog for backwards compatibility but no longer enforced: any
 * staff member may sign in from either surface and open the dashboard shell.
 * Mirrors `NON_GATING_PERMISSIONS` in the backend catalog.
 */
export const NON_GATING_PERMISSIONS: ReadonlySet<string> = new Set([
  "dashboard:access",
]);

export function isNonGatingPermission(permission: string): boolean {
  return NON_GATING_PERMISSIONS.has(permission);
}

export type StaffPermissionGroup =
  | "orders"
  | "menu"
  | "dashboard"
  | "delivery"
  | "staff"
  | "settings"
  | "analytics"
  | "ads";

export interface StaffPermissionCatalogEntry {
  key: string;
  labelKey: string;
  descriptionKey: string;
  group: StaffPermissionGroup;
  dependsOn: string[];
}

export interface StaffPermissionCatalog {
  groups: StaffPermissionGroup[];
  permissions: StaffPermissionCatalogEntry[];
}
