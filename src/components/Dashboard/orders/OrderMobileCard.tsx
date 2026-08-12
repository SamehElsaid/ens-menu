"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ViewTime from "@/shared/ViewTime";
import { resolveEntryTime, resolveListEntryStatus } from "@/lib/tableOrders";
import type { CallEntry, OrderActionResult } from "@/lib/tableOrders";
import OrderActionButtons from "./OrderActionButtons";
import OrderChargesLines from "./OrderChargesLines";
import { OrderStatusBadge } from "./orderStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { resolveOrderCharges } from "@/lib/menuOrderCharges";
import { IoEyeOutline, IoReceiptOutline } from "react-icons/io5";
import { cn } from "@/lib/cn";
import { Badge, Button, Card } from "@/components/ui";

interface OrderMobileCardProps {
  entry: CallEntry;
  currency: string;
  onView: (id: string) => void;
  onActionComplete: (result: OrderActionResult) => void;
  menuId: string;
  /** Shown on account-level lists to tell orders from different menus apart. */
  menuLabel?: string;
  /** A socket update just changed this ticket; its border says so for 1.2s. */
  justChanged?: boolean;
}

/**
 * One table ticket.
 *
 * The two things that interrupt service — a guest who changed the order after
 * the kitchen accepted it, and a table asking for the bill — used to be a red
 * two-pixel frame and a pair of tinted pills competing with the status. They
 * are now badges on the same row as the status, so the card has one place a
 * reader looks for "what is going on with this table" instead of three.
 */
export default function OrderMobileCard({
  entry,
  currency,
  onView,
  onActionComplete,
  menuId,
  menuLabel,
  justChanged = false,
}: OrderMobileCardProps) {
  const t = useTranslations("tableOrders");
  const menu = useAppSelector((s) => s.menuData.menu);
  const status = resolveListEntryStatus(entry);
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

  const rows: { id: string; label: string; value: ReactNode }[] = [];
  const tableNumber = entry.tableNumber?.toString().trim();
  const customerName = entry.customerName?.trim();
  const orderNotes = entry.orderNotes?.trim();
  if (tableNumber) {
    rows.push({
      id: "table",
      label: t("colTable"),
      value: (
        <span className="ui-figure text-fg" lang="en">
          {tableNumber}
        </span>
      ),
    });
  }
  if (customerName) {
    rows.push({ id: "customer", label: t("colCustomer"), value: customerName });
  }
  if (orderNotes) {
    rows.push({
      id: "notes",
      label: t("colNotes"),
      value: <span className="line-clamp-2">{orderNotes}</span>,
    });
  }
  rows.push({
    id: "items",
    label: t("colItems"),
    value: (
      <span className="ui-figure text-fg" lang="en">
        {entry.items?.length ?? 0}
      </span>
    ),
  });

  return (
    <Card
      as="article"
      padded="none"
      active={status === "pending" || entry.pendingBillRequest === true}
      className={cn(
        "flex h-full flex-col overflow-hidden",
        justChanged && "ui-flash",
      )}
    >
      <header className="border-b border-line px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="ui-label flex items-center gap-1.5">
              <IoReceiptOutline className="size-3.5" aria-hidden />
              {t("colOrderId")}
            </p>
            <p className="ui-figure mt-0.5 text-base text-fg" lang="en">
              #{entry.orderId}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <OrderStatusBadge
              status={status}
              label={t(`orderStatus.${status}` as never)}
            />
            {time ? (
              <time className="ui-label">
                <ViewTime data={time} />
              </time>
            ) : null}
          </div>
        </div>
        {menuLabel || entry.pendingGuestAddition || entry.pendingBillRequest ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {menuLabel ? (
              <Badge tone="neutral" className="max-w-full truncate">
                {menuLabel}
              </Badge>
            ) : null}
            {entry.pendingGuestAddition ? (
              <Badge tone="warning" dot>
                {t("guestAdditionBadge")}
              </Badge>
            ) : null}
            {entry.pendingBillRequest ? (
              <Badge tone="danger" dot>
                {t("billRequestBadge")}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </header>

      <dl className="divide-y divide-line border-b border-line">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-baseline justify-between gap-3 px-3.5 py-1.5"
          >
            <dt className="ui-label shrink-0">{row.label}</dt>
            <dd className="min-w-0 text-end text-[13px] text-fg">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-b border-line bg-surface-2/40 px-3.5 py-2.5">
        <OrderChargesLines
          charges={charges}
          currency={currency}
          labels={{
            subtotal: t("detailsSubtotal"),
            tax: t("detailsTax"),
            service: t("detailsService"),
            total: t("detailsTotal"),
          }}
        />
      </div>

      <div className="mt-auto flex flex-col gap-1.5 px-3.5 py-3">
        <OrderActionButtons
          menuId={menuId}
          entry={entry}
          status={status}
          onComplete={onActionComplete}
          compact
          variant="table"
        />
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={() => onView(entry.id)}
          startIcon={<IoEyeOutline className="text-base" />}
        >
          {t("view")}
        </Button>
      </div>
    </Card>
  );
}
