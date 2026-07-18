"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { decryptData } from "@/shared/encryption";

export type DashboardSession = {
  role: string;
  /** Staff RBAC: permissions of the staff member's role. */
  permissions?: string[];
  /** Staff RBAC: assigned role id. */
  staffRoleId?: number;
  /** Staff RBAC: display name of the assigned role. */
  roleName?: string;
  /** Staff: menu UUID from login cookie — used when Redux menu is not loaded. */
  menuUuid?: string;
} | null;

/** Reads encrypted `sub` cookie (role + RBAC permissions for staff tokens). */
export function useDashboardSession(): DashboardSession {
  const [session, setSession] = useState<DashboardSession>(null);

  useEffect(() => {
    const sub = Cookies.get("sub");
    if (!sub) {
      setSession(null);
      return;
    }
    try {
      const d = decryptData(sub) as {
        role?: string;
        permissions?: unknown;
        staffRoleId?: unknown;
        roleName?: unknown;
        menuUuid?: string;
      };
      const menuUuid =
        typeof d.menuUuid === "string" && d.menuUuid.length > 0
          ? d.menuUuid
          : undefined;
      const permissions = Array.isArray(d.permissions)
        ? d.permissions.filter((p): p is string => typeof p === "string")
        : undefined;
      setSession({
        role: String(d.role ?? ""),
        permissions,
        staffRoleId:
          typeof d.staffRoleId === "number" ? d.staffRoleId : undefined,
        roleName: typeof d.roleName === "string" ? d.roleName : undefined,
        menuUuid,
      });
    } catch {
      setSession(null);
    }
  }, []);

  return session;
}
