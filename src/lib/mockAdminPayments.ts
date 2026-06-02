import type {
  AdminPaymentStatusFilter,
  AdminPaymentsPeriod,
  AdminPaymentsResponse,
  AdminPaymentTransaction,
  AdminSubscriptionRecordStatus,
  AdminSubscriptionSourceFilter,
  AdminSubscriptionStatusFilter,
} from "@/types/AdminPayment";

function subscriptionEndFromStart(
  startIso: string,
  billingCycle: "monthly" | "yearly",
): string {
  const end = new Date(startIso);
  if (billingCycle === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end.toISOString();
}

function withSubscriptionHistory(
  tx: AdminPaymentTransaction,
  subscriptionStatus: AdminSubscriptionRecordStatus,
  startDaysAgo: number,
): AdminPaymentTransaction {
  const start = daysAgo(startDaysAgo);
  return {
    ...tx,
    subscriptionStatus,
    subscriptionStartAt: start,
    subscriptionEndAt: subscriptionEndFromStart(start, tx.billingCycle),
    createdAt: start,
  };
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + (days % 8), 30, 0, 0);
  return d.toISOString();
}

function buildDemoTransactions(locale: string): AdminPaymentTransaction[] {
  const isAr = locale === "ar";

  const rows: AdminPaymentTransaction[] = [
    {
      id: "pay-001",
      orderId: "EK-20260315-8842",
      userId: 12,
      userName: isAr ? "سارة محمود" : "Sara Mahmoud",
      userEmail: "sara@example.com",
      amount: 5489,
      currency: "EGP",
      status: "success",
      subscriptionSource: "paid",
      method: "visa",
      billingCycle: "yearly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(1),
      paidAt: daysAgo(1),
      referenceId: "REF-8842",
    },
    {
      id: "pay-002",
      orderId: "EK-20260314-7721",
      userId: 28,
      userName: isAr ? "كريم حسن" : "Karim Hassan",
      userEmail: "karim@example.com",
      amount: 499,
      currency: "EGP",
      status: "success",
      subscriptionSource: "paid",
      method: "orange_money",
      billingCycle: "monthly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(2),
      paidAt: daysAgo(2),
      referenceId: "REF-7721",
    },
    {
      id: "pay-003",
      orderId: "EK-20260313-6610",
      userId: 45,
      userName: isAr ? "محمد البدوي" : "Mohamed Elbadawy",
      userEmail: "mohamed@example.com",
      amount: 5489,
      currency: "EGP",
      status: "pending",
      subscriptionSource: "paid",
      method: "etisalat_cash",
      billingCycle: "yearly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(3),
      paidAt: null,
      referenceId: "REF-6610",
    },
    {
      id: "pay-004",
      orderId: "EK-20260312-5599",
      userId: 51,
      userName: isAr ? "نورا أحمد" : "Nora Ahmed",
      userEmail: "nora@example.com",
      amount: 499,
      currency: "EGP",
      status: "failed",
      subscriptionSource: "paid",
      method: "visa",
      billingCycle: "monthly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(4),
      paidAt: null,
      referenceId: "REF-5599",
    },
    {
      id: "pay-005",
      orderId: "EK-20260310-4488",
      userId: 63,
      userName: isAr ? "أحمد يحيى" : "Ahmed Yahya",
      userEmail: "ahmed@example.com",
      amount: 5489,
      currency: "EGP",
      status: "success",
      subscriptionSource: "paid",
      method: "vodafone_cash",
      billingCycle: "yearly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(6),
      paidAt: daysAgo(6),
      referenceId: "REF-4488",
    },
    {
      id: "pay-006",
      orderId: "EK-20260308-3377",
      userId: 71,
      userName: isAr ? "ليلى سامي" : "Layla Samy",
      userEmail: "layla@example.com",
      amount: 499,
      currency: "EGP",
      status: "cancelled",
      subscriptionSource: "paid",
      method: "visa",
      billingCycle: "monthly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(8),
      paidAt: null,
      referenceId: "REF-3377",
    },
    {
      id: "pay-007",
      orderId: "EK-20260305-2266",
      userId: 84,
      userName: isAr ? "ياسر فتحي" : "Yasser Fathy",
      userEmail: "yasser@example.com",
      amount: 5489,
      currency: "EGP",
      status: "success",
      subscriptionSource: "paid",
      method: "mastercard",
      billingCycle: "yearly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(11),
      paidAt: daysAgo(11),
      referenceId: "REF-2266",
    },
    {
      id: "pay-008",
      orderId: "EK-20260228-1155",
      userId: 92,
      userName: isAr ? "هبة محمد" : "Heba Mohamed",
      userEmail: "heba@example.com",
      amount: 499,
      currency: "EGP",
      status: "refunded",
      subscriptionSource: "paid",
      method: "orange_money",
      billingCycle: "monthly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(16),
      paidAt: daysAgo(16),
      referenceId: "REF-1155",
    },
    {
      id: "pay-009",
      orderId: "EK-20260225-0044",
      userId: 101,
      userName: isAr ? "عمر خالد" : "Omar Khaled",
      userEmail: "omar@example.com",
      amount: 5489,
      currency: "EGP",
      status: "success",
      subscriptionSource: "paid",
      method: "visa",
      billingCycle: "yearly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(19),
      paidAt: daysAgo(19),
      referenceId: "REF-0044",
    },
    {
      id: "pay-010",
      orderId: "EK-20260220-9933",
      userId: 118,
      userName: isAr ? "دينا رامي" : "Dina Rami",
      userEmail: "dina@example.com",
      amount: 499,
      currency: "EGP",
      status: "success",
      subscriptionSource: "paid",
      method: "etisalat_cash",
      billingCycle: "monthly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(24),
      paidAt: daysAgo(24),
      referenceId: "REF-9933",
    },
    {
      id: "pay-011",
      orderId: "EK-20260215-8822",
      userId: 125,
      userName: isAr ? "طارق نabil" : "Tarek Nabil",
      userEmail: "tarek@example.com",
      amount: 5489,
      currency: "EGP",
      status: "failed",
      subscriptionSource: "paid",
      method: "visa",
      billingCycle: "yearly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(29),
      paidAt: null,
      referenceId: "REF-8822",
    },
    {
      id: "pay-012",
      orderId: "EK-20260210-7711",
      userId: 133,
      userName: isAr ? "مريم سعد" : "Mariam Saad",
      userEmail: "mariam@example.com",
      amount: 499,
      currency: "EGP",
      status: "success",
      subscriptionSource: "paid",
      method: "orange_money",
      billingCycle: "monthly",
      planName: "Pro",
      gateway: "EasyKash",
      createdAt: daysAgo(34),
      paidAt: daysAgo(34),
      referenceId: "REF-7711",
    },
    {
      id: "sub-201",
      orderId: "SUB-201",
      userId: 140,
      userName: isAr ? "رامي عادل" : "Ramy Adel",
      userEmail: "ramy@example.com",
      amount: 0,
      currency: "EGP",
      status: "success",
      subscriptionSource: "admin",
      billingCycle: "yearly",
      planName: "Pro",
      gateway: "Admin",
      createdAt: daysAgo(5),
      paidAt: null,
    },
    {
      id: "sub-202",
      orderId: "SUB-202",
      userId: 148,
      userName: isAr ? "سلمى حسين" : "Salma Hussein",
      userEmail: "salma@example.com",
      amount: 0,
      currency: "EGP",
      status: "success",
      subscriptionSource: "admin",
      billingCycle: "monthly",
      planName: "Pro",
      gateway: "Admin",
      createdAt: daysAgo(12),
      paidAt: null,
    },
  ];

  return rows.map((tx, index) => {
    const startDaysAgo = index + 1;
    let subscriptionStatus: AdminSubscriptionRecordStatus = "active";
    if (tx.status === "failed" || tx.status === "cancelled") {
      subscriptionStatus = "cancelled";
    } else if (startDaysAgo > 25) {
      subscriptionStatus = "expired";
    }
    return withSubscriptionHistory(tx, subscriptionStatus, startDaysAgo);
  });
}

