import type { IconType } from "react-icons";
import {
  IoLogInOutline,
  IoQrCodeOutline,
  IoSettingsOutline,
  IoSparklesOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import {
  MdOutlineFastfood,
  MdOutlineTableBar,
  MdPeopleOutline,
} from "react-icons/md";
import { HiSpeakerphone } from "react-icons/hi";
import type { MenuAuditLogEntry } from "@/types/menuAuditLog";

export type AuditActionCategory =
  | "category"
  | "item"
  | "staff"
  | "table"
  | "settings"
  | "ad"
  | "import"
  | "qr"
  | "auth"
  | "other";

type AuditVisual = {
  icon: IconType;
  category: AuditActionCategory;
};

const ENTITY_TYPE_CATEGORY: Record<string, AuditActionCategory> = {
  category: "category",
  item: "item",
  product: "item",
  staff: "staff",
  employee: "staff",
  table: "table",
  settings: "settings",
  setting: "settings",
  ad: "ad",
  advertisement: "ad",
  import: "import",
  menu: "import",
  qr: "qr",
  auth: "auth",
  login: "auth",
};

const CATEGORY_VISUALS: Record<AuditActionCategory, AuditVisual> = {
  category: { icon: BiCategory, category: "category" },
  item: { icon: MdOutlineFastfood, category: "item" },
  staff: { icon: MdPeopleOutline, category: "staff" },
  table: { icon: MdOutlineTableBar, category: "table" },
  settings: { icon: IoSettingsOutline, category: "settings" },
  ad: { icon: HiSpeakerphone, category: "ad" },
  import: { icon: IoSparklesOutline, category: "import" },
  qr: { icon: IoQrCodeOutline, category: "qr" },
  auth: { icon: IoLogInOutline, category: "auth" },
  other: { icon: IoTimeOutline, category: "other" },
};

const ACTION_CATEGORY: Record<string, AuditActionCategory> = {
  CATEGORY_CREATED: "category",
  CATEGORY_UPDATED: "category",
  CATEGORY_DELETED: "category",
  ITEM_CREATED: "item",
  ITEM_UPDATED: "item",
  ITEM_DELETED: "item",
  STAFF_CREATED: "staff",
  STAFF_UPDATED: "staff",
  STAFF_DELETED: "staff",
  TABLE_CREATED: "table",
  TABLE_UPDATED: "table",
  TABLE_DELETED: "table",
  QR_DOWNLOADED: "qr",
  AD_CREATED: "ad",
  AD_UPDATED: "ad",
  AD_DELETED: "ad",
  SETTINGS_UPDATED: "settings",
  MENU_IMPORTED: "import",
  LOGIN: "auth",
  USER_LOGIN: "auth",
};

function categoryFromEntityType(
  entityType?: string | null,
): AuditActionCategory | null {
  if (!entityType?.trim()) return null;
  return ENTITY_TYPE_CATEGORY[entityType.trim().toLowerCase()] ?? null;
}

export function getAuditVisual(
  actionType: string,
  entityType?: string | null,
): AuditVisual {
  const category =
    ACTION_CATEGORY[actionType] ??
    categoryFromEntityType(entityType) ??
    "other";
  return CATEGORY_VISUALS[category];
}

export function resolveAuditTitle(entry: MenuAuditLogEntry): string {
  return entry.title?.trim() || entry.actionType;
}

export function resolveAuditDescription(
  entry: MenuAuditLogEntry,
): string | null {
  return entry.description?.trim() || null;
}

export function resolveAuditCategory(
  entry: MenuAuditLogEntry,
): AuditActionCategory {
  return getAuditVisual(entry.actionType, entry.entityType).category;
}
