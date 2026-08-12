"use client";

import { useTranslations } from "next-intl";
import { IoPricetagsOutline } from "react-icons/io5";
import { Category } from "@/types/Menu";
import { EmptyState } from "@/components/ui";
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

/** The phone view of the category collection — one ruled panel, divided rows,
 *  matching `ItemsMobileList`. */
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
      <div className="md:hidden">
        <EmptyState
          icon={<IoPricetagsOutline />}
          title={t("noCategories")}
          description={t("noCategoriesDescription")}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-mobile-list pb-24 md:hidden">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <ul className="divide-y divide-line">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryMobileCard
                category={category}
                name={getName(category)}
                imageUrl={getImageUrl(category)}
                locale={locale}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
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
