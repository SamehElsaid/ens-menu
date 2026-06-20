"use client";

import { useLocale, useTranslations } from "next-intl";
import ViewTime from "@/shared/ViewTime";
import {
  deliveryGovernorateLabel,
  orderStatusTone,
  resolveEntryTime,
  resolveListEntryStatus,
} from "@/lib/tableOrders";
import type { CallEntry, OrderActionResult } from "@/lib/tableOrders";
import OrderActionButtons from "./OrderActionButtons";
import { IoEllipseSharp, IoEyeOutline } from "react-icons/io5";
import { MdOutlineDeliveryDining } from "react-icons/md";

interface DeliveryOrderMobileCardProps {
  entry: CallEntry;
  currency: string;
  onView: (id: string) => void;
  onActionComplete: (result: OrderActionResult) => void;
  menuId: string;
}

export default function DeliveryOrderMobileCard({
  entry,
  currency,
  onView,
  onActionComplete,
  menuId,
}: DeliveryOrderMobileCardProps) {
  const t = useTranslations("deliveryOrders");
  const locale = useLocale();
  const status = resolveListEntryStatus(entry);
  const tone = orderStatusTone(status);
  const time = resolveEntryTime(entry.actionDetails);
  const zoneLabel = deliveryGovernorateLabel(entry, locale);

  return (
    <article className="dashboard-order-card flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-200/70 bg-white shadow-[0_2px_16px_rgba(16,185,129,0.08)] dark:border-emerald-800/40 dark:bg-slate-800/95 dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
      <div className="bg-linear-to-r from-emerald-600/10 via-teal-500/5 to-transparent px-4 py-3 dark:from-emerald-900/30">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-emerald-200/80 dark:bg-slate-900 dark:ring-emerald-700/50">
              <MdOutlineDeliveryDining className="text-xl text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {t("colOrderId")} #{entry.orderId}
              </p>
              {zoneLabel && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
      </div>

      <div className="space-y-2 px-4 py-3">
        {entry.customerName?.trim() && (
          <p className="text-sm text-slate-700 dark:text-slate-200">
            <span className="text-slate-400 dark:text-slate-500">
              {t("colCustomer")}:{" "}
            </span>
            {entry.customerName.trim()}
          </p>
        )}
        {entry.customerPhone?.trim() && (
          <p className="text-sm text-slate-700 dark:text-slate-200">
            <span className="text-slate-400 dark:text-slate-500">
              {t("colPhone")}:{" "}
            </span>
            <span dir="ltr">{entry.customerPhone.trim()}</span>
          </p>
        )}
        {entry.customerAddress?.trim() && (
          <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">
            <span className="text-slate-400 dark:text-slate-500">
              {t("colAddress")}:{" "}
            </span>
            {entry.customerAddress.trim()}
          </p>
        )}
        {/* {entry.orderNotes?.trim() && (
          <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">
            <span className="text-slate-400 dark:text-slate-500">
              {t("colNotes")}:{" "}
            </span>
            {entry.orderNotes.trim()}
          </p>
        )} */}
        <p className="text-sm text-slate-700 dark:text-slate-200">
          <span className="text-slate-400 dark:text-slate-500">
            {t("colItems")}:{" "}
          </span>
          {entry.items?.length ?? 0}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold text-emerald-800 dark:text-emerald-200 tabular-nums">
            {entry.totalPrice ?? 0}
            {currency && (
              <span className="ms-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {currency}
              </span>
            )}
          </p>
          {time && (
            <time className="text-xs text-slate-500 dark:text-slate-400">
              <ViewTime data={time} />
            </time>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-slate-100 px-4 py-3 dark:border-slate-700/80">
        <OrderActionButtons
          menuId={menuId}
          entry={entry}
          status={status}
          onComplete={onActionComplete}
          compact
          translationNs="deliveryOrders"
        />
        <button
          type="button"
          onClick={() => onView(entry.id)}
          className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
        >
          <IoEyeOutline className="text-base" />
          {t("view")}
        </button>
      </div>
    </article>
  );
}
