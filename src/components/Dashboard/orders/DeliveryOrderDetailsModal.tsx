"use client";

import OrderDetailsModal from "./OrderDetailsModal";
import type {
  CallEntryDetail,
  CallItem,
  OrderActionResult,
  OrderStatus,
} from "@/lib/tableOrders";

export default function DeliveryOrderDetailsModal({
  entry,
  loading,
  currency,
  onClose,
  menuId,
  onActionComplete,
  onItemsUpdated,
}: {
  entry: CallEntryDetail | null;
  loading: boolean;
  currency: string;
  onClose: () => void;
  menuId?: string;
  onActionComplete?: (result: OrderActionResult) => void;
  onItemsUpdated?: (
    entryId: string,
    items: CallItem[],
    orderTotal: number,
    status: OrderStatus,
  ) => void;
}) {
  return (
    <OrderDetailsModal
      entry={entry}
      loading={loading}
      currency={currency}
      onClose={onClose}
      variant="delivery"
      menuId={menuId}
      onActionComplete={onActionComplete}
      onItemsUpdated={onItemsUpdated}
    />
  );
}
