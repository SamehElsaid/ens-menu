/** Plan ads quota helpers. -1 = unlimited. */
export const FREE_MAX_ADS_PER_MENU = 1;

/** Whether a new ad can be created (total stored ads vs plan cap). */
export function canAddMenuAd(
  maxAdsPerMenu: number,
  currentAdCount: number,
): boolean {
  if (maxAdsPerMenu < 0) return true;
  return currentAdCount < maxAdsPerMenu;
}

/** Whether another ad can be activated under the plan's active-ad quota. */
export function canActivateMenuAd(
  maxAdsPerMenu: number,
  activeAdCount: number,
): boolean {
  if (maxAdsPerMenu < 0) return true;
  return activeAdCount < maxAdsPerMenu;
}
