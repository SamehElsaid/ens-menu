export const WHATSAPP_URL = "https://wa.me/201500800050";

export const STATIC_PRO_YEARLY_USD = 100;

export const STATIC_FREE_PLAN = {
  maxMenus: 1,
  maxProductsPerMenu: 50,
  allowCustomDomain: false,
  hasAds: false,
} as const;

export const STATIC_PRO_PLAN = {
  maxMenus: 4,
  maxProductsPerMenu: 200,
  allowCustomDomain: true,
  hasAds: true,
} as const;

export const CUSTOM_CARD_FEATURE_KEYS = [
  "waiterRequest",
  "billRequest",
  "onlineOrdering",
  "deliveryMaps",
  "newLanguages",
  "onlinePayment",
] as const;
