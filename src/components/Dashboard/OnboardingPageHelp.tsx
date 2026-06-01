"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  ONBOARDING_RESTART_EVENT,
  restartTourForPage,
  type OnboardingRestartDetail,
} from "@/lib/onboarding/onboardingStorage";
import { resolveTourForPage } from "@/lib/onboarding/onboardingSteps";

type OnboardingPageHelpProps = {
  className?: string;
};

export default function OnboardingPageHelp({
  className = "",
}: OnboardingPageHelpProps) {
  const t = useTranslations("onboarding");
  const pathname = usePathname();
  const pageTour = resolveTourForPage(pathname);

  if (!pageTour) return null;

  const handleRestart = () => {
    restartTourForPage(pageTour.tourId);
    window.dispatchEvent(
      new CustomEvent<OnboardingRestartDetail>(ONBOARDING_RESTART_EVENT, {
        detail: { tourId: pageTour.tourId },
      }),
    );
  };

  return (
    <button
      type="button"
      onClick={handleRestart}
      title={t("restartTutorial")}
      aria-label={t("restartTutorial")}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold leading-none text-slate-500 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-violet-500/50 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 ${className}`.trim()}
    >
      !
    </button>
  );
}
