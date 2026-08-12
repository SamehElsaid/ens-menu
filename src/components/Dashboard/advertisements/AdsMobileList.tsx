"use client";

import { useTranslations } from "next-intl";
import { Advertisement } from "@/types/Menu";
import AdCard from "./AdCard";
import AdsEmptyState from "./AdsEmptyState";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
import { SkeletonRegion } from "@/components/ui";
import { AdCardSkeleton } from "./AdsCardGrid";

interface AdsMobileListProps {
  ads: Advertisement[];
  loading: boolean;
  locale: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getTitle: (ad: Advertisement) => string;
  togglingId?: number | null;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
  onToggleActive?: (ad: Advertisement) => void;
  onAdd: () => void;
}

export default function AdsMobileList({
  ads,
  loading,
  locale,
  page,
  totalPages,
  onPageChange,
  getTitle,
  togglingId = null,
  onEdit,
  onDelete,
  onToggleActive,
  onAdd,
}: AdsMobileListProps) {
  const t = useTranslations("Advertisements.page");

  if (loading) {
    return (
      <SkeletonRegion
        label={t("loading")}
        className="dashboard-ads-mobile-list flex flex-col gap-3 pb-6 md:hidden"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <AdCardSkeleton key={i} />
        ))}
      </SkeletonRegion>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="md:hidden">
        <AdsEmptyState onAdd={onAdd} />
      </div>
    );
  }

  return (
    <div className="dashboard-ads-mobile-list min-w-0 space-y-3 pb-6 md:hidden">
      {ads.map((ad) => (
        <AdCard
          key={ad.id ?? `${getTitle(ad)}-${ad.createdAt}`}
          ad={ad}
          locale={locale}
          title={getTitle(ad)}
          togglingId={togglingId}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
      {totalPages > 1 && (
        <MobileListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          locale={locale}
        />
      )}
    </div>
  );
}
