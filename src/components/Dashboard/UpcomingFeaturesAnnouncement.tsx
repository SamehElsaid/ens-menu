"use client";

import UpcomingFeatureCountdownModal from "@/components/Dashboard/UpcomingFeatureCountdownModal";
import { useUpcomingFeatureAnnouncement } from "@/hooks/useUpcomingFeatureAnnouncement";
import { usePathname } from "@/i18n/navigation";

export default function UpcomingFeaturesAnnouncement() {
  const pathname = usePathname();
  const { feature, open, dismiss } = useUpcomingFeatureAnnouncement(pathname);

  if (!feature) return null;

  return (
    <UpcomingFeatureCountdownModal
      feature={feature}
      open={open}
      onClose={dismiss}
    />
  );
}
