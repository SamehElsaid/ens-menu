export type MarketingTrustFeature = {
  id: string;
  title: string;
};

export const MARKETING_TRUST_FEATURE_IDS = [
  "setup",
  "mobile",
  "venues",
  "qrOrders",
  "arabic",
  "noApp",
] as const;

export type MarketingTrustFeatureId = (typeof MARKETING_TRUST_FEATURE_IDS)[number];
