"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Driver } from "driver.js";
import {
  hasSeenTour,
  isOnboardingCompleted,
  markTourSeen,
  ONBOARDING_REFRESH_EVENT,
  ONBOARDING_RESTART_EVENT,
  type OnboardingRestartDetail,
  type OnboardingTourId,
} from "@/lib/onboarding/onboardingStorage";
import {
  buildOnboardingStepsForTour,
  filterStepsWithElements,
  resolveTourForPage,
} from "@/lib/onboarding/onboardingSteps";
import { runOnboardingDriver } from "@/lib/onboarding/runOnboardingDriver";

export default function OnboardingTour() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("onboarding");
  const driverRef = useRef<Driver | null>(null);
  const isRtl = locale === "ar";
  const [runTick, setRunTick] = useState(0);
  const [forceTourId, setForceTourId] = useState<OnboardingTourId | null>(
    null,
  );

  useEffect(() => {
    const bump = () => setRunTick((n) => n + 1);
    const onRestart = (event: Event) => {
      const detail = (event as CustomEvent<OnboardingRestartDetail>).detail;
      if (detail?.tourId) setForceTourId(detail.tourId);
      bump();
    };
    window.addEventListener(ONBOARDING_REFRESH_EVENT, bump);
    window.addEventListener(ONBOARDING_RESTART_EVENT, onRestart);
    return () => {
      window.removeEventListener(ONBOARDING_REFRESH_EVENT, bump);
      window.removeEventListener(ONBOARDING_RESTART_EVENT, onRestart);
    };
  }, []);

  useEffect(() => {
    const pageTour = resolveTourForPage(pathname);
    if (!pageTour) return;

    const { tourId } = pageTour;
    const isForced = forceTourId === tourId;
    const shouldAutoPlay =
      !isOnboardingCompleted() && !hasSeenTour(tourId);

    if (!isForced && !shouldAutoPlay) return;

    let cancelled = false;

    const start = async () => {
      driverRef.current?.destroy();
      driverRef.current = null;

      const steps = filterStepsWithElements(
        buildOnboardingStepsForTour(tourId, t, { isRtl }),
      );
      if (!steps.length || cancelled) return;

      const instance = await runOnboardingDriver({
        steps,
        isRtl,
        labels: {
          next: t("buttons.next"),
          prev: t("buttons.prev"),
          done: t("buttons.done"),
          skip: t("buttons.skip"),
          progress: isRtl
            ? "{{current}} من {{total}}"
            : "{{current}} of {{total}}",
        },
        onSkip: () => {
          if (!cancelled) {
            markTourSeen(tourId);
            setForceTourId(null);
          }
        },
        onDestroyed: () => {
          if (!cancelled) {
            markTourSeen(tourId);
            setForceTourId(null);
          }
        },
      });

      if (!cancelled && instance) {
        driverRef.current = instance;
      }
    };

    const timer = window.setTimeout(start, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, [pathname, t, isRtl, runTick, forceTourId]);

  return null;
}
