import type {

  MenuAnalyticsPeriod,

  MenuAnalyticsResponse,

} from "@/types/MenuAnalytics";



function periodDays(period: MenuAnalyticsPeriod): number {

  if (period === "30d") return 30;

  if (period === "90d") return 90;

  return 7;

}



function periodMultiplier(period: MenuAnalyticsPeriod): number {

  if (period === "30d") return 4.2;

  if (period === "90d") return 11.5;

  return 1;

}



function lastDaysPoints(

  days: number,

  baseScale: number,

): { date: string; count: number }[] {

  const points: { date: string; count: number }[] = [];

  const now = new Date();

  const base = [18, 24, 31, 22, 38, 45, 29];

  const step = days <= 7 ? 1 : days <= 30 ? 1 : 7;

  const count = days <= 7 ? days : days <= 30 ? days : Math.ceil(days / 7);



  for (let i = count - 1; i >= 0; i -= 1) {

    const d = new Date(now);

    d.setDate(d.getDate() - i * step);

    const idx = (count - 1 - i) % base.length;

    points.push({

      date: d.toISOString().slice(0, 10),

      count: Math.round(

        (base[idx] + (i % 3) * 4) * (baseScale / 847) * (step > 1 ? step * 0.85 : 1),

      ),

    });

  }



  return points;

}



function lastDaysRevenue(

  days: number,

  baseScale: number,

  aov: number,

): { date: string; amount: number }[] {

  return lastDaysPoints(days, baseScale).map((p) => ({

    date: p.date,

    amount: Math.round(p.count * 0.06 * aov),

  }));

}



function peakHoursPattern(baseScale: number): { hour: number; count: number }[] {

  const pattern = [

    { hour: 12, w: 0.6 },

    { hour: 13, w: 0.85 },

    { hour: 14, w: 0.75 },

    { hour: 15, w: 0.5 },

    { hour: 16, w: 0.45 },

    { hour: 17, w: 0.55 },

    { hour: 18, w: 0.9 },

    { hour: 19, w: 1 },

    { hour: 20, w: 0.95 },

    { hour: 21, w: 0.8 },

    { hour: 22, w: 0.55 },

    { hour: 23, w: 0.35 },

  ];

  return pattern.map(({ hour, w }) => ({

    hour,

    count: Math.max(2, Math.round(18 * w * (baseScale / 847))),

  }));

}



/** Demo data until GET /menus/:id/analytics is live */

