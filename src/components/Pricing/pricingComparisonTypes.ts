import type { ReactNode } from "react";

export type CellVal = boolean | string | number;

export type ComparisonRow = {
  id: string;
  label: string;
  free: CellVal;
  pro: CellVal;
  custom: CellVal;
};

export type PlanId = "free" | "pro" | "custom";

export const PRIMARY_MOBILE_ROW_IDS = [
  "rowMenus",
  "rowSmartQr",
  "rowAiWaiter",
  "rowTableOrderingQr",
  "rowStaffTables",
  "rowMultiLanguage",
  "rowSupport",
] as const;
