"use client";

import type { MenuRating } from "@/types/menuRating";
import { Card, Skeleton, SkeletonText } from "@/components/ui";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
import RatingCard from "./RatingCard";
import RatingsEmptyState from "./RatingsEmptyState";

/** Reviews are prose, so the column stays wide enough to read: three across on
 *  a desktop, four only on very wide screens. */
const cardGrid =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";

function RatingCardSkeleton() {
  return (
    <Card padded="md" aria-hidden>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-3.5 w-28" rounded="sm" />
          <Skeleton className="mt-2 h-2.5 w-20" rounded="sm" />
        </div>
        <Skeleton className="h-3.5 w-14" rounded="sm" />
      </div>
      <SkeletonText lines={3} className="mt-3" />
    </Card>
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
      <div className={cardGrid}>
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
      <div className={`${cardGrid} items-stretch`}>
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
