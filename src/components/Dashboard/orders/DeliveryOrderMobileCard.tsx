"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import ViewTime from "@/shared/ViewTime";
import {
  deliveryGovernorateLabel,
  orderStatusTone,
  resolveEntryDeliveryFee,
  resolveEntryTime,
  resolveListEntryStatus,
} from "@/lib/tableOrders";
import type { CallEntry, OrderActionResult } from "@/lib/tableOrders";
import OrderActionButtons from "./OrderActionButtons";
import OrderChargesLines from "./OrderChargesLines";
import { useAppSelector } from "@/store/hooks";
import { resolveOrderCharges } from "@/lib/menuOrderCharges";
import { IoEllipseSharp, IoEyeOutline } from "react-icons/io5";
import { MdOutlineDeliveryDining } from "react-icons/md";

interface DeliveryOrderMobileCardProps {
  entry: CallEntry;
  currency: string;
  onView: (id: string) => void;
  onActionComplete: (result: OrderActionResult) => void;
  menuId: string;
  /** Shown on account-level lists to tell orders from different menus apart. */
  menuLabel?: string;
}

export default function DeliveryOrderMobileCard({
  entry,
  currency,
  onView,
  onActionComplete,
  menuId,
  menuLabel,
}: DeliveryOrderMobileCardProps) {
  const t = useTranslations("deliveryOrders");
  const locale = useLocale();
  const menu = useAppSelector((s) => s.menuData.menu);
  const status = resolveListEntryStatus(entry);
  const tone = orderStatusTone(status);
  const time = resolveEntryTime(entry.actionDetails);
  const zoneLabel = deliveryGovernorateLabel(entry, locale);
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
        deliveryFee: resolveEntryDeliveryFee(entry),
        menu,
      }),
    [entry, menu],
  );

  return (
    <article className="dashboard-order-card flex h-full flex-col overflow-hidden rounded-lg border border-emerald-200/70 bg-white shadow-[0_2px_16px_rgba(16,185,129,0.08)] dark:border-emerald-800/40 dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
      <div className="bg-linear-to-r from-emerald-600/10 via-teal-500/5 to-transparent px-4 py-3 dark:from-emerald-900/30">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-emerald-200/80 dark:ring-emerald-700/50">
              <MdOutlineDeliveryDining className="text-xl text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-fg">
                {t("colOrderId")} #{entry.orderId}
              </p>
              {zoneLabel && (
                <p className="text-xs text-fg-muted truncate">
                  {t("colZone")}: {zoneLabel}
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
        {menuLabel ? (
          <p className="mt-2 inline-flex max-w-full truncate rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
            {menuLabel}
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
        {entry.customerPhone?.trim() && (
          <p className="text-sm text-fg-muted">
            <span className="text-fg-subtle">{t("colPhone")}: </span>
            <span dir="ltr">{entry.customerPhone.trim()}</span>
          </p>
        )}
        {entry.customerAddress?.trim() && (
          <p className="text-sm text-fg-muted line-clamp-2">
            <span className="text-fg-subtle">{t("colAddress")}: </span>
            {entry.customerAddress.trim()}
          </p>
        )}
        {/* {entry.orderNotes?.trim() && (
          <p className="text-sm text-fg-muted line-clamp-2">
            <span className="text-fg-subtle">
              {t("colNotes")}:{" "}
            </span>
            {entry.orderNotes.trim()}
          </p>
        )} */}
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
              deliveryFee: t("detailsDeliveryFee"),
              total: t("detailsTotal"),
            }}
            accent="emerald"
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
          translationNs="deliveryOrders"
          variant="delivery"
        />
        <button
          type="button"
          onClick={() => onView(entry.id)}
          className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
        >
          <IoEyeOutline className="text-base" />
          {t("view")}
        </button>
      </div>
    </article>
  );
}
