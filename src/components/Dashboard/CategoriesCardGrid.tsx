"use client";

import { useTranslations } from "next-intl";
import { Category } from "@/types/Menu";
import CategoryCard from "./CategoryCard";
import MobileListPagination from "./mobile/MobileListPagination";

interface CategoriesCardGridProps {
  categories: Category[];
  loading: boolean;
  locale: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isSearching?: boolean;
  getName: (category: Category) => string;
  getImageUrl: (category: Category) => string;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function CategoryCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-white"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer aspect-[4/3] bg-surface-3" />
      <div className="space-y-3 p-4">
        <div className="dashboard-mobile-shimmer h-6 w-2/3 rounded-md bg-surface-3" />
        <div className="flex gap-2 border-t border-line pt-3 dark:border-line">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
        </div>
      </div>
    </div>
  );
}

export default function CategoriesCardGrid({
  categories,
  loading,
  locale,
  page,
  totalPages,
  onPageChange,
  isSearching = false,
  getName,
  getImageUrl,
  onEdit,
  onDelete,
}: CategoriesCardGridProps) {
  const t = useTranslations("Categories");

  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6"
        aria-busy="true"
        aria-label={t("loading")}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <CategoryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-fg">
          {isSearching ? t("noSearchResults") : t("noCategories")}
        </p>
        {!isSearching && (
          <p className="mt-2 text-sm text-fg-muted">
            {t("noCategoriesDescription")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            name={getName(category)}
            imageUrl={getImageUrl(category)}
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
