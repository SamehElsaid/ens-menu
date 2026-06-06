"use client";

import { useAppSelector } from "@/store/hooks";
import SubscriptionPlansSection from "@/components/Dashboard/SubscriptionPlansSection";
import { menuDashboardPath } from "@/lib/menuDashboardPath";
import { useTranslations } from "next-intl";

export default function SubscriptionPage() {
  const menu = useAppSelector((state) => state.menuData.menu);
  const t = useTranslations("personalProfile");

  return (
    <SubscriptionPlansSection
      backLink={menuDashboardPath(menu, "personal")}
      backLinkText={t("backToPersonalProfile")}
    />
  );
}
