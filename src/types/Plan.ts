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
  features: string[];
};

export type PlansResponse = {
  success: boolean;
  plans: Plan[];
};
