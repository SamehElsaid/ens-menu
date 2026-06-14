"use client";

import { Advertisement } from "@/types/Menu";
import AdCard from "./AdCard";
import AdsEmptyState from "./AdsEmptyState";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";

function AdCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer aspect-[16/9] w-full bg-slate-100 dark:bg-slate-700/60" />
      <div className="space-y-3 p-3.5">
        <div className="dashboard-mobile-shimmer h-5 w-3/4 rounded-md bg-slate-100 dark:bg-slate-700/60" />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="dashboard-mobile-shimmer h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="dashboard-mobile-shimmer h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
          <div className="dashboard-mobile-shimmer h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
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
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
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
  onEdit,
  onDelete,
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
          onEdit={onEdit}
          onDelete={onDelete}
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
