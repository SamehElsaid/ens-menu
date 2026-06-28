"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { axiosGet } from "@/shared/axiosCall";
import { Menu, MenusResponse } from "@/types/Menu";
import Loader from "@/components/Global/Loader";
import { getMenuDashboardRef } from "@/lib/menuDashboardPath";

export default function DomainTransferRedirectPage() {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      const result = await axiosGet<MenusResponse | Menu[]>("/menus", locale);
      if (result.status && result.data) {
        const menus = Array.isArray(result.data)
          ? result.data
          : (result.data.menus ?? []);
        const menuRef = getMenuDashboardRef(menus[0]);
        if (menuRef) {
          router.replace(`/dashboard/${menuRef}/domain-transfer`);
          return;
        }
      }
      router.replace("/dashboard");
    })();
  }, [locale, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </div>
  );
}
