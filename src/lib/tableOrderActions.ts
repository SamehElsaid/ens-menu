import { axiosPost } from "@/shared/axiosCall";
import type { OrderActionType, OrderStatus } from "@/lib/tableOrders";
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
