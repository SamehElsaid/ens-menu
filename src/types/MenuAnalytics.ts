export interface MenuAnalyticsSummary {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  totalOrders?: number;
  conversionRate?: number;
  revenueToday?: number;
  revenueThisWeek?: number;
  revenueThisMonth?: number;
  averageOrderValue?: number;
  currency?: string;
}

export interface MenuAnalyticsComparison {
  viewsChangePercent: number;
  ordersChangePercent: number;
  revenueChangePercent: number;
}

export interface MenuAnalyticsTopItem {
  id: number;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  views: number;
  imageUrl?: string;
}

export interface MenuAnalyticsViewsPoint {
  date: string;
  count: number;
}

export interface MenuAnalyticsRevenuePoint {
  date: string;
  amount: number;
}

export interface MenuAnalyticsPeakHour {
  hour: number;
  count: number;
}

export interface MenuAnalyticsTablePerf {
  tableNumber: string;
  orders: number;
  revenue: number;
}

export interface MenuAnalyticsCategoryPerf {
  id: number;
  nameAr?: string;
  nameEn?: string;
  views: number;
  orders: number;
}

export interface MenuAnalyticsGapItem {
  id: number;
  nameAr?: string;
  nameEn?: string;
  views: number;
  orders: number;
}

export interface MenuAnalyticsDeadItem {
  id: number;
  nameAr?: string;
  nameEn?: string;
}

export interface MenuAnalyticsOrderStatus {
  status: string;
  labelAr?: string;
  labelEn?: string;
  count: number;
}

export interface MenuAnalyticsStaffPerf {
  name: string;
  ordersHandled: number;
}

/** Top products by quantity from staff-confirmed table orders in the selected period */
export interface MenuAnalyticsTopOrderedItem {
  menuItemId: number;
  name: string;
  count: number;
}

export interface MenuAnalyticsAdMetrics {
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
}

/** Expected shape of GET /menus/:id/analytics?period=7d|30d|90d */
export interface MenuAnalyticsResponse {
  /** Set when showing demo fallback data */
  _isDemoData?: boolean;
  period?: MenuAnalyticsPeriod;
  summary: MenuAnalyticsSummary;
  comparison?: MenuAnalyticsComparison;
  topVisitedItems: MenuAnalyticsTopItem[];
  viewsOverTime: MenuAnalyticsViewsPoint[];
  revenueOverTime?: MenuAnalyticsRevenuePoint[];
  peakHours?: MenuAnalyticsPeakHour[];
  topTables?: MenuAnalyticsTablePerf[];
  topCategories?: MenuAnalyticsCategoryPerf[];
  viewToOrderGap?: MenuAnalyticsGapItem[];
  deadItems?: MenuAnalyticsDeadItem[];
  orderStatusBreakdown?: MenuAnalyticsOrderStatus[];
  staffPerformance?: MenuAnalyticsStaffPerf[];
  topOrderedItems?: MenuAnalyticsTopOrderedItem[];
  adMetrics?: MenuAnalyticsAdMetrics;
}

export type MenuAnalyticsPeriod = "7d" | "30d" | "90d";

