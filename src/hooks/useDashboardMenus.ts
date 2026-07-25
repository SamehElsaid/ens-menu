"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";

export interface DashboardMenu {
  id: number;
  slug: string | null;
  uuid: string | null;
  logo: string | null;
  nameAr: string | null;
  nameEn: string | null;
  currency: string | null;
  isActive: boolean;
  capabilities: {
    tableOrderingQr: boolean;
    liveOrderNotifications: boolean;
  };
}

interface DashboardMenusPayload {
  menus?: DashboardMenu[];
}

/**
 * Menus the signed-in account may work on: every menu for an owner, only the
 * granted ones for staff. Shared by the orders filter and the staff editor.
 */
export function useDashboardMenus(): {
  menus: DashboardMenu[];
  loading: boolean;
  refresh: () => void;
} {
  const locale = useLocale();
  const [menus, setMenus] = useState<DashboardMenu[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosGet<DashboardMenusPayload>(
        "/dashboard/menus",
        locale,
        undefined,
        undefined,
        undefined,
        true,
      );
      setMenus(res.status && res.data?.menus ? res.data.menus : []);
    } catch {
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { menus, loading, refresh };
}

export function localizedMenuName(
  menu: Pick<DashboardMenu, "nameAr" | "nameEn" | "slug" | "id">,
  locale: string,
): string {
  const preferred = locale === "ar" ? menu.nameAr : menu.nameEn;
  return (
    preferred?.trim() ||
    menu.nameEn?.trim() ||
    menu.nameAr?.trim() ||
    menu.slug?.trim() ||
    `#${menu.id}`
  );
}