function periodCutoff(period: AdminPaymentsPeriod): number | null {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  return Date.now() - days * 86400000;
}

function filterTransactions(
  transactions: AdminPaymentTransaction[],
  status: AdminPaymentStatusFilter,
  period: AdminPaymentsPeriod,
  search: string,
  source: AdminSubscriptionSourceFilter = "all",
  subscriptionStatus: AdminSubscriptionStatusFilter = "all",
): AdminPaymentTransaction[] {
  const q = search.trim().toLowerCase();
  const cutoff = periodCutoff(period);

  return transactions.filter((tx) => {
    if (source !== "all" && tx.subscriptionSource !== source) return false;
    if (
      subscriptionStatus !== "all" &&
      tx.subscriptionStatus !== subscriptionStatus
    ) {
      return false;
    }
    if (
      status !== "all" &&
      status !== "success" &&
      tx.subscriptionSource === "admin"
    ) {
      return false;
    }
    if (status !== "all" && tx.status !== status) return false;
    const periodDate = tx.subscriptionStartAt ?? tx.createdAt;
    if (cutoff && new Date(periodDate).getTime() < cutoff) return false;
    if (!q) return true;
    return (
      tx.orderId.toLowerCase().includes(q) ||
      tx.userName.toLowerCase().includes(q) ||
      tx.userEmail.toLowerCase().includes(q) ||
      (tx.referenceId?.toLowerCase().includes(q) ?? false)
    );
  });
}

