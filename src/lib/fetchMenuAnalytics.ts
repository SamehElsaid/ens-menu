import { axiosGet } from "@/shared/axiosCall";
import { getMockMenuAnalytics } from "@/lib/mockMenuAnalytics";
import {
  emptyMenuAnalyticsResponse,
  shouldUseAdminMockFallback,
} from "@/lib/adminMockFallback";
import { formatAppChartDay } from "@/lib/formatDateTime";
import type {
  MenuAnalyticsPeriod,
  MenuAnalyticsResponse,
} from "@/types/MenuAnalytics";

export async function fetchMenuAnalytics(
  menuId: string,
  locale: string,
  period: MenuAnalyticsPeriod = "7d",
  menuViews?: number,
  currency?: string,
): Promise<MenuAnalyticsResponse> {
  const result = await axiosGet<MenuAnalyticsResponse>(
    `/menus/${menuId}/analytics`,
    locale,
    undefined,
    { period },
  );

  if (result.status && result.data) {
    return result.data;
  }

  if (shouldUseAdminMockFallback()) {
    return getMockMenuAnalytics(locale, menuViews ?? 0, period, currency ?? "EGP");
  }

  return emptyMenuAnalyticsResponse(period, currency ?? "EGP");
}

export function formatMenuChartDate(dateStr: string, locale: string): string {
  return formatAppChartDay(dateStr, locale);
}

export function formatMenuCurrency(
  amount: number,
  currency: string,
  locale: string,
): string {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: currency || "EGP",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatChangePercent(value: number): string {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${value}%`;
  return "0%";
}

export function exportMenuAnalyticsCsv(
  analytics: MenuAnalyticsResponse,
  locale: string,
  menuSlug: string,
): void {
  const s = analytics.summary;
  const rows = [
    ["Metric", "Value"],
    ["Total Views", String(s.totalViews)],
    ["Views Today", String(s.viewsToday)],
    ["Views This Week", String(s.viewsThisWeek)],
    ["Total Orders", String(s.totalOrders ?? 0)],
    ["Conversion Rate", `${s.conversionRate ?? 0}%`],
    ["Average Order Value", String(s.averageOrderValue ?? 0)],
    ["Revenue Today", String(s.revenueToday ?? 0)],
    ["Revenue This Week", String(s.revenueThisWeek ?? 0)],
    ["Revenue This Month", String(s.revenueThisMonth ?? 0)],
    ["Period", analytics.period ?? "7d"],
    ["Confirmed Orders Only", "yes"],
    ["Demo Data", analytics._isDemoData ? "yes" : "no"],
  ];

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `menu-analytics-${menuSlug}-${analytics.period ?? "7d"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function getAnalyticsItemName(
  item: { name?: string; nameAr?: string; nameEn?: string },
  locale: string,
): string {
  if (locale === "ar") {
    return item.nameAr || item.nameEn || item.name || "—";
  }
  return item.nameEn || item.nameAr || item.name || "—";
}
