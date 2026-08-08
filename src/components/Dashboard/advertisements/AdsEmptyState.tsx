"use client";

import { useTranslations } from "next-intl";
import { IoAddCircleOutline, IoMegaphoneOutline } from "react-icons/io5";
import { Button, EmptyState } from "@/components/ui";

interface AdsEmptyStateProps {
  onAdd?: () => void;
}

export default function AdsEmptyState({ onAdd }: AdsEmptyStateProps) {
  const t = useTranslations("Advertisements.page");

  return (
    <EmptyState
      className="dashboard-ads-empty"
      icon={<IoMegaphoneOutline aria-hidden />}
      title={t("noAds")}
      description={t("noAdsDescription")}
      action={
        onAdd ? (
          <Button onClick={onAdd} startIcon={<IoAddCircleOutline />}>
            {t("addFirstAd")}
          </Button>
        ) : undefined
      }
    />
  );
}
