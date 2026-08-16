"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  canAccessAdminPath,
  hasAdminPermission,
} from "@/lib/adminPermissions";
import type { AdminPermissionKey } from "@/types/AdminPermission";

function resolveAdminGrants(
  data: Record<string, unknown> | null | undefined,
): AdminPermissionKey[] | null | undefined {
  if (!data) return undefined;
  const user = data.user as
    | { role?: string; adminPermissions?: AdminPermissionKey[] | null }
    | undefined;
  if (user?.role !== "admin") return undefined;
  if (!("adminPermissions" in (user ?? {}))) return undefined;
  return user.adminPermissions ?? null;
}

/**
 * UI-only hinting from `/auth/me`. Authorization is enforced by
 * `requirePermission` on the API. Missing grants fail closed.
 */
export function useAdminPermissions() {
  const authData = useAppSelector((state) => state.auth.data) as Record<
    string,
    unknown
  > | null;

  const granted = resolveAdminGrants(authData);

  return useMemo(
    () => ({
      permissions: granted ?? null,
      loaded: granted !== undefined,
      hasFullAccess: granted === null,
      has: (key: AdminPermissionKey) => hasAdminPermission(granted, key),
      canAccessPath: (pathname: string) => canAccessAdminPath(granted, pathname),
    }),
    [granted],
  );
}
