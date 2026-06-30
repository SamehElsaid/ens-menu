import type {
  ComparisonRow,
  PlanId,
} from "@/components/Pricing/pricingComparisonTypes";

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

export function buildPricingComparisonRows({
  t,
  tLanding,
}: PricingRowTranslators): ComparisonRow[] {
  const tBasic = t("cellBasic");

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
      free: STATIC_FREE_PLAN.maxMenus,
      pro: STATIC_PRO_PLAN.maxMenus,
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
      free: tBasic,
      pro: true,
      custom: true,
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
      free: false,
      pro: true,
      custom: true,
    },
    {
      id: "rowLiveNotifications",
      label: t("rowLiveNotifications"),
      free: false,
      pro: true,
      custom: true,
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
      free: false,
      pro: true,
      custom: true,
    },
    {
      id: "rowStaffMobileApp",
      label: t("rowStaffMobileApp"),
      free: false,
      pro: true,
      custom: true,
    },
    {
      id: "rowStaffNotifications",
      label: t("rowStaffNotifications"),
      free: false,
      pro: true,
      custom: true,
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
      free: t("adsFreeOne"),
      pro: t("adsUnlimited"),
      custom: t("adsUnlimited"),
    },
    {
      id: "rowDesign",
      label: t("rowDesign"),
      free: t("designFree"),
      pro: t("designPro"),
      custom: t("designCustom"),
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
      pro: false,
      custom: true,
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
