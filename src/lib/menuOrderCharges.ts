import type { CallItem } from "@/lib/tableOrders";

export type MenuChargeSettings = {
  taxEnabled?: boolean | null;
  taxPercent?: number | null;
  serviceEnabled?: boolean | null;
  servicePercent?: number | null;
};

export type OrderChargesBreakdown = {
  itemsSubtotal: number;
  taxAmount: number;
  taxPercent: number | null;
  serviceAmount: number;
  servicePercent: number | null;
  deliveryFee: number;
  grandTotal: number;
  hasExtraCharges: boolean;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function sumCallItems(items: CallItem[] | null | undefined): number {
  if (!items?.length) return 0;
  return roundMoney(
    items.reduce((sum, item) => {
      const line =
        item.total != null && Number.isFinite(Number(item.total))
          ? Number(item.total)
          : (Number(item.price) || 0) * (Number(item.quantity) || 1);
      return sum + line;
    }, 0),
  );
}

function percentOf(base: number, percent: number | null | undefined): number {
  const p = Number(percent);
  if (!Number.isFinite(p) || p <= 0) return 0;
  return roundMoney(base * (p / 100));
}

/** Resolve tax/service lines for order cards and details. Prefer stored values. */
export function resolveOrderCharges(options: {
  items?: CallItem[] | null;
  storedItemsSubtotal?: number | null;
  storedTaxAmount?: number | null;
  storedServiceAmount?: number | null;
  storedTaxPercent?: number | null;
  storedServicePercent?: number | null;
  storedTotal?: number | null;
  deliveryFee?: number | null;
  menu?: MenuChargeSettings | null;
}): OrderChargesBreakdown {
  const itemsSubtotal =
    options.storedItemsSubtotal != null &&
    Number.isFinite(Number(options.storedItemsSubtotal))
      ? roundMoney(Number(options.storedItemsSubtotal))
      : sumCallItems(options.items);

  const hasStoredTax =
    options.storedTaxAmount != null &&
    Number.isFinite(Number(options.storedTaxAmount));
  const hasStoredService =
    options.storedServiceAmount != null &&
    Number.isFinite(Number(options.storedServiceAmount));

  const taxAmount = hasStoredTax
    ? roundMoney(Number(options.storedTaxAmount))
    : options.menu?.taxEnabled === true
      ? percentOf(itemsSubtotal, options.menu.taxPercent)
      : 0;
  const serviceAmount = hasStoredService
    ? roundMoney(Number(options.storedServiceAmount))
    : options.menu?.serviceEnabled === true
      ? percentOf(itemsSubtotal, options.menu.servicePercent)
      : 0;

  const taxPercent = hasStoredTax
    ? options.storedTaxPercent != null
      ? Number(options.storedTaxPercent)
      : null
    : options.menu?.taxEnabled === true
      ? Number(options.menu.taxPercent) || null
      : null;
  const servicePercent = hasStoredService
    ? options.storedServicePercent != null
      ? Number(options.storedServicePercent)
      : null
    : options.menu?.serviceEnabled === true
      ? Number(options.menu.servicePercent) || null
      : null;

  const deliveryFee =
    options.deliveryFee != null &&
    Number.isFinite(Number(options.deliveryFee)) &&
    Number(options.deliveryFee) > 0
      ? Number(options.deliveryFee)
      : 0;

  const computedTotal = roundMoney(
    itemsSubtotal + taxAmount + serviceAmount + deliveryFee,
  );
  const storedTotal =
    options.storedTotal != null && Number.isFinite(Number(options.storedTotal))
      ? Number(options.storedTotal)
      : null;
  const grandTotal =
    storedTotal != null && taxAmount === 0 && serviceAmount === 0
      ? roundMoney(storedTotal + deliveryFee)
      : storedTotal != null &&
          Math.abs(storedTotal + deliveryFee - computedTotal) < 0.05
        ? roundMoney(storedTotal + deliveryFee)
        : computedTotal;

  return {
    itemsSubtotal,
    taxAmount,
    taxPercent,
    serviceAmount,
    servicePercent,
    deliveryFee,
    grandTotal,
    hasExtraCharges:
      taxAmount > 0 || serviceAmount > 0 || deliveryFee > 0,
  };
}
