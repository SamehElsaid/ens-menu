"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import ViewTime from "@/shared/ViewTime";
import {
  orderStatusTone,
  resolveEntryTime,
  resolveListEntryStatus,
} from "@/lib/tableOrders";
import type { CallEntry, OrderActionResult } from "@/lib/tableOrders";
import OrderActionButtons from "./OrderActionButtons";
import OrderChargesLines from "./OrderChargesLines";
import { useAppSelector } from "@/store/hooks";
import { resolveOrderCharges } from "@/lib/menuOrderCharges";
import {
  IoEllipseSharp,
  IoEyeOutline,
  IoReceiptOutline,
} from "react-icons/io5";

interface OrderMobileCardProps {
  entry: CallEntry;
  currency: string;
  onView: (id: string) => void;
  onActionComplete: (result: OrderActionResult) => void;
  menuId: string;
  /** Shown on account-level lists to tell orders from different menus apart. */
  menuLabel?: string;
}

export default function OrderMobileCard({
  entry,
  currency,
  onView,
  onActionComplete,
  menuId,
  menuLabel,
}: OrderMobileCardProps) {
  const t = useTranslations("tableOrders");
  const menu = useAppSelector((s) => s.menuData.menu);
  const status = resolveListEntryStatus(entry);
  const tone = orderStatusTone(status);
  const time = resolveEntryTime(entry.actionDetails);
  const charges = useMemo(
    () =>
      resolveOrderCharges({
        items: entry.items,
        storedItemsSubtotal: entry.itemsSubtotal,
        storedTaxAmount: entry.taxAmount,
        storedServiceAmount: entry.serviceAmount,
        storedTaxPercent: entry.taxPercent,
        storedServicePercent: entry.servicePercent,
        storedTotal: entry.totalPrice,
        menu,
      }),
    [entry, menu],
  );

  return (
    <article
      className={[
        "dashboard-order-card flex h-full flex-col overflow-hidden rounded-lg bg-surface shadow-sm",
        entry.pendingBillRequest
          ? "border-2 border-red-500 shadow-sm dark:border-red-500"
          : "border border-line",
      ].join(" ")}
    >
      <div className="border-b border-line bg-surface-2 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface ring-1 ring-line">
              <IoReceiptOutline className="text-xl text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-fg">
                {t("colOrderId")} #{entry.orderId}
              </p>
              {entry.tableNumber && (
                <p className="text-xs text-fg-muted">
                  {t("colTable")}: {entry.tableNumber}
                </p>
              )}
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.pill}`}
          >
            <IoEllipseSharp className={`text-[5px] ${tone.dot}`} aria-hidden />
            {t(`orderStatus.${status}` as never)}
          </span>
        </div>
        {menuLabel || entry.pendingGuestAddition ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {menuLabel ? (
              <span className="inline-flex max-w-full truncate rounded-full border border-brand-line bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand-soft-fg">
                {menuLabel}
              </span>
            ) : null}
            {entry.pendingGuestAddition ? (
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                {t("guestAdditionBadge")}
              </span>
            ) : null}
          </div>
        ) : null}
        {entry.pendingBillRequest ? (
          <p className="mt-2 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-200">
            {t("billRequestBadge")}
          </p>
        ) : null}
      </div>

      <div className="space-y-2 px-4 py-3">
        {entry.customerName?.trim() && (
          <p className="text-sm text-fg-muted">
            <span className="text-fg-subtle">{t("colCustomer")}: </span>
            {entry.customerName.trim()}
          </p>
        )}
        {entry.orderNotes?.trim() && (
          <p className="text-sm text-fg-muted line-clamp-2">
            <span className="text-fg-subtle">{t("colNotes")}: </span>
            {entry.orderNotes.trim()}
          </p>
        )}
        <p className="text-sm text-fg-muted">
          <span className="text-fg-subtle">{t("colItems")}: </span>
          {entry.items?.length ?? 0}
        </p>
        <div className="space-y-2">
          <OrderChargesLines
            charges={charges}
            currency={currency}
            labels={{
              subtotal: t("detailsSubtotal"),
              tax: t("detailsTax"),
              service: t("detailsService"),
              total: t("detailsTotal"),
            }}
            accent="brand"
          />
          {time && (
            <time className="block text-end text-xs text-fg-muted">
              <ViewTime data={time} />
            </time>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-line px-4 py-3 dark:border-line/80">
        <OrderActionButtons
          menuId={menuId}
          entry={entry}
          status={status}
          onComplete={onActionComplete}
          compact
          variant="table"
        />
        <button
          type="button"
          onClick={() => onView(entry.id)}
          className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-3"
        >
          <IoEyeOutline className="text-base" />
          {t("view")}
        </button>
      </div>
    </article>
  );
}
