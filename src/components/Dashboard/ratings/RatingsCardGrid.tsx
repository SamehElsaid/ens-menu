"use client";

import type { MenuRating } from "@/types/menuRating";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
import RatingCard from "./RatingCard";
import RatingsEmptyState from "./RatingsEmptyState";

function RatingCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-line/90 bg-white shadow-sm"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer h-28 bg-amber-500/8 dark:bg-amber-500/12" />
      <div className="space-y-3 p-4">
        <div className="dashboard-mobile-shimmer h-14 w-full rounded-lg bg-surface-3" />
        <div className="flex gap-2">
          <div className="dashboard-mobile-shimmer h-7 w-24 rounded-lg bg-surface-3" />
          <div className="dashboard-mobile-shimmer h-7 w-28 rounded-lg bg-surface-3" />
        </div>
      </div>
    </div>
  );
}

type RatingsCardGridProps = {
  ratings: MenuRating[];
  loading: boolean;
  locale: string;
  page: number;
  totalPages: number;
  isSearch?: boolean;
  onPageChange: (page: number) => void;
};

export default function RatingsCardGrid({
  ratings,
  loading,
  locale,
  page,
  totalPages,
  isSearch = false,
  onPageChange,
}: RatingsCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <RatingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (ratings.length === 0) {
    return <RatingsEmptyState isSearch={isSearch} />;
  }

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 items-stretch">
        {ratings.map((rating) => (
          <RatingCard key={rating.id} rating={rating} />
        ))}
      </div>
      {totalPages > 1 ? (
        <MobileListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          locale={locale}
        />
      ) : null}
    </div>
  );
}
