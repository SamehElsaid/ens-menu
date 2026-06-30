import type { Subscription } from "@/types/Subscription";

export const EXTRA_MENU_BILLING_DAYS = 30;

export function isProSubscription(subscription: Subscription | null): boolean {
  const name = String(
    subscription?.planName ?? subscription?.plan ?? "",
  ).toLowerCase();
  return name === "pro";
}

export function getEffectiveMaxMenus(subscription: Subscription | null): number {
  const base = Number(subscription?.maxMenus ?? 1);
  const extra = Number(subscription?.extraMenus ?? 0);
  const fromApi = subscription?.effectiveMaxMenus;
  if (fromApi != null && Number.isFinite(Number(fromApi))) {
    return Number(fromApi);
  }
  return base + extra;
}

export function getExtraMenuMonthlyPrice(subscription: Subscription | null): number {
  const price = subscription?.extraMenuPrice;
  if (price != null && Number.isFinite(Number(price))) {
    return Number(price);
  }
  return 20;
}

export function getSubscriptionDaysRemaining(
  subscription: Subscription | null,
): number {
  const fromApi = subscription?.subscriptionDaysRemaining;
  if (fromApi != null && Number.isFinite(Number(fromApi)) && Number(fromApi) > 0) {
    return Number(fromApi);
  }
  return EXTRA_MENU_BILLING_DAYS;
}

/** Full month price per extra menu (20 EGP). */
export function getExtraMenuProratedPrice(
  subscription: Subscription | null,
): number {
  const fromApi = subscription?.extraMenuProratedPrice;
  if (fromApi != null && Number.isFinite(Number(fromApi))) {
    return Number(fromApi);
  }
  return getExtraMenuMonthlyPrice(subscription);
}

/** Show warning when Pro ends in less than 30 days but user pays full month. */
export function shouldShowExtraMenuShortPeriodWarning(
  subscription: Subscription | null,
): boolean {
  if (subscription?.extraMenuShortPeriodWarning === true) {
    return true;
  }
  const days = getSubscriptionDaysRemaining(subscription);
  return days > 0 && days < EXTRA_MENU_BILLING_DAYS;
}

/** Full billing-period price for extra menus on Pro renewal checkout. */
export function getExtraMenusRenewalAmount(
  count: number,
  billing: "monthly" | "yearly",
  monthlyPrice = 20,
): number {
  if (count <= 0) return 0;
  const multiplier = billing === "yearly" ? 12 : 1;
  return count * monthlyPrice * multiplier;
}

/** @deprecated Use getExtraMenuProratedPrice for checkout totals. */
export function getExtraMenuPrice(subscription: Subscription | null): number {
  return getExtraMenuProratedPrice(subscription);
}
