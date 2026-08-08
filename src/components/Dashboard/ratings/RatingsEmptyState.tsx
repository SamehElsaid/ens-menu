"use client";

import { useTranslations } from "next-intl";
import { IoSearchOutline, IoStarOutline } from "react-icons/io5";
import { EmptyState } from "@/components/ui";

type RatingsEmptyStateProps = {
  isSearch?: boolean;
};

export default function RatingsEmptyState({
  isSearch = false,
}: RatingsEmptyStateProps) {
  const t = useTranslations("Ratings");
  const Icon = isSearch ? IoSearchOutline : IoStarOutline;

  return (
    <EmptyState
      icon={<Icon aria-hidden />}
      title={isSearch ? t("emptySearchTitle") : t("emptyTitle")}
      description={
        isSearch ? t("emptySearchDescription") : t("emptyDescription")
      }
    />
  );
}
