import { axiosPatch, axiosPost } from "@/shared/axiosCall";
import type { CallItem, OrderActionType, OrderStatus } from "@/lib/tableOrders";
import { orderStatusFromAction } from "@/lib/tableOrders";

export async function postTableOrderAction(
  menuId: string,
  entryId: string,
  action: OrderActionType,
  locale: string,
): Promise<OrderStatus | null> {
  const result = await axiosPost<
    { action: OrderActionType },
    { status?: string; ok?: boolean }
  >(`/menus/${menuId}/activity-logs/${entryId}/actions`, locale, { action });
  if (!result.status) return null;
  const raw = (result.data as { status?: string } | undefined)?.status
    ?.trim()
    .toLowerCase();
  if (
    raw === "pending" ||
    raw === "confirmed" ||
    raw === "cancelled" ||
    raw === "prepared" ||
    raw === "delivered"
  ) {
    return raw;
  }
  return orderStatusFromAction(action);
}

export async function patchTableOrderItems(
  menuId: string,
  entryId: string,
  items: CallItem[],
  locale: string,
): Promise<{ items: CallItem[]; orderTotal: number; status: OrderStatus } | null> {
  const result = await axiosPatch<
    { items: CallItem[] },
    {
      ok?: boolean;
      items?: CallItem[];
      orderTotal?: number;
      status?: string;
    }
  >(`/menus/${menuId}/activity-logs/${entryId}/items`, locale, { items });
  if (!result.status) return null;
  const data = result.data;
  if (!data?.items) return null;
  const raw = String(data.status ?? "").trim().toLowerCase();
  const status =
    raw === "pending" ||
    raw === "confirmed" ||
    raw === "cancelled" ||
    raw === "prepared" ||
    raw === "delivered"
      ? (raw as OrderStatus)
      : ("confirmed" as OrderStatus);
  return {
    items: data.items,
    orderTotal: Number(data.orderTotal ?? 0),
    status,
  };
}
