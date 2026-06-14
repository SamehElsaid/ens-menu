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
  badgeClass: string;
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

const ACTION_VISUALS: Record<string, AuditVisual> = {
  CATEGORY_CREATED: {
    icon: BiCategory,
    category: "category",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  CATEGORY_UPDATED: {
    icon: BiCategory,
    category: "category",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  CATEGORY_DELETED: {
    icon: BiCategory,
    category: "category",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  ITEM_CREATED: {
    icon: MdOutlineFastfood,
    category: "item",
    badgeClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  ITEM_UPDATED: {
    icon: MdOutlineFastfood,
    category: "item",
    badgeClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  ITEM_DELETED: {
    icon: MdOutlineFastfood,
    category: "item",
    badgeClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  STAFF_CREATED: {
    icon: MdPeopleOutline,
    category: "staff",
    badgeClass:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  STAFF_UPDATED: {
    icon: MdPeopleOutline,
    category: "staff",
    badgeClass:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  STAFF_DELETED: {
    icon: MdPeopleOutline,
    category: "staff",
    badgeClass:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  TABLE_CREATED: {
    icon: MdOutlineTableBar,
    category: "table",
    badgeClass:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  TABLE_UPDATED: {
    icon: MdOutlineTableBar,
    category: "table",
    badgeClass:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  TABLE_DELETED: {
    icon: MdOutlineTableBar,
    category: "table",
    badgeClass:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  QR_DOWNLOADED: {
    icon: IoQrCodeOutline,
    category: "qr",
    badgeClass:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  },
  AD_CREATED: {
    icon: HiSpeakerphone,
    category: "ad",
    badgeClass:
      "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  },
  AD_UPDATED: {
    icon: HiSpeakerphone,
    category: "ad",
    badgeClass:
      "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  },
  AD_DELETED: {
    icon: HiSpeakerphone,
    category: "ad",
    badgeClass:
      "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  },
  SETTINGS_UPDATED: {
    icon: IoSettingsOutline,
    category: "settings",
    badgeClass:
      "bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200",
  },
  MENU_IMPORTED: {
    icon: IoSparklesOutline,
    category: "import",
    badgeClass:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
  LOGIN: {
    icon: IoLogInOutline,
    category: "auth",
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  USER_LOGIN: {
    icon: IoLogInOutline,
    category: "auth",
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
};

const DEFAULT_VISUAL: AuditVisual = {
  icon: IoTimeOutline,
  category: "other",
  badgeClass:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function categoryFromEntityType(entityType?: string | null): AuditActionCategory | null {
  if (!entityType?.trim()) return null;
  return ENTITY_TYPE_CATEGORY[entityType.trim().toLowerCase()] ?? null;
}

export function getAuditVisual(
  actionType: string,
  entityType?: string | null,
): AuditVisual {
  const fromAction = ACTION_VISUALS[actionType];
  if (fromAction) return fromAction;

  const fromEntity = categoryFromEntityType(entityType);
  if (fromEntity) {
    const match = Object.values(ACTION_VISUALS).find(
      (visual) => visual.category === fromEntity,
    );
    if (match) return match;
  }

  return DEFAULT_VISUAL;
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
