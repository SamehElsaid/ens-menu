"use client";

import { useTranslations } from "next-intl";
import { Item } from "@/types/Menu";
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
      <div className="dashboard-mobile-empty rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center md:hidden">
        <p className="text-base font-semibold text-fg">{t("noItems")}</p>
        <p className="mt-2 text-sm text-fg-muted">{t("noItemsDescription")}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-mobile-list space-y-2 pb-24 md:hidden">
      {items.map((item) => (
        <ItemMobileCard
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
      <MobileListPagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        locale={locale}
      />
    </div>
  );
}
