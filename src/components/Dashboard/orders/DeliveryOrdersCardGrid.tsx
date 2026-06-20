"use client";

import { useTranslations } from "next-intl";
import { MdOutlineDeliveryDining } from "react-icons/md";
import type { CallEntry, OrderActionResult } from "@/lib/tableOrders";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
import DeliveryOrderMobileCard from "./DeliveryOrderMobileCard";

interface DeliveryOrdersCardGridProps {
  entries: CallEntry[];
  loading: boolean;
  locale: string;
  currency: string;
  menuId: string;
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
      className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-white dark:border-emerald-800/40 dark:bg-slate-800/80"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer h-16 bg-emerald-50 dark:bg-emerald-950/30" />
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

export default function DeliveryOrdersCardGrid({
  entries,
  loading,
  locale,
  currency,
  menuId,
  page,
  totalPages,
  onPageChange,
  isFiltered = false,
  onView,
  onActionComplete,
}: DeliveryOrdersCardGridProps) {
  const t = useTranslations("deliveryOrders");

  if (loading) {
    return (
      <div
        id="onboarding-delivery-orders-table"
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
        id="onboarding-delivery-orders-table"
        className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center dark:border-emerald-800/40 dark:bg-slate-800/50"
      >
        <MdOutlineDeliveryDining className="mx-auto mb-3 text-4xl text-emerald-400" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {isFiltered ? t("noSearchResults") : t("empty")}
        </p>
        {!isFiltered && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {t("emptyHint")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div id="onboarding-delivery-orders-table" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 items-stretch">
        {entries.map((entry) => (
          <DeliveryOrderMobileCard
            key={entry.id}
            entry={entry}
            currency={currency}
            menuId={menuId}
            onView={onView}
            onActionComplete={onActionComplete}
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
