"use client";

import { useTranslations } from "next-intl";
import { Category } from "@/types/Menu";
import CategoryMobileCard from "./CategoryMobileCard";
import MobileCardSkeleton from "./MobileCardSkeleton";
import MobileListPagination from "./MobileListPagination";

interface CategoriesMobileListProps {
  categories: Category[];
  loading: boolean;
  locale: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getName: (category: Category) => string;
  getImageUrl: (category: Category) => string;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoriesMobileList({
  categories,
  loading,
  locale,
  page,
  totalPages,
  onPageChange,
  getName,
  getImageUrl,
  onEdit,
  onDelete,
}: CategoriesMobileListProps) {
  const t = useTranslations("Categories");

  if (loading) {
    return <MobileCardSkeleton count={5} variant="category" />;
  }

  if (categories.length === 0) {
    return (
      <div className="dashboard-mobile-empty rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center md:hidden">
        <p className="text-base font-semibold text-fg">{t("noCategories")}</p>
        <p className="mt-2 text-sm text-fg-muted">
          {t("noCategoriesDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-mobile-list space-y-2 pb-24 md:hidden">
      {categories.map((category) => (
        <CategoryMobileCard
          key={category.id}
          category={category}
          name={getName(category)}
          imageUrl={getImageUrl(category)}
          locale={locale}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      <MobileListPagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        locale={locale}
      />
    </div>
  );
}
