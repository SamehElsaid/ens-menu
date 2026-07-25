"use client";

import { useMemo } from "react";
import { useDashboardSessionState } from "@/hooks/useDashboardSession";
import {
  isNonGatingPermission,
  type StaffPermissionKey,
} from "@/types/StaffPermission";

type PermInput = StaffPermissionKey | string;

export interface AuthorizationApi {
  /** true for owners/admins (no staff role) or when the staff role has the permission. */
  can: (permission: PermInput) => boolean;
  cannot: (permission: PermInput) => boolean;
  hasAny: (permissions: PermInput[]) => boolean;
  hasAll: (permissions: PermInput[]) => boolean;
  /** true when the current session is a staff member (vs. owner/admin). */
  isStaff: boolean;
  /**
   * false until the session cookie has been read. While false, `isStaff` is
   * still its default `false`, so owner-only work must not start yet.
   */
  isResolved: boolean;
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
  const { session, resolved } = useDashboardSessionState();

  return useMemo(() => {
    const isStaff = session?.role === "staff";
    const permissions = session?.permissions ?? [];

    const can = (permission: PermInput): boolean => {
      if (!isStaff) return true; // owner / admin
      if (isNonGatingPermission(permission)) return true;
      return permissions.includes(permission);
    };

    return {
      can,
      cannot: (permission: PermInput) => !can(permission),
      hasAny: (perms: PermInput[]) => !isStaff || perms.some(can),
      hasAll: (perms: PermInput[]) => !isStaff || perms.every(can),
      isStaff,
      isResolved: resolved,
      permissions,
      roleName: session?.roleName,
    };
  }, [session, resolved]);
}
