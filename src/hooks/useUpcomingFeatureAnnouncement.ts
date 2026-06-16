"use client";

import { useCallback, useEffect, useState } from "react";
import { dismissUpcomingFeature } from "@/lib/upcomingFeatureDismiss";
import {
  findUpcomingFeatureForPath,
  type UpcomingFeatureConfig,
} from "@/lib/upcomingFeatures";

export function useUpcomingFeatureAnnouncement(pathname: string) {
  const [feature, setFeature] = useState<UpcomingFeatureConfig | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const match = findUpcomingFeatureForPath(pathname);
    if (match) {
      setFeature(match);
      setOpen(true);
      return;
    }

    setFeature(null);
    setOpen(false);
  }, [pathname]);

  const dismiss = useCallback(() => {
    if (feature) {
      dismissUpcomingFeature(feature.id);
    }
    setOpen(false);
  }, [feature]);

  return { feature, open, dismiss };
}
