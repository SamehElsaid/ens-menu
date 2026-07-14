import type {
  ComparisonRow,
  PlanId,
} from "@/components/Pricing/pricingComparisonTypes";
import type { PlanCapabilities } from "@/types/PlanCapabilities";
import {
  DEFAULT_CUSTOM_CAPABILITIES,
  DEFAULT_FREE_CAPABILITIES,
  DEFAULT_PRO_CAPABILITIES,
} from "@/types/PlanCapabilities";

export const STATIC_FREE_PLAN = {
  maxMenus: 1,
  allowCustomDomain: false,
} as const;

export const STATIC_PRO_PLAN = {
  maxMenus: 4,
  allowCustomDomain: true,
} as const;

export const CUSTOM_TABLE_FEATURE_KEYS = [
  "waiterRequest",
  "billRequest",
  "deliveryMaps",
  "newLanguages",
  "onlinePayment",
] as const;

const ORDERED_ROW_IDS = [
  "rowBillingCycle",
  "rowMenus",
  "rowProducts",
  "rowGuestMenu",
  "rowSmartQr",
  "rowDashboard",
  "rowPhotoLibrary",
  "rowHostingSecurity",
  "rowPlatformUpdates",
  "rowAiMenuImport",
  "rowAiSuggestions",
  "rowAiWaiter",
  "rowTableOrderingQr",
  "rowLiveNotifications",
  "rowStaffNotifications",
  "rowStaffTables",
  "rowStaffMobileApp",
  "rowMultiLanguage",
  "rowDesign",
  "rowAds",
  "rowSupport",
  ...CUSTOM_TABLE_FEATURE_KEYS.map((key) => `customFeature.${key}`),
] as const;

const SUBSCRIPTION_FEATURE_ROW_IDS = ORDERED_ROW_IDS.filter(
  (id) => id !== "rowBillingCycle",
);

type PricingRowTranslators = {
  t: (key: string) => string;
  tLanding: (key: string) => string;
};

export type PricingPlanLimits = {
  maxMenus: number;
  allowCustomDomain?: boolean;
  capabilities?: PlanCapabilities | null;
};

export type BuildPricingComparisonOptions = PricingRowTranslators & {
  freePlan?: PricingPlanLimits | null;
  proPlan?: PricingPlanLimits | null;
  customDisplay?: PlanCapabilities | null;
};

function adsCell(
  caps: PlanCapabilities,
  t: (key: string) => string,
): string | boolean {
  if (caps.maxAdsPerMenu < 0) return t("adsUnlimited");
  if (caps.maxAdsPerMenu === 1) return t("adsFreeOne");
  return String(caps.maxAdsPerMenu);
}

function designCell(
  caps: PlanCapabilities,
  allowCustomDomain: boolean | undefined,
  plan: PlanId,
  t: (key: string) => string,
): string {
  if (plan === "custom") return t("designCustom");
  if (allowCustomDomain || caps.allowedThemes.length >= 5) {
    return t("designPro");
  }
  return t("designFree");
}

