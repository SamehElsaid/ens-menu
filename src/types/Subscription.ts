export interface Subscription {
  plan?: string;
  planName?: string;
  planId?: number;
  maxMenus?: number;
  maxProductsPerMenu?: number;
  status?: string;
  billingCycle?: string;
  startDate?: string | null;
  endDate?: string | null;
  [key: string]: unknown;
}

export interface SubscriptionResponse {
  subscription?: Subscription;
}
