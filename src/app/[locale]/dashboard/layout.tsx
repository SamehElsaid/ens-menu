"use client";

import Layout from "@/components/Dashboard/Layout";
import { axiosGet } from "@/shared/axiosCall";
import { Menu } from "@/types/Menu";
import { useLocale } from "next-intl";
import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { SET_ACTIVE_USER, SET_LOADING } from "@/store/authSlice/menuDataSlice";
import { useAppDispatch } from "@/store/hooks";

interface ParentLayoutProps {
  children: ReactNode;
}

interface MenusResponse {
  menu: Menu;
  activeItemsCount: number;
  categoriesCount: number;
  itemsCount: number;
  views: number;
}
export default function ParentLayout({ children }: ParentLayoutProps) {
  const segment = useSelectedLayoutSegment();

  const dispatch = useAppDispatch();
  const locale = useLocale();
  useEffect(() => {
    if (segment) {
      dispatch(SET_LOADING());
      axiosGet<MenusResponse>(`/menus/${segment}`, locale).then((res) => {
        if (res.status) {
          console.log(res.data);
          dispatch(
            SET_ACTIVE_USER({
              ...res.data?.menu,
              activeItemsCount: res.data?.activeItemsCount,
              categoriesCount: res.data?.categoriesCount,
              itemsCount: res.data?.itemsCount,
              views: res.data?.views,
            } as unknown as Menu),
          );
        }
      });
    } else {
      dispatch(SET_LOADING());
    }
  }, [segment, locale, dispatch]);

  return <Layout segment={segment}>{children}</Layout>;
}