export function buildPricingComparisonRows({
  t,
  tLanding,
  freePlan,
  proPlan,
  customDisplay,
}: BuildPricingComparisonOptions): ComparisonRow[] {
  const tBasic = t("cellBasic");
  const freeCaps = freePlan?.capabilities ?? DEFAULT_FREE_CAPABILITIES;
  const proCaps = proPlan?.capabilities ?? DEFAULT_PRO_CAPABILITIES;
  const customCaps = customDisplay ?? DEFAULT_CUSTOM_CAPABILITIES;
  const freeMenus = freePlan?.maxMenus ?? STATIC_FREE_PLAN.maxMenus;
  const proMenus = proPlan?.maxMenus ?? STATIC_PRO_PLAN.maxMenus;

  const baseRows: ComparisonRow[] = [
    {
      id: "rowBillingCycle",
      label: t("rowBillingCycle"),
      free: t("billingFree"),
      pro: t("billingProShort"),
      custom: t("billingCustom"),
    },
    {
      id: "rowMenus",
      label: t("rowMenus"),
      free: freeMenus,
      pro: proMenus,
      custom: t("cellUnlimited"),
    },
    {
      id: "rowProducts",
      label: t("rowProducts"),
      free: t("productsUnlimited"),
      pro: t("productsUnlimited"),
      custom: t("productsUnlimited"),
    },
    {
      id: "rowSmartQr",
      label: t("rowSmartQr"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      id: "rowGuestMenu",
      label: t("rowGuestMenu"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      id: "rowAiMenuImport",
      label: t("rowAiMenuImport"),
      free: freeCaps.aiMenuImport ? tBasic : false,
      pro: proCaps.aiMenuImport,
      custom: customCaps.aiMenuImport,
    },
    {
      id: "rowAiSuggestions",
      label: t("rowAiSuggestions"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      id: "rowAiWaiter",
      label: t("rowAiWaiter"),
      free: t("aiFree"),
      pro: t("aiPro"),
      custom: t("aiCustom"),
    },
    {
      id: "rowTableOrderingQr",
      label: t("rowTableOrderingQr"),
      free: freeCaps.tableOrderingQr,
      pro: proCaps.tableOrderingQr,
      custom: customCaps.tableOrderingQr,
    },
    {
      id: "rowLiveNotifications",
      label: t("rowLiveNotifications"),
      free: freeCaps.liveOrderNotifications,
      pro: proCaps.liveOrderNotifications,
      custom: customCaps.liveOrderNotifications,
    },
    {
      id: "rowPhotoLibrary",
      label: t("rowPhotoLibrary"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      id: "rowMultiLanguage",
      label: t("rowMultiLanguage"),
      free: false,
      pro: true,
      custom: true,
    },
    {
      id: "rowDashboard",
      label: t("rowDashboard"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      id: "rowStaffTables",
      label: t("rowStaffTables"),
      free: freeCaps.staffAndTables,
      pro: proCaps.staffAndTables,
      custom: customCaps.staffAndTables,
    },
    {
      id: "rowStaffMobileApp",
      label: t("rowStaffMobileApp"),
      free: freeCaps.staffAndTables,
      pro: proCaps.staffAndTables,
      custom: customCaps.staffAndTables,
    },
    {
      id: "rowStaffNotifications",
      label: t("rowStaffNotifications"),
      free: freeCaps.liveOrderNotifications,
      pro: proCaps.liveOrderNotifications,
      custom: customCaps.liveOrderNotifications,
    },
    {
      id: "rowPlatformUpdates",
      label: t("rowPlatformUpdates"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      id: "rowHostingSecurity",
      label: t("rowHostingSecurity"),
      free: true,
      pro: true,
      custom: true,
    },
    {
      id: "rowAds",
      label: t("rowAds"),
      free: adsCell(freeCaps, t),
      pro: adsCell(proCaps, t),
      custom: adsCell(customCaps, t),
    },
    {
      id: "rowDesign",
      label: t("rowDesign"),
      free: designCell(
        freeCaps,
        freePlan?.allowCustomDomain ?? STATIC_FREE_PLAN.allowCustomDomain,
        "free",
        t,
      ),
      pro: designCell(
        proCaps,
        proPlan?.allowCustomDomain ?? STATIC_PRO_PLAN.allowCustomDomain,
        "pro",
        t,
      ),
      custom: designCell(customCaps, true, "custom", t),
    },
    {
      id: "rowSupport",
      label: t("rowSupport"),
      free: t("supportFree"),
      pro: t("supportPro"),
      custom: t("supportCustom"),
    },
    ...CUSTOM_TABLE_FEATURE_KEYS.map((key) => ({
      id: `customFeature.${key}`,
      label: tLanding(`customFeatures.${key}`),
      free: false,
      pro:
        key === "deliveryMaps"
          ? proCaps.advancedDeliveryMaps
          : key === "waiterRequest" || key === "billRequest"
            ? proCaps.tableOrderingQr
            : false,
      custom:
        key === "deliveryMaps"
          ? customCaps.advancedDeliveryMaps
          : key === "waiterRequest" || key === "billRequest"
            ? customCaps.tableOrderingQr
            : true,
    })),
  ];

  const rowsById = new Map(baseRows.map((row) => [row.id, row] as const));
  return ORDERED_ROW_IDS.map((id) => rowsById.get(id)).filter(
    (row): row is ComparisonRow => Boolean(row),
  );
}

export function comparisonRowToFeatureBullet(
  row: ComparisonRow,
  planId: PlanId,
): string | null {
  const value = row[planId];
  if (value === false) return null;
  if (value === true) return row.label;
  return `${row.label}: ${value}`;
}

export function comparisonRowsToPlanFeatures(
  rows: ComparisonRow[],
  planId: PlanId,
  rowIds: readonly string[] = SUBSCRIPTION_FEATURE_ROW_IDS,
): string[] {
  const rowIdSet = new Set(rowIds);
  return rows
    .filter((row) => rowIdSet.has(row.id))
    .map((row) => comparisonRowToFeatureBullet(row, planId))
    .filter((line): line is string => Boolean(line));
}
