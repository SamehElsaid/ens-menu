"use client";

import { useTranslations } from "next-intl";
import { Advertisement } from "@/types/Menu";
import AdCard from "./AdCard";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
import { Card, Skeleton, SkeletonRegion } from "@/components/ui";

/** Shared by both branches so the grid does not reflow when the data lands. */
const adsGridClass =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6";

/** Mirrors `AdCard`: media, ruled body, ruled ticket row, ruled action strip.
 *  Exported so the mobile list stands in for the same card with the same
 *  geometry instead of keeping a second copy that drifts. */
export function AdCardSkeleton() {
  return (
    <Card padded="none" className="overflow-hidden">
      <div className="aspect-video border-b border-line">
        <Skeleton className="h-full w-full" rounded="sm" />
      </div>
      <div className="p-3">
        <Skeleton className="h-3.5 w-2/3" rounded="sm" />
        <Skeleton className="mt-2 h-3 w-full" rounded="sm" />
        <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface px-2 py-1.5">
              <Skeleton className="h-2.5 w-3/4" rounded="sm" />
              <Skeleton className="mt-1 h-3.5 w-1/2" rounded="sm" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 border-t border-line bg-surface-2/40 px-3 py-2">
        <Skeleton className="h-8 w-20" rounded="sm" />
        <Skeleton className="ms-auto size-8" rounded="sm" />
        <Skeleton className="size-8" rounded="sm" />
      </div>
    </Card>
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
      <div id="onboarding-advertisements-table">
        <SkeletonRegion label={t("loading")} className={adsGridClass}>
          {Array.from({ length: 8 }).map((_, i) => (
            <AdCardSkeleton key={i} />
          ))}
        </SkeletonRegion>
      </div>
    );
  }

  return (
    <div id="onboarding-advertisements-table" className="space-y-6">
      <div className={`${adsGridClass} items-stretch`}>
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
