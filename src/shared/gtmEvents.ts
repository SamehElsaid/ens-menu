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

export function pushMenuCreatedEvent(menuUuid?: string): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "menu_created",
    ...(menuUuid
      ? {
          menu_uuid: menuUuid,
          destination: `/dashboard/${menuUuid}/import`,
        }
      : {}),
  });
}

export function pushFirstMenuCreatedEvent(callback?: () => void): void {
  if (typeof window === "undefined") return;

  // Initialize dataLayer and gtag if they don't exist
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }

  const cb = callback || (() => {});

  window.gtag("event", "user_engagement", {
    event_callback: cb,
    event_timeout: 2000,
  });
}

