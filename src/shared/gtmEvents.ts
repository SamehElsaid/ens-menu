export type SignUpMethod = "email" | "google";

export function pushSignUpEvent(method: SignUpMethod = "email"): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "signup_success",
    signup_method: method,
    platform: "ensmenu",
  });
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
