export type OrderStatus =
  "pending" | "confirmed" | "cancelled" | "prepared" | "delivered";

export type OrderActionType =
  | "TABLE_CALL_CONFIRMED"
  | "TABLE_CALL_CANCELLED"
  | "TABLE_CALL_PREPARED"
  | "TABLE_CALL_DELIVERED"
  | "TABLE_CALL_COMPLETED";

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
  itemsSubtotal?: number | null;
  taxEnabled?: boolean | null;
  taxPercent?: number | null;
  taxAmount?: number | null;
  serviceEnabled?: boolean | null;
  servicePercent?: number | null;
  serviceAmount?: number | null;
  pendingGuestAddition?: boolean;
  pendingBillRequest?: boolean;
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
  /** Set on account-level lists so an order can be traced back to its menu. */
  menuId?: number | null;
  menuSlug?: string | null;
  menuNameAr?: string | null;
  menuNameEn?: string | null;
  menuLogo?: string | null;
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
  itemsSubtotal?: number | null;
  taxEnabled?: boolean | null;
  taxPercent?: number | null;
  taxAmount?: number | null;
  serviceEnabled?: boolean | null;
  servicePercent?: number | null;
  serviceAmount?: number | null;
  /** Guest added/edited lines after staff already had the order — needs Accept again. */
  pendingGuestAddition?: boolean;
  /** Guest asked for the bill on this open table order. */
  pendingBillRequest?: boolean;
  actionDetails?: ActionDetail[];
  category?: unknown;
  categoryName?: string;
  categoryId?: string | number;
}

export interface CallEntryDetail {
  id?: string;
  orderId?: string | number;
  /** Set by the account-level detail endpoint so actions know their menu. */
  menuId?: number | null;
  totalPrice?: number;
  items?: CallItem[];
  itemsSubtotal?: number | null;
  taxEnabled?: boolean | null;
  taxPercent?: number | null;
  taxAmount?: number | null;
  serviceEnabled?: boolean | null;
  servicePercent?: number | null;
  serviceAmount?: number | null;
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
  pendingGuestAddition?: boolean;
  pendingBillRequest?: boolean;
}

export interface ActivityCallsPayload {
  entries?: CallEntry[];
  calls?: CallEntry[];
  totalPages?: number;
  total?: number;
}

/** Menu descriptor returned alongside account-level order lists. */
export interface OrdersMenuOption {
  id: number;
  slug: string | null;
  nameAr: string | null;
  nameEn: string | null;
  logo: string | null;
  currency: string | null;
}

export interface DashboardOrdersPayload extends ActivityCallsPayload {
  menus?: OrdersMenuOption[];
}

/** Per-menu display data for order cards in an account-level (mixed) list. */
export interface OrderMenuBadge {
  label: string;
  currency: string;
}

export type OrderMenuBadges = Record<number, OrderMenuBadge>;

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
    case "TABLE_CALL_COMPLETED":
      return "delivered";
    default:
      return "pending";
  }
}

/** Patch list card status in place — avoids full list refetch after an action. */
export function applyLocalEntryStatusUpdate(
  entry: CallEntry,
  status: OrderStatus,
  opts?: {
    clearPendingGuestAddition?: boolean;
    clearPendingBillRequest?: boolean;
  },
): CallEntry {
  const now = new Date().toISOString();
  return {
    ...entry,
    ...(opts?.clearPendingGuestAddition ? { pendingGuestAddition: false } : {}),
    ...(opts?.clearPendingBillRequest ||
    status === "delivered" ||
    status === "cancelled"
      ? { pendingBillRequest: false }
      : {}),
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

/**
 * Which visible tickets a silent refetch actually changed.
 *
 * The socket says "something happened on this menu", not "order 41 moved to
 * prepared", so the list is refetched and the two versions compared here. On a
 * live orders screen the question is *which of these forty cards just changed*,
 * and a card cannot answer it by moving — a ticket that shifts under a thumb
 * already travelling towards its Accept button is a misfire. The ids returned
 * here get a decaying border tint instead.
 *
 * A brand-new order is not included: it arrives at the top of the list, which is
 * a bigger signal than any highlight, and it comes with a sound.
 */
export function collectChangedOrderIds(
  prev: CallEntry[],
  fresh: CallEntry[],
): Set<string> {
  const changed = new Set<string>();
  if (prev.length === 0) return changed;

  const signature = (entry: CallEntry) =>
    [
      resolveListEntryStatus(entry),
      entry.pendingGuestAddition === true ? "g" : "",
      entry.pendingBillRequest === true ? "b" : "",
      entry.items?.length ?? 0,
      entry.totalPrice ?? "",
    ].join("|");

  const prevById = new Map(prev.map((e) => [e.id, e]));
  for (const entry of fresh) {
    const before = prevById.get(entry.id);
    if (before && signature(before) !== signature(entry)) changed.add(entry.id);
  }
  return changed;
}

export type OrderActionResult = {
  entryId: string;
  status: OrderStatus;
  clearPendingGuestAddition?: boolean;
};

export function isPendingOrder(entry: CallEntry): boolean {
  return (
    resolveListEntryStatus(entry) === "pending" ||
    entry.pendingGuestAddition === true ||
    entry.pendingBillRequest === true
  );
}

export function isEditableOrderStatus(status: OrderStatus): boolean {
  return (
    status === "pending" || status === "confirmed" || status === "prepared"
  );
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
  TABLE_CALL_COMPLETED: { en: "Order Completed", ar: "تم إنهاء الطلب" },
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

export function resolveEntryDeliveryFee(entry: {
  deliveryFee?: number | null;
  order?: EntryOrder | null;
}): number | null {
  if (entry.deliveryFee != null && Number.isFinite(Number(entry.deliveryFee))) {
    return Number(entry.deliveryFee);
  }
  if (
    entry.order?.deliveryFee != null &&
    Number.isFinite(Number(entry.order.deliveryFee))
  ) {
    return Number(entry.order.deliveryFee);
  }
  return null;
}

/** Items subtotal plus delivery fee (when applicable). */
export function deliveryGrandTotal(
  itemsTotal: number,
  deliveryFee?: number | null,
): number {
  const fee =
    deliveryFee != null &&
    Number.isFinite(Number(deliveryFee)) &&
    Number(deliveryFee) > 0
      ? Number(deliveryFee)
      : 0;
  return Math.round((itemsTotal + fee) * 100) / 100;
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
