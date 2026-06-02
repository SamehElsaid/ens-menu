"use client";

import Layout from "@/components/Dashboard/Layout";
import { axiosGet } from "@/shared/axiosCall";
import { Menu } from "@/types/Menu";
import { useLocale } from "next-intl";
import { redirect, useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { SET_ACTIVE_USER, SET_LOADING } from "@/store/authSlice/menuDataSlice";
import { useAppDispatch } from "@/store/hooks";
import { AuthUserHydrate } from "@/components/Dashboard/AuthUserHydrate";
import { FcmTokenSync } from "@/components/Dashboard/FcmTokenSync";
import { RequirePhone } from "@/components/Dashboard/RequirePhone";
import OnboardingTour from "@/components/Dashboard/OnboardingTour";
import { DashboardTitleProvider } from "@/components/Dashboard/DashboardTitleProvider";

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

export default function DashboardClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const [hasMenu, setHasMenu] = useState(false);

  useEffect(() => {
    const redirectToUnauthorized = () => {
      redirect(`/${locale}/unauthorized`);
    };
    if (!segment || segment === "subscription") {
      if (segment === "subscription") {
        setHasMenu(true);
      }
      return;
    }
    dispatch(SET_LOADING());
    axiosGet<MenusResponse>(`/menus/${segment}`, locale).then((res) => {
      if (res.status) {
        dispatch(
          SET_ACTIVE_USER({
            ...res.data?.menu,
            activeItemsCount: res.data?.activeItemsCount,
            categoriesCount: res.data?.categoriesCount,
            itemsCount: res.data?.itemsCount,
            views: res.data?.views,
            qrScans: res.data?.qrScans,
            staffCount: res.data?.staffCount,
            tablesCount: res.data?.tablesCount,
            menuStaff: res.data?.menuStaff,
            menuTables: res.data?.menuTables,
          } as unknown as Menu),
        );
        setHasMenu(true);
      } else {
        redirectToUnauthorized();
      }
    });
  }, [segment, locale, dispatch]);

  return (
    <DashboardTitleProvider>
      <AuthUserHydrate />
      <FcmTokenSync />
      <Layout segment={segment}>
        <OnboardingTour />
        <RequirePhone>
          {segment && segment !== "subscription"
            ? hasMenu
              ? children
              : null
            : children}
        </RequirePhone>
      </Layout>
    </DashboardTitleProvider>
  );
}
