import type { PlanCapabilities } from "@/types/PlanCapabilities";

export type Plan = {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  firstMonthlyPrice?: number;
  firstYearlyPrice?: number;
  eligibleFirstMonthly?: boolean;
  eligibleFirstYearly?: boolean;
  currency?: string;
  maxMenus: number;
  maxProductsPerMenu: number;
  allowCustomDomain: boolean;
  hasAds: boolean;
  extraMenuPrice?: number | null;
  features: string[];
  capabilities?: PlanCapabilities;
};

export type PlansResponse = {
  success: boolean;
  plans: Plan[];
  customDisplay?: PlanCapabilities;
};
