"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { syncFcmToken } from "@/shared/syncFcmToken";
import { isPublicHomePath } from "@/shared/isPublicHomePath";

/**
 * Runs syncFcmToken once on mount after login.
 * The API response (matches true/false) controls whether the token is updated.
 */
export function useFcmToken(): void {
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPublicHomePath(pathname)) return;
    void syncFcmToken(locale);
  }, [locale, pathname]);
}
