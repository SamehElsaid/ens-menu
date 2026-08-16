"use client";

import { useCallback, useState } from "react";
import { dismissUpcomingFeature } from "@/lib/upcomingFeatureDismiss";
import {
  findUpcomingFeatureForPath,
  type UpcomingFeatureConfig,
} from "@/lib/upcomingFeatures";

export function useUpcomingFeatureAnnouncement(pathname: string) {
  const feature: UpcomingFeatureConfig | null =
    findUpcomingFeatureForPath(pathname);
  const [announcement, setAnnouncement] = useState({
    pathname,
    open: Boolean(feature),
  });
  if (announcement.pathname !== pathname) {
    setAnnouncement({ pathname, open: Boolean(feature) });
  }
  const open = announcement.pathname === pathname && announcement.open;

  const dismiss = useCallback(() => {
    if (feature) {
      dismissUpcomingFeature(feature.id);
    }
    setAnnouncement((current) => ({ ...current, open: false }));
  }, [feature]);

  return { feature, open, dismiss };
}
