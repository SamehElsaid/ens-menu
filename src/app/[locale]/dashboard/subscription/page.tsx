"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { axiosGet } from "@/shared/axiosCall";
import { Menu, MenusResponse } from "@/types/Menu";
import Loader from "@/components/Global/Loader";
import SubscriptionPaymentMethods from "@/components/Dashboard/SubscriptionPaymentMethods";
import { getMenuDashboardRef } from "@/lib/menuDashboardPath";

export default function SubscriptionUpgradeRedirectPage() {
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
          router.replace(`/dashboard/${menuRef}/subscription`);
          return;
        }
      }
      router.replace("/dashboard");
    })();
  }, [locale, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-8 px-4 py-12">
      <Loader />
      <SubscriptionPaymentMethods compact className="w-full max-w-lg" />
    </div>
  );
}
