import { isUpcomingFeatureDismissed } from "@/lib/upcomingFeatureDismiss";

export type UpcomingFeatureRouteScope = "menuOverview" | "anyMenuPage";

export type UpcomingFeatureConfig = {
  /** Unique id — used for localStorage dismiss key */
  id: string;
  /** Key under `Dashboard.upcomingFeatures.features` in messages */
  messageKey: string;
  /** Set to false to hide the countdown popup for this feature */
  showCountdown: boolean;
  /** ISO date when the feature goes live */
  launchAt: string;
  /** Where the popup should auto-open */
  routeScope: UpcomingFeatureRouteScope;
};

/**
 * Upcoming feature announcements. Add new entries here for future launches.
 * Each feature needs matching keys under `Dashboard.upcomingFeatures.features` in messages.
 */
export const UPCOMING_FEATURES: UpcomingFeatureConfig[] = [
  {
    id: "delivery-orders",
    messageKey: "deliveryOrders",
    showCountdown: true,
    launchAt: "2026-06-18T00:00:00.000Z",
    routeScope: "menuOverview",
  },
];

function stripLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || pathname;
}

export function matchesUpcomingFeatureRoute(
  scope: UpcomingFeatureRouteScope,
  pathname: string,
): boolean {
  const path = stripLocalePrefix(pathname);

  if (scope === "menuOverview") {
    return /^\/dashboard\/[^/]+$/.test(path);
  }

  return /^\/dashboard\/[^/]+/.test(path);
}

export function findUpcomingFeatureForPath(
  pathname: string,
): UpcomingFeatureConfig | null {
  const now = Date.now();

  for (const feature of UPCOMING_FEATURES) {
    if (!feature.showCountdown) continue;
    if (isUpcomingFeatureDismissed(feature.id)) continue;
    if (new Date(feature.launchAt).getTime() <= now) continue;
    if (!matchesUpcomingFeatureRoute(feature.routeScope, pathname)) continue;
    return feature;
  }

  return null;
}
