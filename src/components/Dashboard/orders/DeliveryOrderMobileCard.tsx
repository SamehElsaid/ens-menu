"use client";

import { useMemo, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import ViewTime from "@/shared/ViewTime";
import {
  deliveryGovernorateLabel,
  resolveEntryDeliveryFee,
  resolveEntryTime,
  resolveListEntryStatus,
} from "@/lib/tableOrders";
import type { CallEntry, OrderActionResult } from "@/lib/tableOrders";
import OrderActionButtons from "./OrderActionButtons";
import OrderChargesLines from "./OrderChargesLines";
import { OrderStatusBadge } from "./orderStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { resolveOrderCharges } from "@/lib/menuOrderCharges";
import { IoEyeOutline } from "react-icons/io5";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { cn } from "@/lib/cn";
import { Badge, Button, Card } from "@/components/ui";

interface DeliveryOrderMobileCardProps {
  entry: CallEntry;
  currency: string;
  onView: (id: string) => void;
  onActionComplete: (result: OrderActionResult) => void;
  menuId: string;
  /** Shown on account-level lists to tell orders from different menus apart. */
  menuLabel?: string;
  /** A socket update just changed this order; its border says so for 1.2s. */
  justChanged?: boolean;
}

/**
 * One delivery order.
 *
 * Read as a record rather than a summary card: a header carrying the order
 * number as the figure it is, a divided list of the fields someone actually
 * calls the customer about, the money block, and the actions behind a divider
 * at the foot. A pending order takes the active `Card` treatment — brand
 * border, wash and inline edge, the one thing that says "this one is still
 * live" — so a screen of twelve cards can be triaged down the inline start.
 */
export default function DeliveryOrderMobileCard({
  entry,
  currency,
  onView,
  onActionComplete,
  menuId,
  menuLabel,
  justChanged = false,
}: DeliveryOrderMobileCardProps) {
  const t = useTranslations("deliveryOrders");
  const locale = useLocale();
  const menu = useAppSelector((s) => s.menuData.menu);
  const status = resolveListEntryStatus(entry);
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

  const rows: { id: string; label: string; value: ReactNode }[] = [];
  const customerName = entry.customerName?.trim();
  const customerPhone = entry.customerPhone?.trim();
  const customerAddress = entry.customerAddress?.trim();
  if (customerName) {
    rows.push({ id: "customer", label: t("colCustomer"), value: customerName });
  }
  if (customerPhone) {
    rows.push({
      id: "phone",
      label: t("colPhone"),
      value: (
        <span dir="ltr" className="tabular-nums">
          {customerPhone}
        </span>
      ),
    });
  }
  if (zoneLabel) {
    rows.push({ id: "zone", label: t("colZone"), value: zoneLabel });
  }
  if (customerAddress) {
    rows.push({
      id: "address",
      label: t("colAddress"),
      value: <span className="line-clamp-2">{customerAddress}</span>,
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
      active={status === "pending"}
      className={cn(
        "flex h-full flex-col overflow-hidden",
        justChanged && "ui-flash",
      )}
    >
      <header className="border-b border-line px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="ui-label flex items-center gap-1.5">
              <MdOutlineDeliveryDining className="size-3.5" aria-hidden />
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
        {menuLabel ? (
          <Badge tone="neutral" className="mt-2 max-w-full truncate">
            {menuLabel}
          </Badge>
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
            deliveryFee: t("detailsDeliveryFee"),
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
          translationNs="deliveryOrders"
          variant="delivery"
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
