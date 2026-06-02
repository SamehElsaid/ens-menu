import type {
  AdminPermissionKey,
  AdminPermissionsMap,
} from "@/types/AdminPermission";

const STORAGE_KEY = "ensmenu_admin_permissions";

function readMap(): AdminPermissionsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AdminPermissionsMap;
  } catch {
    return {};
  }
}

function writeMap(map: AdminPermissionsMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** No stored record = full access (existing supervisors). */
export function getAdminPermissionsByEmail(
  email: string | null | undefined,
): AdminPermissionKey[] | null {
  if (!email?.trim()) return null;
  const map = readMap();
  const key = normalizeEmail(email);
  return map[key] ?? null;
}

export function hasAdminPermission(
  email: string | null | undefined,
  permission: AdminPermissionKey,
): boolean {
  const list = getAdminPermissionsByEmail(email);
  if (!list) return true;
  return list.includes(permission);
}

export function setAdminPermissionsByEmail(
  email: string,
  permissions: AdminPermissionKey[],
): void {
  const map = readMap();
  map[normalizeEmail(email)] = permissions;
  writeMap(map);
}

export function removeAdminPermissionsByEmail(email: string): void {
  const map = readMap();
  delete map[normalizeEmail(email)];
  writeMap(map);
}

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
  ];

  if (segment === "users" && normalized.includes("/users/")) {
    return "users";
  }

  return allowed.includes(segment as AdminPermissionKey)
    ? (segment as AdminPermissionKey)
    : null;
}

export function canAccessAdminPath(
  email: string | null | undefined,
  pathname: string,
): boolean {
  const permission = adminRouteToPermission(pathname);
  if (!permission) return true;
  return hasAdminPermission(email, permission);
}
