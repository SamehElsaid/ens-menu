"use client";

import OrderDetailsModal from "./OrderDetailsModal";
import type { CallEntryDetail } from "@/lib/tableOrders";

export default function DeliveryOrderDetailsModal({
  entry,
  loading,
  currency,
  onClose,
  menuId,
  onActionComplete,
}: {
  entry: CallEntryDetail | null;
  loading: boolean;
  currency: string;
  onClose: () => void;
  menuId?: string;
  onActionComplete?: () => void;
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
    />
  );
}
