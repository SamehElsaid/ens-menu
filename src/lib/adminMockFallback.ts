import type { AdminAnalyticsResponse } from "@/types/AdminAnalytics";
import type { AdminPaymentsResponse } from "@/types/AdminPayment";
import type {
  FollowUpCallsResponse,
  FollowUpQueueResponse,
  FollowUpReportSummary,
} from "@/types/AdminFollowUp";
import type { MenuAnalyticsResponse } from "@/types/MenuAnalytics";

/**
 * Demo admin data is only shown in development or when explicitly enabled.
 * Production outages must not surface fake payments, analytics, or follow-ups.
 */
export function shouldUseAdminMockFallback(): boolean {
  const flag = process.env.NEXT_PUBLIC_USE_ADMIN_MOCK_DATA?.trim().toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV === "development";
}

export function emptyAdminPaymentsResponse(
  page = 1,
  limit = 10,
): AdminPaymentsResponse {
  return {
    transactions: [],
    statistics: {
      totalRevenue: 0,
      revenueThisMonth: 0,
      successfulCount: 0,
      pendingCount: 0,
      failedCount: 0,
      proActiveCount: 0,
      paidActiveCount: 0,
      adminGrantedCount: 0,
      currency: "EGP",
    },
    pagination: {
      currentPage: page,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: limit,
    },
  };
}

export function emptyAdminAnalyticsResponse(): AdminAnalyticsResponse {
  return {
    summary: {
      totalMenuViews: 0,
      menuViewsToday: 0,
      menuViewsThisWeek: 0,
      totalOrders: 0,
      activeMenus: 0,
      inactiveMenus: 0,
      usersWithoutMenu: 0,
      freeUsers: 0,
      proUsers: 0,
      conversionRate: 0,
      expiringSubscriptions: 0,
      inactiveUsers30d: 0,
      dau: 0,
      mau: 0,
    },
    topMenus: [],
    topProducts: [],
    viewsOverTime: [],
    revenueOverTime: [],
    subscriptions: { expiringSoon: [] },
    geoDistribution: [],
    adMetrics: {
      totalImpressions: 0,
      totalClicks: 0,
      averageCtr: 0,
    },
    freeBannerMetrics: {
      totalImpressions: 0,
      totalClicks: 0,
      averageCtr: 0,
      topMenusByClicks: [],
    },
  };
}

export function emptyMenuAnalyticsResponse(
  period: MenuAnalyticsResponse["period"] = "7d",
  currency = "EGP",
): MenuAnalyticsResponse {
  return {
    period,
    summary: {
      totalViews: 0,
      viewsToday: 0,
      viewsThisWeek: 0,
      totalOrders: 0,
      conversionRate: 0,
      revenueToday: 0,
      revenueThisWeek: 0,
      revenueThisMonth: 0,
      averageOrderValue: 0,
      currency,
    },
    comparison: {
      viewsChangePercent: 0,
      ordersChangePercent: 0,
      revenueChangePercent: 0,
    },
    topVisitedItems: [],
    viewsOverTime: [],
    revenueOverTime: [],
    peakHours: [],
    topTables: [],
    topCategories: [],
    viewToOrderGap: [],
    deadItems: [],
    orderStatusBreakdown: [],
    staffPerformance: [],
    topOrderedItems: [],
    adMetrics: {
      totalImpressions: 0,
      totalClicks: 0,
      averageCtr: 0,
    },
  };
}

export function emptyFollowUpQueueResponse(): FollowUpQueueResponse {
  return { users: [] };
}

export function emptyFollowUpCallsResponse(): FollowUpCallsResponse {
  return { calls: [] };
}

export function emptyFollowUpReportSummary(
  period: "7d" | "30d" = "7d",
): FollowUpReportSummary {
  return {
    period,
    callsToday: 0,
    callsThisWeek: 0,
    overdueCount: 0,
    answeredRate: 0,
    callsByAdmin: [],
    teamStats: [],
    outcomesBreakdown: [],
    purposesBreakdown: [],
  };
}
