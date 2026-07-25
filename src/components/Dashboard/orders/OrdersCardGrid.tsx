"use client";

import { useTranslations } from "next-intl";
import { IoReceiptOutline } from "react-icons/io5";
import type {
  CallEntry,
  OrderActionResult,
  OrderMenuBadges,
} from "@/lib/tableOrders";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
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
  onView: (id: string) => void;
  onActionComplete: (result: OrderActionResult) => void;
}

function OrderCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-violet-200/70 bg-white dark:border-violet-800/40 dark:bg-slate-800/80"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer h-16 bg-violet-50 dark:bg-violet-950/30" />
      <div className="space-y-3 p-4">
        <div className="dashboard-mobile-shimmer h-4 w-2/3 rounded-md bg-slate-100 dark:bg-slate-700/60" />
        <div className="dashboard-mobile-shimmer h-4 w-1/2 rounded-md bg-slate-100 dark:bg-slate-700/60" />
        <div className="dashboard-mobile-shimmer h-6 w-1/3 rounded-md bg-slate-100 dark:bg-slate-700/60" />
        <div className="flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
        </div>
      </div>
    </div>
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
      <div
        id="onboarding-orders-table"
        className="rounded-2xl border border-dashed border-violet-200 bg-white px-6 py-14 text-center dark:border-violet-800/40 dark:bg-slate-800/50"
      >
        <IoReceiptOutline className="mx-auto mb-3 text-4xl text-violet-400" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {isFiltered ? t("noSearchResults") : t("empty")}
        </p>
      </div>
    );
  }

  return (
    <div id="onboarding-orders-table" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 items-stretch">
        {entries.map((entry) => {
          const badge = entry.menuId != null ? menuBadges?.[entry.menuId] : undefined;
          return (
            <OrderMobileCard
              key={entry.id}
              entry={entry}
              currency={badge?.currency || currency}
              menuId={menuId || (entry.menuId != null ? String(entry.menuId) : "")}
              menuLabel={badge?.label}
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
