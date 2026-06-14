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
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer aspect-4/3 bg-slate-100 dark:bg-slate-700/60" />
      <div className="space-y-3 p-4">
        <div className="dashboard-mobile-shimmer h-6 w-2/3 rounded-md bg-slate-100 dark:bg-slate-700/60" />
        <div className="dashboard-mobile-shimmer h-4 w-1/3 rounded-md bg-slate-100 dark:bg-slate-700/60" />
        <div className="dashboard-mobile-shimmer h-7 w-1/4 rounded-md bg-slate-100 dark:bg-slate-700/60" />
        <div className="flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
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
      <div
        className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-600 dark:bg-slate-800/40"
      >
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {isFiltered ? t("noSearchResults") : t("noItems")}
        </p>
        {!isFiltered && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
