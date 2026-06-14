const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: "د.إ",
  SAR: "ر.س",
  EGP: "ج.م",
  USD: "$",
  EUR: "€",
  GBP: "£",
  KWD: "د.ك",
  QAR: "ر.ق",
  BHD: "د.ب",
  OMR: "ر.ع",
  JOD: "د.أ",
  LBP: "ل.ل",
  MAD: "د.م",
  TND: "د.ت",
  IQD: "ع.د",
  TRY: "₺",
  INR: "₹",
  PKR: "₨",
};

function formatAmount(price: number): string {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

export function getCurrencyLabel(currency: string, locale: string): string {
  const code = currency.trim().toUpperCase() || "EGP";
  if (locale === "ar") {
    return CURRENCY_SYMBOLS[code] ?? code;
  }
  return code;
}

export function formatMenuPrice(
  price: number | null | undefined,
  currency: string,
  locale: string,
): string {
  if (price == null || !Number.isFinite(Number(price))) return "—";
  const amount = formatAmount(Number(price));
  const label = getCurrencyLabel(currency, locale);
  return `${amount} ${label}`;
}

export function formatMenuPriceRange(
  min: number,
  max: number,
  currency: string,
  locale: string,
): string {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  if (low === high) {
    return formatMenuPrice(low, currency, locale);
  }
  return `${formatAmount(low)} – ${formatAmount(high)} ${getCurrencyLabel(currency, locale)}`;
}
