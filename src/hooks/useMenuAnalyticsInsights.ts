"use client";

import { useEffect, useMemo, useState } from "react";
import { axiosGet } from "@/shared/axiosCall";
import { fetchMenuAnalytics } from "@/lib/fetchMenuAnalytics";
import type {
  MenuAnalyticsPeriod,
  MenuAnalyticsResponse,
} from "@/types/MenuAnalytics";

type OrderLogItem = {
  name: string;
  menuItemId: number;
  quantity: number;
};

type ActivityActionDetail = {
  status?: string;
};

type ActivityLogEntry = {
  id: string;
  lastAction?: string;
  actionDetails?: ActivityActionDetail[];
  items?: OrderLogItem[];
};

function entryHasStaffConfirmation(entry: ActivityLogEntry): boolean {
  if (entry.lastAction === "TABLE_CALL_CONFIRMED") return true;
  return (entry.actionDetails ?? []).some(
    (d) => String(d.status ?? "").toLowerCase() === "confirmed",
  );
}

type ActivityLogsResponse = {
  total?: number;
  entries?: ActivityLogEntry[];
  calls?: ActivityLogEntry[];
};

function aggregateTopOrderedItems(
  entries: ActivityLogEntry[],
  limit = 5,
): { menuItemId: number; name: string; count: number }[] {
  const counts = new Map<number, { menuItemId: number; name: string; count: number }>();

  for (const entry of entries) {
    for (const item of entry.items ?? []) {
      const qty = item.quantity > 0 ? item.quantity : 1;
      const existing = counts.get(item.menuItemId);
      if (existing) {
        existing.count += qty;
      } else {
        counts.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          name: item.name,
          count: qty,
        });
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function useMenuAnalyticsInsights(options: {
  menuSlugOrId: string;
  locale: string;
  isFreePlan: boolean;
  menuViews?: number;
  menuCurrency?: string;
  period?: MenuAnalyticsPeriod;
  enabled?: boolean;
}) {
  const {
    menuSlugOrId,
    locale,
    isFreePlan,
    menuViews = 0,
    menuCurrency,
    period = "7d",
    enabled = true,
  } = options;

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<MenuAnalyticsResponse | null>(
    null,
  );
  const [totalOrders, setTotalOrders] = useState(0);
  const [topOrderedItems, setTopOrderedItems] = useState<
    { menuItemId: number; name: string; count: number }[]
  >([]);

  useEffect(() => {
    if (!enabled || !menuSlugOrId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const analyticsPeriod = isFreePlan ? "7d" : period;

        if (isFreePlan) {
          const analyticsData = await fetchMenuAnalytics(
            menuSlugOrId,
            locale,
            analyticsPeriod,
            menuViews,
            menuCurrency,
          );
          if (cancelled) return;
          setAnalytics(analyticsData);
          setTotalOrders(0);
          setTopOrderedItems([]);
          return;
        }

        const analyticsData = await fetchMenuAnalytics(
          menuSlugOrId,
          locale,
          period,
          menuViews,
          menuCurrency,
        );

        if (cancelled) return;

        setAnalytics(analyticsData);
        setTotalOrders(analyticsData.summary?.totalOrders ?? 0);

        if (analyticsData.topOrderedItems?.length) {
          setTopOrderedItems(
            analyticsData.topOrderedItems.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.name,
              count: item.count,
            })),
          );
        } else if (!analyticsData._isDemoData) {
          const logsRes = await axiosGet<ActivityLogsResponse>(
            `/menus/${menuSlugOrId}/activity-logs`,
            locale,
            undefined,
            { page: 1, limit: 100 },
          );
          if (cancelled) return;
          if (logsRes.status && logsRes.data) {
            const entries = (logsRes.data.entries ?? logsRes.data.calls ?? []).filter(
              entryHasStaffConfirmation,
            );
            setTopOrderedItems(aggregateTopOrderedItems(entries));
          } else {
            setTopOrderedItems([]);
          }
        } else {
          setTopOrderedItems([]);
        }
      } catch {
        if (!cancelled) {
          setAnalytics(null);
          setTotalOrders(0);
          setTopOrderedItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    menuSlugOrId,
    locale,
    isFreePlan,
    menuViews,
    menuCurrency,
    period,
    enabled,
  ]);

  const topOrderedDisplay = useMemo(() => {
    const ranked = topOrderedItems.map((item) => ({
      id: item.menuItemId,
      label: item.name,
      count: item.count,
    }));
    if (ranked.length > 0) return ranked;
    if (!analytics?._isDemoData) return [];
    return locale === "ar"
      ? [
          { id: "d1", label: "برجر مشوي", count: 24 },
          { id: "d2", label: "بطاطس مقلية", count: 18 },
          { id: "d3", label: "كولا", count: 15 },
        ]
      : [
          { id: "d1", label: "Grilled Burger", count: 24 },
          { id: "d2", label: "French Fries", count: 18 },
          { id: "d3", label: "Cola", count: 15 },
        ];
  }, [topOrderedItems, analytics?._isDemoData, locale]);

  return {
    analytics,
    loading,
    totalOrders,
    topOrderedDisplay,
  };
}
