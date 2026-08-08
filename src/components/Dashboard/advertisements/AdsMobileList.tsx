"use client";

import { Advertisement } from "@/types/Menu";
import AdCard from "./AdCard";
import AdsEmptyState from "./AdsEmptyState";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";

function AdCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-white"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer aspect-[16/9] w-full bg-surface-3" />
      <div className="space-y-3 p-3.5">
        <div className="dashboard-mobile-shimmer h-5 w-3/4 rounded-md bg-surface-3" />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="dashboard-mobile-shimmer h-12 rounded-lg bg-surface-3"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="dashboard-mobile-shimmer h-10 rounded-lg bg-surface-3" />
          <div className="dashboard-mobile-shimmer h-10 rounded-lg bg-surface-3" />
        </div>
      </div>
    </div>
  );
}

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
  if (loading) {
    return (
      <div className="dashboard-ads-mobile-list space-y-3 pb-6 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <AdCardSkeleton key={i} />
        ))}
      </div>
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
