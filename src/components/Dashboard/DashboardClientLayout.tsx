"use client";

import Layout from "@/components/Dashboard/Layout";
import { axiosGet } from "@/shared/axiosCall";
import { Menu } from "@/types/Menu";
import { useLocale } from "next-intl";
import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  SET_ACTIVE_MENU_CACHE,
  SET_MENU_CACHE_LOADING,
} from "@/store/authSlice/menuDataSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { FcmTokenSync } from "@/components/Dashboard/FcmTokenSync";
import {
  SuspendedAccountScreen,
  useAccountGateStatus,
} from "@/components/Dashboard/RequireNotSuspended";
import {
  RequirePhone,
  useProfileGateStatus,
} from "@/components/Dashboard/RequirePhone";
import { DashboardTitleProvider } from "@/components/Dashboard/DashboardTitleProvider";
import { LoadingBlock } from "@/components/ui";
import UpcomingFeaturesAnnouncement from "@/components/Dashboard/UpcomingFeaturesAnnouncement";
import { PendingOrdersProvider } from "@/components/Dashboard/PendingOrdersProvider";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  extractDashboardMenuRouteKey,
  menuMatchesRouteKey,
  normalizeMenuFromApi,
} from "@/lib/normalizeMenuFromApi";
import { ACCOUNT_SEGMENTS } from "@/lib/consoleNav";

interface MenusResponse {
  menu: Menu;
  activeItemsCount: number;
  categoriesCount: number;
  itemsCount: number;
  views: number;
  qrScans?: number;
  staffCount?: number;
  tablesCount?: number;
  menuStaff?: unknown[];
  menuTables?: unknown[];
}

/**
 * Segments directly under `/dashboard` that are *not* a menu id. Without them
 * the layout would try to load `/menus/orders` and bounce to /unauthorized.
 *
 * Derived from the account nav so a new account route cannot be added without
 * this set learning about it. `advertisements` and `domain-transfer` are legacy
 * account stubs kept for old links; `domain-transfer` in particular was missing
 * here, so visiting it fetched a menu named "domain-transfer".
 */
const TOP_LEVEL_SEGMENTS = new Set([
  ...ACCOUNT_SEGMENTS,
  "subscription",
  "advertisements",
  "domain-transfer",
]);

function isMenuRouteSegment(segment: string | null): segment is string {
  return Boolean(segment && !TOP_LEVEL_SEGMENTS.has(segment));
}

export default function DashboardClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const router = useRouter();
  const menuFromStore = useAppSelector((state) => state.menuData.menu);
  const [loadedMenuKey, setLoadedMenuKey] = useState<string | null>(null);
  const accountGateStatus = useAccountGateStatus();
  const profileGateStatus = useProfileGateStatus();

  const routeMenuKey = useMemo(() => {
    const fromPath = extractDashboardMenuRouteKey(pathname);
    if (isMenuRouteSegment(segment)) return segment;
    return fromPath;
  }, [pathname, segment]);

  const storeMatchesRoute = Boolean(
    routeMenuKey && menuMatchesRouteKey(menuFromStore, routeMenuKey),
  );
  const hasMenu = storeMatchesRoute || loadedMenuKey === routeMenuKey;

  useEffect(() => {
    if (!routeMenuKey || storeMatchesRoute) {
      return;
    }

    const redirectToUnauthorized = () => {
      router.replace("/unauthorized");
    };

    dispatch(SET_MENU_CACHE_LOADING());

    let cancelled = false;

    axiosGet<MenusResponse | Menu>(`/menus/${routeMenuKey}`, locale).then(
      (res) => {
        if (cancelled) return;

        if (res.status && res.data) {
          const payload = res.data as MenusResponse;
          const normalized = normalizeMenuFromApi(payload.menu ?? payload);

          if (normalized) {
            dispatch(
              SET_ACTIVE_MENU_CACHE({
                ...normalized,
                activeItemsCount:
                  payload.activeItemsCount ?? normalized.activeItemsCount,
                categoriesCount:
                  payload.categoriesCount ?? normalized.categoriesCount,
                itemsCount: payload.itemsCount ?? normalized.itemsCount,
                views: payload.views ?? normalized.views,
                qrScans: payload.qrScans,
                staffCount: payload.staffCount,
                tablesCount: payload.tablesCount,
                menuStaff: payload.menuStaff as Menu["menuStaff"],
                menuTables: payload.menuTables as Menu["menuTables"],
              }),
            );
            setLoadedMenuKey(routeMenuKey);
            return;
          }
        }

        redirectToUnauthorized();
      },
    );

    return () => {
      cancelled = true;
    };
  }, [routeMenuKey, locale, dispatch, storeMatchesRoute, router]);

  const isMenuRoute = Boolean(routeMenuKey);

  const dashboardContent = isMenuRoute ? (
    hasMenu ? (
      children
    ) : (
      <LoadingBlock className="min-h-[50vh]" />
    )
  ) : (
    children
  );

  const sidebarSegment = routeMenuKey ?? segment;
  // Anything that is not a menu route lives on the account shell: /dashboard
  // itself plus the global orders/staff pages.
  const sidebarVariant = isMenuRoute ? "menu" : "account";

  const isAppLoading =
    accountGateStatus === "loading" || profileGateStatus === "loading";

  return (
    <DashboardTitleProvider>
      <PendingOrdersProvider>
        <FcmTokenSync />
        <UpcomingFeaturesAnnouncement />
        {isAppLoading ? null : accountGateStatus === "suspended" ? (
          <Layout segment={sidebarSegment} variant={sidebarVariant} hideSidebar>
            <SuspendedAccountScreen />
          </Layout>
        ) : profileGateStatus === "incomplete" ? (
          <Layout segment={sidebarSegment} variant={sidebarVariant} hideSidebar>
            <RequirePhone enforce requireVerification={false} />
          </Layout>
        ) : (
          <Layout segment={sidebarSegment} variant={sidebarVariant}>
            {dashboardContent}
          </Layout>
        )}
      </PendingOrdersProvider>
    </DashboardTitleProvider>
  );
}
