import { axiosPost } from "@/shared/axiosCall";
import type { OrderActionType } from "@/lib/tableOrders";

export async function postTableOrderAction(
  menuId: string,
  entryId: string,
  action: OrderActionType,
  locale: string,
): Promise<boolean> {
  const result = await axiosPost<{ action: OrderActionType }, { message?: string }>(
    `/menus/${menuId}/activity-logs/${entryId}/actions`,
    locale,
    { action },
  );
  return result.status;
}
