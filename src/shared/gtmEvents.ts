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

export function pushFirstMenuCreatedEvent(): void {
  if (typeof window === "undefined") return;

  // 1. Inject Google Tag Manager script for AW-18048331734 if not already present
  const scriptId = "google-ads-first-menu";
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=AW-18048331734";
    document.head.appendChild(script);
  }

  // 2. Initialize dataLayer and gtag if they don't exist
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }

  // 3. Fire the configuration commands for AW-18048331734
  window.gtag("js", new Date());
  window.gtag("config", "AW-18048331734");
}

