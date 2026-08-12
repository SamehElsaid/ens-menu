"use client";

import { useTranslations } from "next-intl";
import { MdOutlineDeliveryDining } from "react-icons/md";
import type {
  CallEntry,
  OrderActionResult,
  OrderMenuBadges,
} from "@/lib/tableOrders";
import MobileListPagination from "@/components/Dashboard/mobile/MobileListPagination";
import {
  Card,
  EmptyState,
  NoResultsState,
  Skeleton,
  SkeletonRegion,
} from "@/components/ui";
import DeliveryOrderMobileCard from "./DeliveryOrderMobileCard";

/** Shared by both branches so the grid does not reflow when the data lands. */
const ordersGridClass =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6";

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
  /** Ids a socket update just changed; those cards flash their border once. */
  changedIds?: ReadonlySet<string>;
  onView: (id: string) => void;
  onActionComplete: (result: OrderActionResult) => void;
}

/** Mirrors the ticket's own shape — header, ruled rows, action foot — so the
 *  grid does not reflow when the orders arrive. */
function OrderCardSkeleton() {
  return (
    <Card padded="none" className="overflow-hidden">
      <div className="flex items-start justify-between gap-2 border-b border-line px-3.5 py-3">
        <div className="min-w-0">
          <Skeleton className="h-2.5 w-16" rounded="sm" />
          <Skeleton className="mt-1.5 h-4 w-20" rounded="sm" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Skeleton className="h-4 w-16" rounded="full" />
          <Skeleton className="h-2.5 w-12" rounded="sm" />
        </div>
      </div>
      <div className="divide-y divide-line border-b border-line">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-baseline justify-between gap-3 px-3.5 py-2"
          >
            <Skeleton className="h-2.5 w-14" rounded="sm" />
            <Skeleton className="h-3 w-24" rounded="sm" />
          </div>
        ))}
      </div>
      <div className="border-b border-line bg-surface-2/40 px-3.5 py-2.5">
        <Skeleton className="h-3 w-full" rounded="sm" />
        <Skeleton className="mt-1.5 h-3.5 w-1/2" rounded="sm" />
      </div>
      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        <Skeleton className="h-8 w-full" rounded="sm" />
        <Skeleton className="h-8 w-full" rounded="sm" />
      </div>
    </Card>
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
  changedIds,
  onView,
  onActionComplete,
}: DeliveryOrdersCardGridProps) {
  const t = useTranslations("deliveryOrders");

  if (loading) {
    return (
      <div id="onboarding-delivery-orders-table">
        <SkeletonRegion label={t("loading")} className={ordersGridClass}>
          {Array.from({ length: 8 }).map((_, index) => (
            <OrderCardSkeleton key={index} />
          ))}
        </SkeletonRegion>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div id="onboarding-delivery-orders-table">
        {isFiltered ? (
          <NoResultsState title={t("noSearchResults")} />
        ) : (
          <EmptyState
            icon={<MdOutlineDeliveryDining />}
            title={t("empty")}
            description={t("emptyHint")}
          />
        )}
      </div>
    );
  }

  return (
    <div id="onboarding-delivery-orders-table" className="space-y-6">
      <div className={`${ordersGridClass} items-stretch`}>
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
