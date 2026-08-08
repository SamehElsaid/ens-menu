"use client";

import { useTranslations } from "next-intl";
import { Advertisement } from "@/types/Menu";
import AdCard from "./AdCard";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";

function AdCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-white"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer aspect-video w-full bg-surface-3" />
      <div className="space-y-3 p-4">
        <div className="dashboard-mobile-shimmer h-6 w-2/3 rounded-md bg-surface-3" />
        <div className="dashboard-mobile-shimmer h-4 w-full rounded-md bg-surface-3" />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="dashboard-mobile-shimmer h-12 rounded-lg bg-surface-3"
            />
          ))}
        </div>
        <div className="flex gap-2 border-t border-line pt-3 dark:border-line">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
        </div>
      </div>
    </div>
  );
}

interface AdsCardGridProps {
  ads: Advertisement[];
  loading: boolean;
  locale: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getTitle: (ad: Advertisement) => string;
  getContent: (ad: Advertisement) => string;
  togglingId?: number | null;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
  onToggleActive?: (ad: Advertisement) => void;
}

export default function AdsCardGrid({
  ads,
  loading,
  locale,
  page,
  totalPages,
  onPageChange,
  getTitle,
  getContent,
  togglingId = null,
  onEdit,
  onDelete,
  onToggleActive,
}: AdsCardGridProps) {
  const t = useTranslations("Advertisements.page");

  if (loading) {
    return (
      <div
        id="onboarding-advertisements-table"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6"
        aria-busy="true"
        aria-label={t("loading")}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <AdCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div id="onboarding-advertisements-table" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 items-stretch">
        {ads.map((ad) => (
          <AdCard
            key={ad.id ?? `${getTitle(ad)}-${ad.createdAt}`}
            ad={ad}
            locale={locale}
            title={getTitle(ad)}
            contentPreview={getContent(ad)}
            togglingId={togglingId}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>

      <MobileListPagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        locale={locale}
      />
    </div>
  );
}
