/** Admin panel sections that can be granted per supervisor */
export type AdminPermissionKey =
  | "analytics"
  | "users"
  | "follow-ups"
  | "plans"
  | "payments"
  | "advertisements"
  | "promo"
  | "app-version"
  | "knowledge-management"
  | "administrators";

export const ADMIN_PERMISSION_KEYS: AdminPermissionKey[] = [
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

export type AdminPermissionsMap = Record<string, AdminPermissionKey[]>;
