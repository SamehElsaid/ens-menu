"use client";

import { useAppSelector } from "@/store/hooks";
import SubscriptionPlansSection from "@/components/Dashboard/SubscriptionPlansSection";
import { useTranslations } from "next-intl";

export default function SubscriptionPage() {
  const menuId = useAppSelector((state) => state.menuData.menu?.id);
  const t = useTranslations("personalProfile");

  return (
    <SubscriptionPlansSection
      backLink={`/dashboard/${menuId ?? ""}/personal`}
      backLinkText={t("backToPersonalProfile")}
    />
  );
}
