/** Locale-aware price for hero mockup — amount first in Arabic (85 ج.م). */
export function formatMockPrice(amount: number, isRtl: boolean): string {
  return isRtl ? `${amount} ج.م` : `${amount} EGP`;
}