function computeStatistics(
  transactions: AdminPaymentTransaction[],
): AdminPaymentsResponse["statistics"] {
  const paidSuccess = transactions.filter(
    (t) => t.status === "success" && t.subscriptionSource === "paid",
  );
  const activePro = transactions.filter(
    (t) =>
      t.subscriptionStatus === "active" &&
      t.planName.toLowerCase() === "pro",
  );
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const revenueThisMonth = paidSuccess
    .filter((t) => new Date(t.paidAt ?? t.createdAt) >= monthStart)
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalRevenue: paidSuccess.reduce((sum, t) => sum + t.amount, 0),
    revenueThisMonth,
    successfulCount: paidSuccess.length,
    pendingCount: transactions.filter((t) => t.status === "pending").length,
    failedCount: transactions.filter(
      (t) => t.status === "failed" || t.status === "cancelled",
    ).length,
    proActiveCount: activePro.length,
    paidActiveCount: activePro.filter((t) => t.subscriptionSource === "paid")
      .length,
    adminGrantedCount: activePro.filter((t) => t.subscriptionSource === "admin")
      .length,
    currency: "EGP",
  };
}

/** Demo data until GET /admin/payments is live */
export function getMockAdminPayments(
  locale: string,
  options?: {
    page?: number;
    limit?: number;
    status?: AdminPaymentStatusFilter;
    period?: AdminPaymentsPeriod;
    search?: string;
    source?: AdminSubscriptionSourceFilter;
    subscriptionStatus?: AdminSubscriptionStatusFilter;
  },
): AdminPaymentsResponse {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const status = options?.status ?? "all";
  const period = options?.period ?? "all";
  const search = options?.search ?? "";
  const source = options?.source ?? "all";
  const subscriptionStatus = options?.subscriptionStatus ?? "all";

  const all = buildDemoTransactions(locale);
  const filtered = filterTransactions(
    all,
    status,
    period,
    search,
    source,
    subscriptionStatus,
  );
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const start = (page - 1) * limit;

  return {
    _isDemoData: true,
    transactions: filtered.slice(start, start + limit),
    statistics: computeStatistics(all),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    },
  };
}
