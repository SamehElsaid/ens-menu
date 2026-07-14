"use client";

import type { OrderChargesBreakdown } from "@/lib/menuOrderCharges";

type Labels = {
  subtotal: string;
  tax: string;
  service: string;
  deliveryFee?: string;
  total: string;
};

export default function OrderChargesLines({
  charges,
  currency,
  labels,
  accent = "violet",
}: {
  charges: OrderChargesBreakdown;
  currency: string;
  labels: Labels;
  accent?: "violet" | "emerald";
}) {
  const money = (n: number) => (
    <>
      {n}
      {currency ? (
        <span className="ms-1 text-[10px] font-semibold opacity-80">
          {currency}
        </span>
      ) : null}
    </>
  );

  const muted =
    accent === "emerald"
      ? "text-emerald-700/80 dark:text-emerald-300/80"
      : "text-violet-700/80 dark:text-violet-300/80";
  const strong =
    accent === "emerald"
      ? "text-emerald-900 dark:text-emerald-100"
      : "text-violet-900 dark:text-violet-100";

  if (!charges.hasExtraCharges) {
    return (
      <p className={`text-base font-bold tabular-nums ${strong}`}>
        {money(charges.grandTotal)}
      </p>
    );
  }

  return (
    <div className="w-full space-y-1 text-xs">
      <div className={`flex items-center justify-between gap-2 ${muted}`}>
        <span>{labels.subtotal}</span>
        <span className="tabular-nums font-medium">
          {money(charges.itemsSubtotal)}
        </span>
      </div>
      {charges.taxAmount > 0 && (
        <div className={`flex items-center justify-between gap-2 ${muted}`}>
          <span>
            {labels.tax}
            {charges.taxPercent != null && Number.isFinite(charges.taxPercent)
              ? ` (${charges.taxPercent}%)`
              : ""}
          </span>
          <span className="tabular-nums font-medium">
            {money(charges.taxAmount)}
          </span>
        </div>
      )}
      {charges.serviceAmount > 0 && (
        <div className={`flex items-center justify-between gap-2 ${muted}`}>
          <span>
            {labels.service}
            {charges.servicePercent != null &&
            Number.isFinite(charges.servicePercent)
              ? ` (${charges.servicePercent}%)`
              : ""}
          </span>
          <span className="tabular-nums font-medium">
            {money(charges.serviceAmount)}
          </span>
        </div>
      )}
      {charges.deliveryFee > 0 && labels.deliveryFee && (
        <div className={`flex items-center justify-between gap-2 ${muted}`}>
          <span>{labels.deliveryFee}</span>
          <span className="tabular-nums font-medium">
            {money(charges.deliveryFee)}
          </span>
        </div>
      )}
      <div
        className={`flex items-center justify-between gap-2 border-t border-current/10 pt-1 text-sm font-bold tabular-nums ${strong}`}
      >
        <span>{labels.total}</span>
        <span>{money(charges.grandTotal)}</span>
      </div>
    </div>
  );
}
