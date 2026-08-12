"use client";

import { useTranslations } from "next-intl";
import { IoReceiptOutline } from "react-icons/io5";
import type {
  CallEntry,
  OrderActionResult,
  OrderMenuBadges,
} from "@/lib/tableOrders";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
import { Card, EmptyState, Skeleton } from "@/components/ui";
import OrderMobileCard from "./OrderMobileCard";

interface OrdersCardGridProps {
  entries: CallEntry[];
  loading: boolean;
  locale: string;
  currency: string;
  /** Empty on account-level lists, where each entry carries its own menu. */
  menuId?: string;
  menuBadges?: OrderMenuBadges;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isFiltered?: boolean;
  /** Ids a socket update just changed; those cards flash their border once. */
  changedIds?: ReadonlySet<string>;
  onView: (id: string) => void;
  onActionComplete: (result: OrderActionResult) => void;
}

/** Mirrors the ticket's own shape — header, ruled rows, action foot — so the
 *  grid does not reflow when the orders arrive. */
function OrderCardSkeleton() {
  return (
    <Card padded="none" className="overflow-hidden" aria-hidden>
      <div className="border-b border-line px-3.5 py-3">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="mt-1.5 h-4 w-24" />
      </div>
      <div className="flex flex-col gap-2 px-3.5 py-3">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="border-t border-line px-3.5 py-3">
        <Skeleton className="h-8 w-full" rounded="lg" />
      </div>
    </Card>
  );
}

export default function OrdersCardGrid({
  entries,
  loading,
  locale,
  currency,
  menuId = "",
  menuBadges,
  page,
  totalPages,
  onPageChange,
  isFiltered = false,
  changedIds,
  onView,
  onActionComplete,
}: OrdersCardGridProps) {
  const t = useTranslations("tableOrders");

  if (loading) {
    return (
      <div
        id="onboarding-orders-table"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6"
        aria-busy="true"
        aria-label={t("loading")}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div id="onboarding-orders-table">
        <EmptyState
          icon={<IoReceiptOutline />}
          title={isFiltered ? t("noSearchResults") : t("empty")}
        />
      </div>
    );
  }

  return (
    <div id="onboarding-orders-table" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 items-stretch">
        {entries.map((entry) => {
          const badge =
            entry.menuId != null ? menuBadges?.[entry.menuId] : undefined;
          return (
            <OrderMobileCard
              key={entry.id}
              entry={entry}
              currency={badge?.currency || currency}
              menuId={
                menuId || (entry.menuId != null ? String(entry.menuId) : "")
              }
              menuLabel={badge?.label}
              justChanged={changedIds?.has(entry.id) ?? false}
              onView={onView}
              onActionComplete={onActionComplete}
            />
          );
        })}
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
