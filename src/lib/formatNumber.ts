export function formatEgpPrice(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatEgpAmount(
  value: unknown,
  fallback = "—",
): string {
  if (value == null || value === "") return fallback;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return fallback;
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} EGP`;
}
