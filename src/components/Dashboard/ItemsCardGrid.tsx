"use client";

import { useTranslations } from "next-intl";
import { IoFastFoodOutline } from "react-icons/io5";
import { Item } from "@/types/Menu";
import { EmptyState, NoResultsState } from "@/components/ui";
import ItemCard from "./ItemCard";
import { CardGridSection, CardGridSkeleton } from "./CardGrid";
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

/**
 * The item collection.
 *
 * The grid, its loading placeholder and its pager come from `CardGrid` so this
 * page keeps the same column rhythm as every other dashboard collection — it
 * used to declare four breakpoints of its own and hand-roll a shimmer, which
 * meant the card width changed when you moved between items and tables. An
 * empty result and an empty menu are also two different situations, so they no
 * longer share one message.
 */
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
    return <CardGridSkeleton count={8} media label={t("loading")} />;
  }

  if (items.length === 0) {
    return isFiltered ? (
      <NoResultsState title={t("noSearchResults")} />
    ) : (
      <EmptyState
        icon={<IoFastFoodOutline />}
        title={t("noItems")}
        description={t("noItemsDescription")}
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
    </CardGridSection>
  );
}