export function getMockMenuAnalytics(

  locale: string,

  menuViews = 0,

  period: MenuAnalyticsPeriod = "7d",

  currency = "EGP",

): MenuAnalyticsResponse {

  const isAr = locale === "ar";

  const mult = periodMultiplier(period);

  const baseViews = Math.round((menuViews > 0 ? menuViews : 847) * mult);

  const totalOrders = Math.max(1, Math.round(baseViews * 0.06));

  const aov = 185;

  const revenueTotal = totalOrders * aov;

  const conversionRate =

    baseViews > 0

      ? Math.round((totalOrders / baseViews) * 1000) / 10

      : 0;

  const days = periodDays(period);



  return {

    _isDemoData: true,

    period,

    summary: {

      totalViews: baseViews,

      viewsToday: Math.max(3, Math.round(baseViews * 0.04)),

      viewsThisWeek: Math.max(12, Math.round(baseViews * 0.18)),

      totalOrders,

      conversionRate,

      revenueToday: Math.round(revenueTotal * 0.08),

      revenueThisWeek: Math.round(revenueTotal * 0.35),

      revenueThisMonth: Math.round(revenueTotal * 0.92),

      averageOrderValue: aov,

      currency,

    },

    comparison: {

      viewsChangePercent: period === "7d" ? 18 : period === "30d" ? 12 : 24,

      ordersChangePercent: period === "7d" ? 9 : period === "30d" ? 15 : 21,

      revenueChangePercent: period === "7d" ? 14 : period === "30d" ? 19 : 27,

    },

    topVisitedItems: [

      {

        id: 1,

        nameAr: "برجر مشوي",

        nameEn: "Grilled Burger",

        views: Math.round(baseViews * 0.22),

      },

      {

        id: 2,

        nameAr: "بطاطس مقلية",

        nameEn: "French Fries",

        views: Math.round(baseViews * 0.16),

      },

      {

        id: 3,

        nameAr: "كولا",

        nameEn: "Cola",

        views: Math.round(baseViews * 0.14),

      },

      {

        id: 4,

        nameAr: "سلطة يونانية",

        nameEn: "Greek Salad",

        views: Math.round(baseViews * 0.11),

      },

      {

        id: 5,

        nameAr: "آيس كريم",

        nameEn: "Ice Cream",

        views: Math.round(baseViews * 0.08),

      },

    ],

    viewsOverTime: lastDaysPoints(days, baseViews),

    revenueOverTime: lastDaysRevenue(days, baseViews, aov),

    peakHours: peakHoursPattern(baseViews),

    topTables: [

      {

        tableNumber: isAr ? "طاولة 5" : "Table 5",

        orders: Math.round(totalOrders * 0.18),

        revenue: Math.round(revenueTotal * 0.19),

      },

      {

        tableNumber: isAr ? "طاولة 12" : "Table 12",

        orders: Math.round(totalOrders * 0.15),

        revenue: Math.round(revenueTotal * 0.16),

      },

      {

        tableNumber: isAr ? "طاولة 3" : "Table 3",

        orders: Math.round(totalOrders * 0.12),

        revenue: Math.round(revenueTotal * 0.13),

      },

      {

        tableNumber: isAr ? "طاولة 8" : "Table 8",

        orders: Math.round(totalOrders * 0.1),

        revenue: Math.round(revenueTotal * 0.11),

      },

    ],

    topCategories: [

      {

        id: 1,

        nameAr: "برجر",

        nameEn: "Burgers",

        views: Math.round(baseViews * 0.35),

        orders: Math.round(totalOrders * 0.32),

      },

      {

        id: 2,

        nameAr: "مشروبات",

        nameEn: "Drinks",

        views: Math.round(baseViews * 0.28),

        orders: Math.round(totalOrders * 0.25),

      },

      {

        id: 3,

        nameAr: "مقبلات",

        nameEn: "Appetizers",

        views: Math.round(baseViews * 0.2),

        orders: Math.round(totalOrders * 0.18),

      },

      {

        id: 4,

        nameAr: "حلويات",

        nameEn: "Desserts",

        views: Math.round(baseViews * 0.12),

        orders: Math.round(totalOrders * 0.1),

      },

    ],

    viewToOrderGap: [

      {

        id: 10,

        nameAr: "سلطة يونانية",

        nameEn: "Greek Salad",

        views: Math.round(baseViews * 0.11),

        orders: 2,

      },

      {

        id: 11,

        nameAr: "عصير برتقال",

        nameEn: "Orange Juice",

        views: Math.round(baseViews * 0.09),

        orders: 3,

      },

      {

        id: 12,

        nameAr: "تشيز كيك",

        nameEn: "Cheesecake",

        views: Math.round(baseViews * 0.07),

        orders: 1,

      },

    ],

    deadItems: [

      { id: 20, nameAr: "شوربة عدس", nameEn: "Lentil Soup" },

      { id: 21, nameAr: "ساندويتش تونة", nameEn: "Tuna Sandwich" },

      { id: 22, nameAr: "مياه معدنية", nameEn: "Mineral Water" },

    ],

    orderStatusBreakdown: [

      {

        status: "completed",

        labelAr: "مكتمل",

        labelEn: "Completed",

        count: Math.round(totalOrders * 0.82),

      },

      {

        status: "pending",

        labelAr: "قيد التنفيذ",

        labelEn: "Pending",

        count: Math.round(totalOrders * 0.1),

      },

      {

        status: "cancelled",

        labelAr: "ملغي",

        labelEn: "Cancelled",

        count: Math.round(totalOrders * 0.08),

      },

    ],

    staffPerformance: [

      { name: isAr ? "أحمد" : "Ahmed", ordersHandled: Math.round(totalOrders * 0.38) },

      { name: isAr ? "سارة" : "Sara", ordersHandled: Math.round(totalOrders * 0.34) },

      { name: isAr ? "محمد" : "Mohamed", ordersHandled: Math.round(totalOrders * 0.28) },

    ],

    adMetrics: {

      totalImpressions: Math.round(baseViews * 0.45),

      totalClicks: Math.round(baseViews * 0.045),

      averageCtr: 10.2,

    },

  };

}



/** Demo ad metrics per row when API omits click/impression counts */

export function enrichAdWithDemoMetrics(

  ad: { id?: number; clickCount?: number; impressionCount?: number },

  index: number,

): { clickCount: number; impressionCount: number; ctr: number } {

  const impressions =

    ad.impressionCount && ad.impressionCount > 0

      ? ad.impressionCount

      : 1200 + index * 340;

  const clicks =

    ad.clickCount && ad.clickCount > 0

      ? ad.clickCount

      : Math.round(impressions * (0.08 + index * 0.015));

  const ctr =

    impressions > 0

      ? Math.round((clicks / impressions) * 1000) / 10

      : 0;

  return { clickCount: clicks, impressionCount: impressions, ctr };

}


