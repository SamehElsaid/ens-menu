"use client";

import SubscriptionPlansSection from "@/components/Dashboard/SubscriptionPlansSection";
import { useTranslations } from "next-intl";

export default function SubscriptionPage() {
  const t = useTranslations("personalProfile");

  return (
    <SubscriptionPlansSection
      backLink="/dashboard/personal"
      backLinkText={t("backToPersonalProfile")}
    />
  );
}
