"use client";

import { cn } from "@/lib/cn";
import type { OrderChargesBreakdown } from "@/lib/menuOrderCharges";

type Labels = {
  subtotal: string;
  tax: string;
  service: string;
  deliveryFee?: string;
  total: string;
};

/**
 * The money block at the foot of a ticket.
 *
 * The total is the loudest thing in the card: it is the number someone scans a
 * column of orders for, so it is a figure at display size while the lines that
 * build it stay mono captions. The lines used to be able to take an emerald
 * palette for delivery orders — the hue said nothing about the money, only
 * about which screen you were on, so it is gone.
 */
export default function OrderChargesLines({
  charges,
  currency,
  labels,
  className,
}: {
  charges: OrderChargesBreakdown;
  currency: string;
  labels: Labels;
  className?: string;
}) {
  const money = (n: number) => (
    <>
      {n}
      {currency ? (
        <span className="ms-1 text-[10px] font-medium text-fg-muted">
          {currency}
        </span>
      ) : null}
    </>
  );

  const lines: { id: string; label: string; value: number }[] = [
    { id: "subtotal", label: labels.subtotal, value: charges.itemsSubtotal },
  ];
  if (charges.taxAmount > 0) {
    const percent =
      charges.taxPercent != null && Number.isFinite(charges.taxPercent)
        ? ` (${charges.taxPercent}%)`
        : "";
    lines.push({
      id: "tax",
      label: `${labels.tax}${percent}`,
      value: charges.taxAmount,
    });
  }
  if (charges.serviceAmount > 0) {
    const percent =
      charges.servicePercent != null && Number.isFinite(charges.servicePercent)
        ? ` (${charges.servicePercent}%)`
        : "";
    lines.push({
      id: "service",
      label: `${labels.service}${percent}`,
      value: charges.serviceAmount,
    });
  }
  if (charges.deliveryFee > 0 && labels.deliveryFee) {
    lines.push({
      id: "deliveryFee",
      label: labels.deliveryFee,
      value: charges.deliveryFee,
    });
  }

  const total = (
    <div className="flex items-baseline justify-between gap-3">
      <span className="ui-label">{labels.total}</span>
      <span className="ui-figure text-[15px] text-fg" lang="en">
        {money(charges.grandTotal)}
      </span>
    </div>
  );

  if (!charges.hasExtraCharges) {
    return <div className={cn("w-full", className)}>{total}</div>;
  }

  return (
    <div className={cn("w-full", className)}>
      <dl className="flex flex-col gap-1">
        {lines.map((line) => (
          <div
            key={line.id}
            className="flex items-baseline justify-between gap-3"
          >
            <dt className="ui-label">{line.label}</dt>
            <dd className="text-xs tabular-nums text-fg-muted" lang="en">
              {money(line.value)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-1.5 border-t border-line pt-1.5">{total}</div>
    </div>
  );
}
