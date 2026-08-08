"use client";

import { useTranslations } from "next-intl";
import { MdOutlineDeliveryDining } from "react-icons/md";
import type {
  CallEntry,
  OrderActionResult,
  OrderMenuBadges,
} from "@/lib/tableOrders";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
import DeliveryOrderMobileCard from "./DeliveryOrderMobileCard";

interface DeliveryOrdersCardGridProps {
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
      className="overflow-hidden rounded-lg border border-emerald-200/70 bg-white dark:border-emerald-800/40"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer h-16 bg-emerald-50 dark:bg-emerald-950/30" />
      <div className="space-y-3 p-4">
        <div className="dashboard-mobile-shimmer h-4 w-2/3 rounded-md bg-surface-3" />
        <div className="dashboard-mobile-shimmer h-4 w-1/2 rounded-md bg-surface-3" />
        <div className="dashboard-mobile-shimmer h-6 w-1/3 rounded-md bg-surface-3" />
        <div className="flex gap-2 border-t border-line pt-3 dark:border-line">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-lg bg-surface-3" />
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
  menuId = "",
  menuBadges,
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
        className="rounded-lg border border-dashed border-emerald-200 bg-white px-6 py-14 text-center dark:border-emerald-800/40"
      >
        <MdOutlineDeliveryDining className="mx-auto mb-3 text-4xl text-emerald-400" />
        <p className="text-sm text-fg-muted">
          {isFiltered ? t("noSearchResults") : t("empty")}
        </p>
        {!isFiltered && (
          <p className="mt-2 text-xs text-fg-muted">{t("emptyHint")}</p>
        )}
      </div>
    );
  }

  return (
    <div id="onboarding-delivery-orders-table" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 items-stretch">
        {entries.map((entry) => {
          const badge =
            entry.menuId != null ? menuBadges?.[entry.menuId] : undefined;
          return (
            <DeliveryOrderMobileCard
              key={entry.id}
              entry={entry}
              currency={badge?.currency || currency}
              menuId={
                menuId || (entry.menuId != null ? String(entry.menuId) : "")
              }
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
