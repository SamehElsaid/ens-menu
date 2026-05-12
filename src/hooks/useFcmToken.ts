"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { syncFcmToken } from "@/shared/syncFcmToken";

/**
 * Runs syncFcmToken once on mount after login.
 * The API response (matches true/false) controls whether the token is updated.
 */
export function useFcmToken(): void {
  const locale = useLocale();

  useEffect(() => {
    if (typeof window === "undefined") return;
    void syncFcmToken(locale);
  }, [locale]);
}
