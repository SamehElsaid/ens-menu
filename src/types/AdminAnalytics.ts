export interface AdminAnalyticsSummary {
  totalMenuViews: number;
  menuViewsToday: number;
  menuViewsThisWeek: number;
  totalOrders: number;
  activeMenus: number;
  inactiveMenus: number;
  usersWithoutMenu: number;
  freeUsers: number;
  proUsers: number;
  conversionRate: number;
  expiringSubscriptions: number;
  inactiveUsers30d: number;
  dau?: number;
  mau?: number;
}

export interface AdminTopMenu {
  id: number;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  views: number;
  ownerName?: string;
}

export interface AdminTopProduct {
  id: number;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  views: number;
  menuName?: string;
}

export interface AdminExpiringSubscription {
  userId: number;
  name: string;
  email: string;
  endDate: string;
  planName: string;
}

export interface AdminGeoEntry {
  country: string;
  count: number;
}

export interface AdminAdMetrics {
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
}

/** Bottom ENSmenu branding banner on free-plan public menus */
export interface AdminFreeBannerMenuEntry {
  id: number;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  clicks: number;
  impressions?: number;
}

export interface AdminFreeBannerMetrics {
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  topMenusByClicks?: AdminFreeBannerMenuEntry[];
}

export interface AdminAnalyticsPoint {
  date: string;
  count: number;
}

export interface AdminRevenuePoint {
  month: string;
  count: number;
}

/** Expected shape of GET /admin/analytics?period=30d */
export interface AdminAnalyticsResponse {
  /** Set when showing demo fallback data */
  _isDemoData?: boolean;
  summary: AdminAnalyticsSummary;
  topMenus: AdminTopMenu[];
  topProducts: AdminTopProduct[];
  viewsOverTime: AdminAnalyticsPoint[];
  revenueOverTime?: AdminRevenuePoint[];
  subscriptions?: {
    expiringSoon: AdminExpiringSubscription[];
    churnedThisMonth?: number;
  };
  geoDistribution?: AdminGeoEntry[];
  adMetrics?: AdminAdMetrics;
  /** Clicks/impressions on free-menu bottom branding banner */
  freeBannerMetrics?: AdminFreeBannerMetrics;
}

export type AdminAnalyticsPeriod = "7d" | "30d" | "90d";
