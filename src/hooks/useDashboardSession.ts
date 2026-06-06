"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { decryptData } from "@/shared/encryption";

export type DashboardSession = {
  role: string;
  staffJobRole?: string;
  /** Cashier: menu UUID from login cookie — used when Redux menu is not loaded. */
  menuUuid?: string;
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
        menuUuid?: string;
      };
      const menuUuid =
        typeof d.menuUuid === "string" && d.menuUuid.length > 0
          ? d.menuUuid
          : undefined;
      setSession({
        role: String(d.role ?? ""),
        staffJobRole: d.staffJobRole,
        menuUuid,
      });
    } catch {
      setSession(null);
    }
  }, []);

  return session;
}
