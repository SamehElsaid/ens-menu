"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  markAiImportOnboardingComplete,
  shouldShowAiImportOnboarding,
} from "@/lib/aiImportOnboarding";

export function useCompleteAiImportOnboarding(menuId: string) {
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const authData = useAppSelector((state) => state.auth.data);
  const isOnboarding = shouldShowAiImportOnboarding(authData);

  const completeOnboarding = useCallback(async () => {
    if (!isOnboarding) return true;
    return markAiImportOnboardingComplete(locale, dispatch, authData);
  }, [authData, dispatch, isOnboarding, locale]);

  const leaveOnboarding = useCallback(async () => {
    await completeOnboarding();
    router.push(`/dashboard/${menuId}`);
  }, [completeOnboarding, menuId, router]);

  const skipOnboarding = useCallback(async () => {
    await leaveOnboarding();
  }, [leaveOnboarding]);

  return {
    isOnboarding,
    completeOnboarding,
    leaveOnboarding,
    skipOnboarding,
  };
}
