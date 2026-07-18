"use client";

import { useMemo } from "react";
import { useDashboardSession } from "@/hooks/useDashboardSession";
import type { StaffPermissionKey } from "@/types/StaffPermission";

type PermInput = StaffPermissionKey | string;

export interface AuthorizationApi {
  /** true for owners/admins (no staff role) or when the staff role has the permission. */
  can: (permission: PermInput) => boolean;
  cannot: (permission: PermInput) => boolean;
  hasAny: (permissions: PermInput[]) => boolean;
  hasAll: (permissions: PermInput[]) => boolean;
  /** true when the current session is a staff member (vs. owner/admin). */
  isStaff: boolean;
  permissions: string[];
  roleName?: string;
}

/**
 * Client-side permission gating for the dashboard UI. The backend remains the
 * source of truth for security; this only controls what is shown.
 *
 * Owners/admins implicitly hold every permission. Staff permissions come from
 * the encrypted `sub` cookie (set at login / refreshed via /staff-auth/me).
 */
export function useAuthorization(): AuthorizationApi {
  const session = useDashboardSession();

  return useMemo(() => {
    const isStaff = session?.role === "staff";
    const permissions = session?.permissions ?? [];

    const can = (permission: PermInput): boolean => {
      if (!isStaff) return true; // owner / admin
      return permissions.includes(permission);
    };

    return {
      can,
      cannot: (permission: PermInput) => !can(permission),
      hasAny: (perms: PermInput[]) =>
        !isStaff || perms.some((p) => permissions.includes(p)),
      hasAll: (perms: PermInput[]) =>
        !isStaff || perms.every((p) => permissions.includes(p)),
      isStaff,
      permissions,
      roleName: session?.roleName,
    };
  }, [session]);
}
