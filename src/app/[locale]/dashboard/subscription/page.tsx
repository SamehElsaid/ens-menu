"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { axiosGet } from "@/shared/axiosCall";
import { Menu, MenusResponse } from "@/types/Menu";
import Loader from "@/components/Global/Loader";

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
        if (menus[0]?.id != null) {
          router.replace(`/dashboard/${menus[0].id}/subscription`);
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
