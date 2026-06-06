"use client";

import Layout from "@/components/Dashboard/Layout";
import { axiosGet } from "@/shared/axiosCall";
import { Menu } from "@/types/Menu";
import { useLocale } from "next-intl";
import { redirect, useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SET_ACTIVE_USER, SET_LOADING } from "@/store/authSlice/menuDataSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AuthUserHydrate } from "@/components/Dashboard/AuthUserHydrate";
import { FcmTokenSync } from "@/components/Dashboard/FcmTokenSync";
import {
  SuspendedAccountScreen,
  useAccountGateStatus,
} from "@/components/Dashboard/RequireNotSuspended";
import OnboardingTour from "@/components/Dashboard/OnboardingTour";
import {
  RequirePhone,
  useProfileGateStatus,
} from "@/components/Dashboard/RequirePhone";
import { DashboardTitleProvider } from "@/components/Dashboard/DashboardTitleProvider";
import { usePathname } from "@/i18n/navigation";
import {
  extractDashboardMenuRouteKey,
  menuMatchesRouteKey,
  normalizeMenuFromApi,
} from "@/lib/normalizeMenuFromApi";

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

const TOP_LEVEL_SEGMENTS = new Set(["subscription", "advertisements"]);

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
  const menuFromStore = useAppSelector((state) => state.menuData.menu);
  const [hasMenu, setHasMenu] = useState(false);
  const accountGateStatus = useAccountGateStatus();
  const profileGateStatus = useProfileGateStatus();

  const routeMenuKey = useMemo(() => {
    const fromPath = extractDashboardMenuRouteKey(pathname);
    if (isMenuRouteSegment(segment)) return segment;
    return fromPath;
  }, [pathname, segment]);

  useEffect(() => {
    const redirectToUnauthorized = () => {
      redirect(`/${locale}/unauthorized`);
    };

    if (!routeMenuKey) {
      if (segment === "subscription") setHasMenu(true);
      else setHasMenu(false);
      return;
    }

    if (menuMatchesRouteKey(menuFromStore, routeMenuKey)) {
      setHasMenu(true);
      return;
    }

    setHasMenu(false);
    dispatch(SET_LOADING());

    let cancelled = false;

    axiosGet<MenusResponse | Menu>(`/menus/${routeMenuKey}`, locale).then(
      (res) => {
        if (cancelled) return;

        if (res.status && res.data) {
          const payload = res.data as MenusResponse;
          const normalized = normalizeMenuFromApi(payload.menu ?? payload);

          if (normalized) {
            dispatch(
              SET_ACTIVE_USER({
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
            setHasMenu(true);
            return;
          }
        }

        redirectToUnauthorized();
      },
    );

    return () => {
      cancelled = true;
    };
  }, [
    routeMenuKey,
    locale,
    dispatch,
    menuFromStore?.id,
    menuFromStore?.slug,
    segment,
  ]);

  const isMenuRoute = Boolean(routeMenuKey);

  const dashboardContent = isMenuRoute ? (
    hasMenu ? (
      children
    ) : (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-11 h-11 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  ) : (
    children
  );

  const sidebarSegment = routeMenuKey ?? segment;

  const isAppLoading =
    accountGateStatus === "loading" || profileGateStatus === "loading";

  return (
    <DashboardTitleProvider>
      <AuthUserHydrate />
      <FcmTokenSync />
      {isAppLoading ? null : accountGateStatus === "suspended" ? (
        <Layout segment={sidebarSegment} hideSidebar>
          <SuspendedAccountScreen />
        </Layout>
      ) : profileGateStatus === "incomplete" ? (
        <Layout segment={sidebarSegment} hideSidebar>
          <RequirePhone enforce requireVerification={false} />
        </Layout>
      ) : (
        <Layout segment={sidebarSegment}>
          <OnboardingTour />
          {dashboardContent}
        </Layout>
      )}
    </DashboardTitleProvider>
  );
}
