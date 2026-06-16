const STORAGE_PREFIX = "ensmenu_dismissed_upcoming_";

export function upcomingFeatureDismissKey(featureId: string): string {
  return `${STORAGE_PREFIX}${featureId}`;
}

export function isUpcomingFeatureDismissed(featureId: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(upcomingFeatureDismissKey(featureId)) === "1";
}

export function dismissUpcomingFeature(featureId: string): void {
  localStorage.setItem(upcomingFeatureDismissKey(featureId), "1");
}
