"use client";

import type { CallEntry } from "@/lib/tableOrders";
import OrderMobileCard from "./OrderMobileCard";

interface OrdersMobileListProps {
  entries: CallEntry[];
  currency: string;
  menuId: string;
  onView: (id: string) => void;
  onActionComplete: () => void;
}

export default function OrdersMobileList({
  entries,
  currency,
  menuId,
  onView,
  onActionComplete,
}: OrdersMobileListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
      {entries.map((entry) => (
        <OrderMobileCard
          key={entry.id}
          entry={entry}
          currency={currency}
          menuId={menuId}
          onView={onView}
          onActionComplete={onActionComplete}
        />
      ))}
    </div>
  );
}
