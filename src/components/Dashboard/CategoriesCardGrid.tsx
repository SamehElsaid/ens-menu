"use client";

import { useTranslations } from "next-intl";
import { IoPricetagsOutline } from "react-icons/io5";
import { Category } from "@/types/Menu";
import { EmptyState, NoResultsState } from "@/components/ui";
import CategoryCard from "./CategoryCard";
import { CardGridSection, CardGridSkeleton } from "./CardGrid";
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

/**
 * The category collection — same grid, placeholder and pager as
 * `ItemsCardGrid`, because the two pages are read as one workflow.
 */
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
    return <CardGridSkeleton count={8} media label={t("loading")} />;
  }

  if (categories.length === 0) {
    return isSearching ? (
      <NoResultsState title={t("noSearchResults")} />
    ) : (
      <EmptyState
        icon={<IoPricetagsOutline />}
        title={t("noCategories")}
        description={t("noCategoriesDescription")}
      />
    );
  }

  return (
    <CardGridSection
      pagination={
        <MobileListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          locale={locale}
        />
      }
    >
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
    </CardGridSection>
  );
}
