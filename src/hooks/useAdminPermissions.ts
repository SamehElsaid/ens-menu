"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  canAccessAdminPath,
  getAdminPermissionsByEmail,
  hasAdminPermission,
} from "@/lib/adminPermissions";
import type { AdminPermissionKey } from "@/types/AdminPermission";

function resolveAdminEmail(
  data: Record<string, unknown> | null | undefined,
): string | null {
  if (!data) return null;
  const user = data.user as { email?: string } | undefined;
  return (
    (typeof data.email === "string" ? data.email : null) ??
    user?.email ??
    null
  );
}

export function useAdminPermissions() {
  const authData = useAppSelector((state) => state.auth.data) as Record<
    string,
    unknown
  > | null;

  const email = resolveAdminEmail(authData);

  return useMemo(
    () => ({
      email,
      permissions: getAdminPermissionsByEmail(email),
      hasFullAccess: getAdminPermissionsByEmail(email) === null,
      has: (key: AdminPermissionKey) => hasAdminPermission(email, key),
      canAccessPath: (pathname: string) => canAccessAdminPath(email, pathname),
    }),
    [email],
  );
}
