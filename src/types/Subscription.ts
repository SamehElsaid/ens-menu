export interface Subscription {
  plan?: string;
  planName?: string;
  planId?: number;
  maxMenus?: number;
  extraMenus?: number;
  effectiveMaxMenus?: number;
  extraMenuPrice?: number;
  subscriptionDaysRemaining?: number;
  subscriptionMonthsRemaining?: number;
  extraMenuProratedPrice?: number;
  extraMenuShortPeriodWarning?: boolean;
  canRenewPro?: boolean;
  renewExtendsFromEndDate?: string | null;
  isInGracePeriod?: boolean;
  maxProductsPerMenu?: number;
  status?: string;
  billingCycle?: string;
  startDate?: string | null;
  endDate?: string | null;
  capabilities?: import("@/types/PlanCapabilities").PlanCapabilities;
  [key: string]: unknown;
}

export interface SubscriptionResponse {
  subscription?: Subscription;
}

export interface AdminSubscription
  extends Required<
    Pick<
      Subscription,
      "billingCycle" | "startDate" | "endDate" | "status" | "maxMenus" | "extraMenus"
    >
  > {
  id: number;
  amount: number;
  paymentStatus: string;
  paidAt: string | null;
  planName: string;
}
