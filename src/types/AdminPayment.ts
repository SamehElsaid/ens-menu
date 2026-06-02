export type AdminPaymentStatus =
  | "success"
  | "pending"
  | "failed"
  | "cancelled"
  | "refunded";

export type AdminPaymentMethod =
  | "visa"
  | "mastercard"
  | "orange_money"
  | "etisalat_cash"
  | "vodafone_cash"
  | "unknown";

export type AdminPaymentBillingCycle = "monthly" | "yearly";

export type AdminPaymentStatusFilter = "all" | AdminPaymentStatus;

export type AdminPaymentsPeriod = "7d" | "30d" | "90d" | "all";

export type AdminSubscriptionSource = "paid" | "admin";

export type AdminSubscriptionSourceFilter = "all" | AdminSubscriptionSource;

export type AdminSubscriptionRecordStatus = "active" | "expired" | "cancelled";

export type AdminSubscriptionStatusFilter =
  | "all"
  | AdminSubscriptionRecordStatus;

export interface AdminPaymentTransaction {
  id: string;
  orderId: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: AdminPaymentStatus;
  subscriptionSource: AdminSubscriptionSource;
  subscriptionStatus?: AdminSubscriptionRecordStatus;
  subscriptionId?: number;
  subscriptionStartAt?: string;
  subscriptionEndAt?: string | null;
  method?: AdminPaymentMethod;
  billingCycle: AdminPaymentBillingCycle;
  planName: string;
  gateway: string;
  createdAt: string;
  paidAt?: string | null;
  referenceId?: string;
}

export interface AdminPaymentsStatistics {
  totalRevenue: number;
  revenueThisMonth: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
  proActiveCount?: number;
  paidActiveCount?: number;
  adminGrantedCount?: number;
  currency: string;
}

/** Expected shape of GET /admin/payments */
export interface AdminPaymentsResponse {
  _isDemoData?: boolean;
  transactions: AdminPaymentTransaction[];
  statistics: AdminPaymentsStatistics;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
