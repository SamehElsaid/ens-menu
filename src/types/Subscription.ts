export interface Subscription {
  plan?: string;
  planName?: string;
  maxMenus?: number;
  maxProductsPerMenu?: number;
  status?: string;
  [key: string]: unknown;
}

export interface SubscriptionResponse {
  subscription?: Subscription;
}
