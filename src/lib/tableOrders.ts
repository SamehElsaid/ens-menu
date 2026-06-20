export type OrderStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "prepared"
  | "delivered";

export type OrderActionType =
  | "TABLE_CALL_CONFIRMED"
  | "TABLE_CALL_CANCELLED"
  | "TABLE_CALL_PREPARED"
  | "TABLE_CALL_DELIVERED";

export interface CallItemOption {
  nameAr?: string;
  nameEn?: string;
  labelAr?: string;
  labelEn?: string;
  price?: number;
}

export interface CallItem {
  menuItemId?: string | number;
  name?: string;
  price?: number;
  quantity?: number;
  total?: number;
  size?: CallItemOption | null;
  variant?: CallItemOption | null;
}

export type StaffOrderType = "table" | "delivery";

export interface EntryOrder {
  type?: StaffOrderType | string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  orderNotes?: string | null;
  tableNumber?: string | null;
  status?: string;
  orderTotal?: number;
  items?: CallItem[];
  /** @deprecated use `type` */
  orderChannel?: string;
  governorateId?: number | null;
  governorateNameAr?: string | null;
  governorateNameEn?: string | null;
  deliveryFee?: number | null;
}

export interface ActionDetail {
  time?: string;
  status?: string;
}

export interface EntryAction {
  action?: string;
  status?: string;
  summaryEn?: string | null;
  summaryAr?: string | null;
  waiterName?: string | null;
  actorRole?: string | null;
  time?: string;
  detail?: {
    order?: EntryOrder | null;
  } | null;
}

export interface CallEntry {
  id: string;
  orderId: string | number;
  type?: StaffOrderType | string;
  tableNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  orderNotes?: string | null;
  governorateId?: number | null;
  governorateNameAr?: string | null;
  governorateNameEn?: string | null;
  deliveryFee?: number | null;
  totalPrice?: number;
  items?: CallItem[];
  actionDetails?: ActionDetail[];
  category?: unknown;
  categoryName?: string;
  categoryId?: string | number;
}

export interface CallEntryDetail {
  id?: string;
  orderId?: string | number;
  totalPrice?: number;
  items?: CallItem[];
  actions?: EntryAction[];
  order?: EntryOrder | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  orderNotes?: string | null;
  governorateId?: number | null;
  governorateNameAr?: string | null;
  governorateNameEn?: string | null;
  deliveryFee?: number | null;
}

export interface ActivityCallsPayload {
  entries?: CallEntry[];
  calls?: CallEntry[];
  totalPages?: number;
  total?: number;
}

const TERMINAL_STATUSES = new Set<OrderStatus>([
  "confirmed",
  "cancelled",
  "prepared",
  "delivered",
]);

/** Latest lifecycle status (not the first TABLE_CALL_CREATED row). */
export function resolveLatestOrderStatus(
  actions?: Array<{ status?: string }>,
  order?: { status?: string } | null,
): OrderStatus {
  const orderStatus = order?.status?.trim().toLowerCase() as OrderStatus | "";
  if (orderStatus && TERMINAL_STATUSES.has(orderStatus)) {
    return orderStatus;
  }
  if (!actions?.length) return "pending";
  for (let i = actions.length - 1; i >= 0; i -= 1) {
    const s = String(actions[i]?.status ?? "")
      .trim()
      .toLowerCase() as OrderStatus | "table_call_created";
    if (s === "table_call_created") return "pending";
    if (TERMINAL_STATUSES.has(s as OrderStatus)) return s as OrderStatus;
  }
  const last = String(actions[actions.length - 1]?.status ?? "pending")
    .trim()
    .toLowerCase();
  if (last === "table_call_created") return "pending";
  return last as OrderStatus;
}

export function resolveListEntryStatus(entry: CallEntry): OrderStatus {
  return resolveLatestOrderStatus(entry.actionDetails);
}

export function orderStatusFromAction(action: OrderActionType): OrderStatus {
  switch (action) {
    case "TABLE_CALL_CONFIRMED":
      return "confirmed";
    case "TABLE_CALL_CANCELLED":
      return "cancelled";
    case "TABLE_CALL_PREPARED":
      return "prepared";
    case "TABLE_CALL_DELIVERED":
      return "delivered";
    default:
      return "pending";
  }
}

/** Patch list card status in place — avoids full list refetch after an action. */
export function applyLocalEntryStatusUpdate(
  entry: CallEntry,
  status: OrderStatus,
): CallEntry {
  const now = new Date().toISOString();
  return {
    ...entry,
    actionDetails: [...(entry.actionDetails ?? []), { status, time: now }],
  };
}

/** Keep visible order stable; only prepend genuinely new rows. */
export function mergeOrderEntries(
  prev: CallEntry[],
  fresh: CallEntry[],
): CallEntry[] {
  if (prev.length === 0) return fresh;
  const freshById = new Map(fresh.map((e) => [e.id, e]));
  const prevIds = new Set(prev.map((e) => e.id));
  const updated = prev.map((e) => freshById.get(e.id) ?? e);
  const newOnes = fresh.filter((e) => !prevIds.has(e.id));
  return newOnes.length > 0 ? [...newOnes, ...updated] : updated;
}

