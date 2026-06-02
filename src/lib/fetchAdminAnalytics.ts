import { axiosGet } from "@/shared/axiosCall";
import { getMockAdminAnalytics } from "@/lib/mockAdminAnalytics";
import type {
  AdminAnalyticsPeriod,
  AdminAnalyticsResponse,
  AdminTopMenu,
  AdminTopProduct,
} from "@/types/AdminAnalytics";

export async function fetchAdminAnalytics(
  locale: string,
  period: AdminAnalyticsPeriod = "30d",
): Promise<AdminAnalyticsResponse> {
  const result = await axiosGet<AdminAnalyticsResponse>(
    "/admin/analytics",
    locale,
    undefined,
    { period },
  );

  if (result.status && result.data) {
    return result.data;
  }

  return getMockAdminAnalytics(period, locale);
}

export async function fetchAdminAdminsCount(locale: string): Promise<number> {
  const result = await axiosGet<{
    statistics?: { totalAdmins?: number };
    pagination?: { totalItems?: number };
  }>("/admin/admins", locale, undefined, { page: 1, limit: 1 });

  if (result.status && result.data) {
    return (
      result.data.statistics?.totalAdmins ??
      result.data.pagination?.totalItems ??
      0
    );
  }

  return 0;
}

export function getAdminItemName(
  item: { name?: string; nameAr?: string; nameEn?: string },
  locale: string,
): string {
  if (locale === "ar") {
    return item.nameAr || item.nameEn || item.name || "—";
  }
  return item.nameEn || item.nameAr || item.name || "—";
}

export function getAdminMenuLabel(
  menu: Pick<AdminTopMenu, "slug" | "name" | "nameAr" | "nameEn">,
  locale: string,
): string {
  const name = getAdminItemName(menu, locale);
  return menu.slug ? `${name} (${menu.slug})` : name;
}

export function getAdminProductLabel(
  product: AdminTopProduct,
  locale: string,
): string {
  const name = getAdminItemName(product, locale);
  return product.menuName ? `${name} · ${product.menuName}` : name;
}

export function formatAdminDate(
  dateStr: string | null | undefined,
  locale: string,
): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-US",
      { year: "numeric", month: "short", day: "numeric" },
    );
  } catch {
    return "—";
  }
}

export function formatChartDate(dateStr: string, locale: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-EG" : "en-US",
      { weekday: "short", day: "numeric" },
    );
  } catch {
    return dateStr.slice(5, 10);
  }
}

export function computeCtr(clicks: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return Math.round((clicks / impressions) * 1000) / 10;
}
