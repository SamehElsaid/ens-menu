"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname as useNextPathname } from "next/navigation";
import { useSelectedLayoutSegments } from "next/navigation";
import { usePathname as useIntlPathname } from "@/i18n/navigation";
import {
  DASHBOARD_BRAND_TITLE,
  formatDashboardDocumentTitle,
  normalizeDashboardPathname,
  resolveDashboardPageTitleFromSegments,
  resolveDashboardPageTitleRef,
  syncDocumentTitle,
  watchDocumentTitle,
} from "@/lib/dashboardPageTitle";

type UseDashboardPageTitleOptions = {
  enabled?: boolean;
};

function translatePageTitle(
  ref: { namespace: string; key: string },
  tDashboard: ReturnType<typeof useTranslations<"Dashboard">>,
  tMenus: ReturnType<typeof useTranslations<"Menus">>,
  tSettingsDesign: ReturnType<typeof useTranslations<"settingsDesignPage">>,
  tSettingsMedia: ReturnType<typeof useTranslations<"settingsMediaPage">>,
): string {
  switch (ref.namespace) {
    case "Menus":
      return tMenus(ref.key as "title");
    case "Dashboard":
      return tDashboard(ref.key as "Overview");
    case "settingsDesignPage":
      return tSettingsDesign(ref.key as "title");
    case "settingsMediaPage":
      return tSettingsMedia(ref.key as "title");
    default:
      return tDashboard("Overview");
  }
}

export function useDashboardPageTitle({
  enabled = true,
}: UseDashboardPageTitleOptions = {}): string | undefined {
  const layoutSegments = useSelectedLayoutSegments();
  const intlPathname = useIntlPathname();
  const nextPathname = useNextPathname();

  const tDashboard = useTranslations("Dashboard");
  const tMenus = useTranslations("Menus");
  const tSettingsDesign = useTranslations("settingsDesignPage");
  const tSettingsMedia = useTranslations("settingsMediaPage");

  const pageTitle = useMemo(() => {
    if (!enabled) return undefined;

    const fromSegments = resolveDashboardPageTitleFromSegments(
      layoutSegments ?? [],
    );
    const ref =
      fromSegments ??
      resolveDashboardPageTitleRef(
        intlPathname || normalizeDashboardPathname(nextPathname),
      );

    if (!ref) return undefined;

    return translatePageTitle(
      ref,
      tDashboard,
      tMenus,
      tSettingsDesign,
      tSettingsMedia,
    );
  }, [
    enabled,
    intlPathname,
    layoutSegments,
    nextPathname,
    tDashboard,
    tMenus,
    tSettingsDesign,
    tSettingsMedia,
  ]);

  const documentTitle = useMemo(
    () =>
      enabled ? formatDashboardDocumentTitle(pageTitle) : DASHBOARD_BRAND_TITLE,
    [enabled, pageTitle],
  );

  useLayoutEffect(() => {
    if (!enabled) {
      syncDocumentTitle(DASHBOARD_BRAND_TITLE);
      return;
    }
    syncDocumentTitle(documentTitle);
  }, [documentTitle, enabled]);

  useEffect(() => {
    if (!enabled) return;

    return watchDocumentTitle(documentTitle, () => {
      syncDocumentTitle(documentTitle);
    });
  }, [documentTitle, enabled, intlPathname, layoutSegments, nextPathname]);

  return pageTitle;
}
