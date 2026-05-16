export function pushSignUpEvent(): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "sign_up" });
}

export type PurchaseEventData = {
  value: number;
  currency: string;
};

export function pushPurchaseEvent({ value, currency }: PurchaseEventData): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "purchase",
    value,
    currency,
  });
}
