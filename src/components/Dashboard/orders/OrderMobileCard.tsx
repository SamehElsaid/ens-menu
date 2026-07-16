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
import { useDashboardSession } from "@/hooks/useDashboardSession";
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
}

export default function OrderMobileCard({
  entry,
  currency,
  onView,
  onActionComplete,
  menuId,
}: OrderMobileCardProps) {
  const t = useTranslations("tableOrders");
  const session = useDashboardSession();
  const menu = useAppSelector((s) => s.menuData.menu);
  const canFinish =
    session?.role !== "staff" || session?.staffJobRole === "cashier";
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
    <article className="dashboard-order-card flex h-full flex-col overflow-hidden rounded-2xl border border-violet-200/70 bg-white shadow-[0_2px_16px_rgba(124,58,237,0.08)] dark:border-violet-800/40 dark:bg-slate-800/95 dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
      <div className="bg-linear-to-r from-violet-600/10 via-fuchsia-500/5 to-transparent px-4 py-3 dark:from-violet-900/30">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-violet-200/80 dark:bg-slate-900 dark:ring-violet-700/50">
              <IoReceiptOutline className="text-xl text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                {t("colOrderId")} #{entry.orderId}
              </p>
              {entry.tableNumber && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
        {entry.pendingGuestAddition ? (
          <p className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            {t("guestAdditionBadge")}
          </p>
        ) : null}
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
        {entry.orderNotes?.trim() && (
          <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">
            <span className="text-slate-400 dark:text-slate-500">
              {t("colNotes")}:{" "}
            </span>
            {entry.orderNotes.trim()}
          </p>
        )}
        <p className="text-sm text-slate-700 dark:text-slate-200">
          <span className="text-slate-400 dark:text-slate-500">
            {t("colItems")}:{" "}
          </span>
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
            accent="violet"
          />
          {time && (
            <time className="block text-end text-xs text-slate-500 dark:text-slate-400">
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
          canFinish={canFinish}
          variant="table"
        />
        <button
          type="button"
          onClick={() => onView(entry.id)}
          className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-700/50 dark:bg-violet-950/30 dark:text-violet-300 dark:hover:bg-violet-900/40"
        >
          <IoEyeOutline className="text-base" />
          {t("view")}
        </button>
      </div>
    </article>
  );
}
