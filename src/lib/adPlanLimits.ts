/** Plan ads quota helpers. -1 = unlimited. */
export const FREE_MAX_ADS_PER_MENU = 1;

export function canAddMenuAd(
  maxAdsPerMenu: number,
  currentAdCount: number,
): boolean {
  if (maxAdsPerMenu < 0) return true;
  return currentAdCount < maxAdsPerMenu;
}
