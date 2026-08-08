"use client";

import { useTranslations } from "next-intl";
import { Item } from "@/types/Menu";
import ItemCard from "./ItemCard";
import MobileListPagination from "./mobile/MobileListPagination";

interface ItemsCardGridProps {
  items: Item[];
  loading: boolean;
  locale: string;
  currency: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isFiltered?: boolean;
  getName: (item: Item) => string;
  getCategoryName: (item: Item) => string | undefined;
  getImageUrl: (item: Item) => string;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

function ItemCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-white"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer aspect-4/3 bg-surface-3" />
      <div className="space-y-3 p-4">
        <div className="dashboard-mobile-shimmer h-6 w-2/3 rounded-md bg-surface-3" />
        <div className="dashboard-mobile-shimmer h-4 w-1/3 rounded-md bg-surface-3" />
        <div className="dashboard-mobile-shimmer h-7 w-1/4 rounded-md bg-surface-3" />
        <div className="flex gap-2 border-t border-line pt-3 dark:border-line">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
        </div>
      </div>
    </div>
  );
}

export default function ItemsCardGrid({
  items,
  loading,
  locale,
  currency,
  page,
  totalPages,
  onPageChange,
  isFiltered = false,
  getName,
  getCategoryName,
  getImageUrl,
  onEdit,
  onDelete,
}: ItemsCardGridProps) {
  const t = useTranslations("Items");

  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6"
        aria-busy="true"
        aria-label={t("loading")}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <ItemCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-fg">
          {isFiltered ? t("noSearchResults") : t("noItems")}
        </p>
        {!isFiltered && (
          <p className="mt-2 text-sm text-fg-muted">
            {t("noItemsDescription")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            name={getName(item)}
            categoryName={getCategoryName(item)}
            imageUrl={getImageUrl(item)}
            currency={currency}
            locale={locale}
            onEdit={onEdit}
            onDelete={onDelete}
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
