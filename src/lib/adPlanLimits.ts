/** Free plan: max custom menu ads per menu. Paid plans: unlimited. */
export const FREE_MAX_ADS_PER_MENU = 1;

export function canAddMenuAd(
  isFreePlan: boolean,
  currentAdCount: number,
): boolean {
  if (!isFreePlan) return true;
  return currentAdCount < FREE_MAX_ADS_PER_MENU;
}
