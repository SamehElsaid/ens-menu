"use client";

import { useTranslations } from "next-intl";
import { IoFastFoodOutline } from "react-icons/io5";
import { Item } from "@/types/Menu";
import { EmptyState } from "@/components/ui";
import ItemMobileCard from "./ItemMobileCard";
import MobileCardSkeleton from "./MobileCardSkeleton";
import MobileListPagination from "./MobileListPagination";

interface ItemsMobileListProps {
  items: Item[];
  loading: boolean;
  locale: string;
  currency: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getName: (item: Item) => string;
  getCategoryName: (item: Item) => string | undefined;
  getImageUrl: (item: Item) => string;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

/**
 * The phone view of the item collection.
 *
 * One ruled panel with hairline-divided rows, not a stack of floating cards:
 * shared edges give twelve dishes a single left margin to scan down, and they
 * remove the 12px of ground that used to sit between every pair of rows on the
 * narrowest screen the product has.
 */
export default function ItemsMobileList({
  items,
  loading,
  locale,
  currency,
  page,
  totalPages,
  onPageChange,
  getName,
  getCategoryName,
  getImageUrl,
  onEdit,
  onDelete,
}: ItemsMobileListProps) {
  const t = useTranslations("Items");

  if (loading) {
    return <MobileCardSkeleton count={6} variant="item" />;
  }

  if (items.length === 0) {
    return (
      <div className="md:hidden">
        <EmptyState
          icon={<IoFastFoodOutline />}
          title={t("noItems")}
          description={t("noItemsDescription")}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-mobile-list pb-24 md:hidden">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.id}>
              <ItemMobileCard
                item={item}
                name={getName(item)}
                categoryName={getCategoryName(item)}
                imageUrl={getImageUrl(item)}
                currency={currency}
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
