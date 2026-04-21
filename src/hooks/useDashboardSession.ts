"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { decryptData } from "@/shared/encryption";

export type DashboardSession = {
  role: string;
  staffJobRole?: string;
  /** Cashier: menu id from login cookie — used when Redux menu is not loaded (e.g. on home). */
  menuId?: number;
} | null;

/** Reads encrypted `sub` cookie (role + optional staff job role for staff tokens). */
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
        staffJobRole?: string;
        menuId?: number | string;
      };
      const rawMenuId = d.menuId;
      const menuId =
        rawMenuId !== undefined && rawMenuId !== null && String(rawMenuId) !== ""
          ? Number(rawMenuId)
          : undefined;
      setSession({
        role: String(d.role ?? ""),
        staffJobRole: d.staffJobRole,
        menuId:
          menuId !== undefined && !Number.isNaN(menuId) ? menuId : undefined,
      });
    } catch {
      setSession(null);
    }
  }, []);

  return session;
}
