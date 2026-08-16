import type { AdminPermissionKey } from "@/types/AdminPermission";

/** Map admin route segment to permission key */
export function adminRouteToPermission(
  pathname: string,
): AdminPermissionKey | null {
  const normalized = pathname.replace(/\/$/, "");
  if (normalized === "/admin" || normalized.endsWith("/admin/personal")) {
    return null;
  }

  const match = normalized.match(/\/admin\/([^/]+)/);
  if (!match) return null;

  const segment = match[1];
  const allowed: AdminPermissionKey[] = [
    "analytics",
    "users",
    "follow-ups",
    "plans",
    "payments",
    "advertisements",
    "promo",
    "app-version",
    "knowledge-management",
    "administrators",
    "templates",
  ];

  if (segment === "broadcast") {
    return "users";
  }

  if (segment === "domain-transfers") {
    return "users";
  }

  if (segment === "users" && normalized.includes("/users/")) {
    return "users";
  }

  if (segment === "vouchers") {
    return "promo";
  }

  if (segment === "template") {
    return "templates";
  }

  return allowed.includes(segment as AdminPermissionKey)
    ? (segment as AdminPermissionKey)
    : null;
}

/**
 * Server-issued grant list.
 * `null` = unrestricted supervisor.
 * `undefined` = not loaded yet — fail closed.
 */
export function hasAdminPermission(
  granted: AdminPermissionKey[] | null | undefined,
  permission: AdminPermissionKey,
): boolean {
  if (granted === undefined) return false;
  if (granted === null) return true;
  return granted.includes(permission);
}

export function canAccessAdminPath(
  granted: AdminPermissionKey[] | null | undefined,
  pathname: string,
): boolean {
  const permission = adminRouteToPermission(pathname);
  if (!permission) return true;
  return hasAdminPermission(granted, permission);
}