export type OrderActionResult = {
  entryId: string;
  status: OrderStatus;
};

export function isPendingOrder(entry: CallEntry): boolean {
  return resolveListEntryStatus(entry) === "pending";
}

export function countPendingOrders(entries: CallEntry[]): number {
  return entries.filter(isPendingOrder).length;
}

export function callItemOptionLabel(
  opt: CallItemOption | null | undefined,
  locale: string,
  kind: "size" | "variant",
): string {
  if (!opt) return "";
  if (kind === "size") {
    return locale === "ar"
      ? opt.nameAr || opt.nameEn || ""
      : opt.nameEn || opt.nameAr || "";
  }
  return locale === "ar"
    ? opt.labelAr || opt.labelEn || ""
    : opt.labelEn || opt.labelAr || "";
}

export function dashboardSocketOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_URL ?? "").trim();
  if (!raw) {
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }
  try {
    const u = new URL(raw);
    const path = u.pathname.replace(/\/+$/, "");
    if (path === "/api" || path.endsWith("/api")) {
      u.pathname = "";
      return u.origin;
    }
    return u.origin;
  } catch {
    return raw.replace(/\/?api\/?$/i, "");
  }
}

export const ORDER_ACTION_LABEL: Record<string, { en: string; ar: string }> = {
  TABLE_CALL_CREATED: { en: "Order Created", ar: "تم إنشاء الطلب" },
  TABLE_CALL_CONFIRMED: { en: "Order Confirmed", ar: "تم تأكيد الطلب" },
  TABLE_CALL_CANCELLED: { en: "Order Cancelled", ar: "تم إلغاء الطلب" },
  TABLE_CALL_ITEMS_UPDATED: { en: "Items Updated", ar: "تم تحديث الأصناف" },
  TABLE_CALL_PREPARED: { en: "Order Prepared", ar: "تم تحضير الطلب" },
  TABLE_CALL_DELIVERED: { en: "Order Delivered", ar: "تم تسليم الطلب" },
};

export function orderActionLabel(action: string, locale: string): string {
  const entry = ORDER_ACTION_LABEL[action];
  if (!entry) return action;
  return locale === "ar" ? entry.ar : entry.en;
}

export function isGuestOrderAction(act: EntryAction): boolean {
  return (
    act.action === "TABLE_CALL_CREATED" ||
    String(act.actorRole ?? "").toLowerCase() === "guest"
  );
}

export function actionActorName(
  act: EntryAction,
  order?: EntryOrder | null,
): string {
  if (isGuestOrderAction(act)) {
    const fromOrder =
      order?.customerName ?? act.detail?.order?.customerName ?? null;
    if (fromOrder != null && String(fromOrder).trim() !== "") {
      return String(fromOrder).trim();
    }
  }
  return act.waiterName?.trim() ?? "";
}

export function lastStaffWaiterName(actions: EntryAction[]): string | null {
  for (let i = actions.length - 1; i >= 0; i -= 1) {
    const act = actions[i];
    if (isGuestOrderAction(act)) continue;
    const name = act.waiterName?.trim();
    if (name) return name;
  }
  return null;
}

export function resolveEntryTime(details?: ActionDetail[]): string | undefined {
  if (!details?.length) return undefined;
  return details[details.length - 1]?.time;
}

export function isDeliveryEntry(entry: {
  type?: string | null;
  tableNumber?: string | null;
  order?: EntryOrder | null;
}): boolean {
  const typeRaw = String(
    entry.type ?? entry.order?.type ?? entry.order?.orderChannel ?? "",
  )
    .trim()
    .toLowerCase();
  if (typeRaw === "delivery") return true;
  if (typeRaw === "table") return false;
  const table = entry.tableNumber ?? entry.order?.tableNumber ?? "";
  return String(table).trim().toLowerCase() === "delivery";
}

export function deliveryGovernorateLabel(
  entry: {
    governorateNameAr?: string | null;
    governorateNameEn?: string | null;
    order?: EntryOrder | null;
  },
  locale: string,
): string | null {
  const ar =
    entry.governorateNameAr?.trim() ||
    entry.order?.governorateNameAr?.trim() ||
    "";
  const en =
    entry.governorateNameEn?.trim() ||
    entry.order?.governorateNameEn?.trim() ||
    "";
  if (locale === "ar") return ar || en || null;
  return en || ar || null;
}

export function orderStatusTone(status: OrderStatus): {
  pill: string;
  dot: string;
} {
  switch (status) {
    case "confirmed":
      return {
        pill: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        dot: "text-green-500",
      };
    case "prepared":
      return {
        pill: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
        dot: "text-sky-500",
      };
    case "delivered":
      return {
        pill: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
        dot: "text-violet-500",
      };
    case "cancelled":
      return {
        pill: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        dot: "text-red-500",
      };
    default:
      return {
        pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        dot: "text-amber-500",
      };
  }
}
