import type {
  AdminAnalyticsPeriod,
  AdminAnalyticsResponse,
} from "@/types/AdminAnalytics";

function periodScale(period: AdminAnalyticsPeriod): number {
  if (period === "7d") return 0.25;
  if (period === "90d") return 2.8;
  return 1;
}

function lastDaysPoints(
  days: number,
  baseDaily: number,
): { date: string; count: number }[] {
  const points: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const wave = Math.sin(i * 0.9) * 0.35 + 1;
    const weekend = d.getDay() === 5 || d.getDay() === 6 ? 1.25 : 1;
    points.push({
      date: d.toISOString().slice(0, 10),
      count: Math.max(8, Math.round(baseDaily * wave * weekend)),
    });
  }

  return points;
}

/** Demo data until GET /admin/analytics is live */
export function getMockAdminAnalytics(
  period: AdminAnalyticsPeriod = "30d",
  locale: string,
): AdminAnalyticsResponse {
  const scale = periodScale(period);
  const chartDays = period === "7d" ? 7 : period === "90d" ? 14 : 7;
  const isAr = locale === "ar";

  const viewsOverTime = lastDaysPoints(chartDays, Math.round(42 * scale));
  const totalMenuViews = Math.round(12450 * scale);

  return {
    _isDemoData: true,
    summary: {
      totalMenuViews,
      menuViewsToday: Math.round(186 * scale),
      menuViewsThisWeek: Math.round(892 * scale),
      totalOrders: Math.round(342 * scale),
      activeMenus: Math.max(1, Math.round(48 * Math.cbrt(scale))),
      inactiveMenus: Math.max(0, Math.round(11 * Math.cbrt(scale))),
      usersWithoutMenu: Math.max(1, Math.round(12 * Math.cbrt(scale))),
      freeUsers: Math.max(1, Math.round(52 * Math.cbrt(scale))),
      proUsers: Math.max(1, Math.round(7 * Math.cbrt(scale))),
      conversionRate: 11.9,
      expiringSubscriptions: 3,
      inactiveUsers30d: 8,
      dau: Math.round(34 * scale),
      mau: Math.round(210 * scale),
    },
    topMenus: [
      {
        id: 1,
        nameAr: "مطعم النخيل",
        nameEn: "Al Nakheel Restaurant",
        slug: "alnakheel",
        views: Math.round(1840 * scale),
        ownerName: isAr ? "محمد البدوي" : "Mohamed Elbadawy",
      },
      {
        id: 2,
        nameAr: "كافيه لاونج",
        nameEn: "Cafe Lounge",
        slug: "cafelounge",
        views: Math.round(1520 * scale),
        ownerName: isAr ? "أحمد يحيى" : "Ahmed Yahya",
      },
      {
        id: 3,
        nameAr: "برجر هاوس",
        nameEn: "Burger House",
        slug: "burgerhouse",
        views: Math.round(980 * scale),
      },
      {
        id: 4,
        nameAr: "حلويات الشرق",
        nameEn: "Oriental Sweets",
        slug: "orientalsweets",
        views: Math.round(740 * scale),
      },
      {
        id: 5,
        nameAr: "مشويات السلطان",
        nameEn: "Sultan Grill",
        slug: "sultangrill",
        views: Math.round(615 * scale),
      },
    ],
    topProducts: [
      {
        id: 101,
        nameAr: "برجر كلاسيك",
        nameEn: "Classic Burger",
        menuName: isAr ? "برجر هاوس" : "Burger House",
        views: Math.round(420 * scale),
      },
      {
        id: 102,
        nameAr: "لاتيه",
        nameEn: "Latte",
        menuName: isAr ? "كافيه لاونج" : "Cafe Lounge",
        views: Math.round(385 * scale),
      },
      {
        id: 103,
        nameAr: "مشكل مشاوي",
        nameEn: "Mixed Grill",
        menuName: isAr ? "مطعم النخيل" : "Al Nakheel Restaurant",
        views: Math.round(310 * scale),
      },
      {
        id: 104,
        nameAr: "كنافة",
        nameEn: "Kunafa",
        menuName: isAr ? "حلويات الشرق" : "Oriental Sweets",
        views: Math.round(268 * scale),
      },
      {
        id: 105,
        nameAr: "عصير مانجو",
        nameEn: "Mango Juice",
        menuName: isAr ? "كافيه لاونج" : "Cafe Lounge",
        views: Math.round(195 * scale),
      },
    ],
    viewsOverTime,
    revenueOverTime: [
      { month: isAr ? "يناير" : "Jan", count: Math.round(4200 * scale) },
      { month: isAr ? "فبراير" : "Feb", count: Math.round(5100 * scale) },
      { month: isAr ? "مارس" : "Mar", count: Math.round(4800 * scale) },
    ],
    subscriptions: {
      expiringSoon: [
        {
          userId: 12,
          name: isAr ? "سارة محمود" : "Sara Mahmoud",
          email: "sara@example.com",
          endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          planName: "Pro",
        },
        {
          userId: 28,
          name: isAr ? "كريم حسن" : "Karim Hassan",
          email: "karim@example.com",
          endDate: new Date(Date.now() + 5 * 86400000).toISOString(),
          planName: "Pro",
        },
      ],
      churnedThisMonth: 2,
    },
    geoDistribution: [
      { country: isAr ? "مصر" : "Egypt", count: 41 },
      { country: isAr ? "السعودية" : "Saudi Arabia", count: 12 },
      { country: isAr ? "الإمارات" : "UAE", count: 4 },
      { country: isAr ? "الكويت" : "Kuwait", count: 2 },
    ],
    adMetrics: {
      totalImpressions: Math.round(8200 * scale),
      totalClicks: Math.round(640 * scale),
      averageCtr: 7.8,
    },
    freeBannerMetrics: {
      totalImpressions: Math.round(15600 * scale),
      totalClicks: Math.round(420 * scale),
      averageCtr: 2.7,
      topMenusByClicks: [
        {
          id: 1,
          nameAr: "مطعم النخيل",
          nameEn: "Al Nakheel Restaurant",
          slug: "alnakheel",
          clicks: Math.round(98 * scale),
          impressions: Math.round(3200 * scale),
        },
        {
          id: 2,
          nameAr: "كافيه لاونج",
          nameEn: "Cafe Lounge",
          slug: "cafelounge",
          clicks: Math.round(76 * scale),
          impressions: Math.round(2800 * scale),
        },
        {
          id: 3,
          nameAr: "برجر هاوس",
          nameEn: "Burger House",
          slug: "burgerhouse",
          clicks: Math.round(54 * scale),
          impressions: Math.round(2100 * scale),
        },
        {
          id: 4,
          nameAr: "حلويات الشرق",
          nameEn: "Oriental Sweets",
          slug: "orientalsweets",
          clicks: Math.round(41 * scale),
          impressions: Math.round(1900 * scale),
        },
        {
          id: 5,
          nameAr: "مشويات السلطان",
          nameEn: "Sultan Grill",
          slug: "sultangrill",
          clicks: Math.round(32 * scale),
          impressions: Math.round(1500 * scale),
        },
      ],
    },
  };
}
