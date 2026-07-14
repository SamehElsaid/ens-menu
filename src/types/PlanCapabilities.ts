export type PlanCapabilities = {
  aiMenuImport: boolean;
  tableOrderingQr: boolean;
  liveOrderNotifications: boolean;
  staffAndTables: boolean;
  advancedDeliveryMaps: boolean;
  /** -1 = unlimited */
  maxAdsPerMenu: number;
  allowedThemes: string[];
};

export const PLAN_THEME_OPTIONS = [
  { id: "default", labelKey: "themes.default" },
  { id: "coffee", labelKey: "themes.coffee" },
  { id: "neon", labelKey: "themes.neon" },
  { id: "sky", labelKey: "themes.sky" },
  { id: "waffle", labelKey: "themes.waffle" },
  { id: "vanilla", labelKey: "themes.vanilla" },
  { id: "onecard", labelKey: "themes.onecard" },
] as const;

export const DEFAULT_FREE_CAPABILITIES: PlanCapabilities = {
  aiMenuImport: true,
  tableOrderingQr: false,
  liveOrderNotifications: false,
  staffAndTables: false,
  advancedDeliveryMaps: false,
  maxAdsPerMenu: 1,
  allowedThemes: ["default", "coffee"],
};

export const DEFAULT_PRO_CAPABILITIES: PlanCapabilities = {
  aiMenuImport: true,
  tableOrderingQr: true,
  liveOrderNotifications: true,
  staffAndTables: true,
  advancedDeliveryMaps: true,
  maxAdsPerMenu: -1,
  allowedThemes: PLAN_THEME_OPTIONS.map((t) => t.id),
};

export const DEFAULT_CUSTOM_CAPABILITIES: PlanCapabilities = {
  ...DEFAULT_PRO_CAPABILITIES,
};

export function normalizePlanCapabilities(
  raw: unknown,
  fallback: PlanCapabilities = DEFAULT_FREE_CAPABILITIES,
): PlanCapabilities {
  if (!raw || typeof raw !== "object") {
    return { ...fallback, allowedThemes: [...fallback.allowedThemes] };
  }
  const o = raw as Record<string, unknown>;
  const themes = Array.isArray(o.allowedThemes)
    ? o.allowedThemes.map(String).filter(Boolean)
    : fallback.allowedThemes;
  return {
    aiMenuImport: Boolean(o.aiMenuImport ?? fallback.aiMenuImport),
    tableOrderingQr: Boolean(o.tableOrderingQr ?? fallback.tableOrderingQr),
    liveOrderNotifications: Boolean(
      o.liveOrderNotifications ?? fallback.liveOrderNotifications,
    ),
    staffAndTables: Boolean(o.staffAndTables ?? fallback.staffAndTables),
    advancedDeliveryMaps: Boolean(
      o.advancedDeliveryMaps ?? fallback.advancedDeliveryMaps,
    ),
    maxAdsPerMenu: Number.isFinite(Number(o.maxAdsPerMenu))
      ? Math.trunc(Number(o.maxAdsPerMenu))
      : fallback.maxAdsPerMenu,
    allowedThemes: themes.length ? themes : [...fallback.allowedThemes],
  };
}
