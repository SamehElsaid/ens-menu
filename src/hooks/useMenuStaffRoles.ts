"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import type { MenuStaffRole } from "@/types/Menu";

interface UseMenuStaffRoles {
  roles: MenuStaffRole[];
  loading: boolean;
  refresh: () => void;
}

/** Fetches the dynamic staff roles for a menu (RBAC). */
export function useMenuStaffRoles(
  menuId: string,
  enabled = true,
): UseMenuStaffRoles {
  const locale = useLocale();
  const [roles, setRoles] = useState<MenuStaffRole[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!menuId || !enabled) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    axiosGet<{ roles: MenuStaffRole[] }>(
      `/menus/${menuId}/staff-roles`,
      locale,
    ).then((result) => {
      if (!active) return;
      if (result.status && result.data && Array.isArray(result.data.roles)) {
        setRoles(result.data.roles);
      } else {
        setRoles([]);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [menuId, locale, enabled, tick]);

  return { roles, loading, refresh };
}
