import type { PlanCapabilities } from "@/types/PlanCapabilities";

export interface PlanBase {
  id: number;
  name: string;
  priceYearly: number;
  extraMenuPrice?: number | null;
  maxMenus: number;
  maxProductsPerMenu: number;
  allowCustomDomain?: boolean;
  hasAds: boolean;
  capabilities?: PlanCapabilities;
}

export interface Plan extends PlanBase {
  description: string;
  priceMonthly: number;
  allowCustomDomain: boolean;
  firstMonthlyPrice?: number;
  firstYearlyPrice?: number;
  eligibleFirstMonthly?: boolean;
  eligibleFirstYearly?: boolean;
  currency?: string;
  features: string[];
}

export interface AdminPlan extends PlanBase {
  priceMonthly?: number;
  isActive: boolean;
  activeSubscriptions?: number;
}

export interface PlanSummary {
  id: number;
  name: string;
  priceMonthly?: number;
  priceYearly?: number;
}

export type PlansResponse = {
  success: boolean;
  plans: Plan[];
  customDisplay?: PlanCapabilities;
};
