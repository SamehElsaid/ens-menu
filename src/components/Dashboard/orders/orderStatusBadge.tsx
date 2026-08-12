import type { ReactNode } from "react";
import {
  IoBagCheckOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRestaurantOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { Badge, type StatusTone } from "@/components/ui";
import type { OrderStatus } from "@/lib/tableOrders";

/**
 * Status → tone.
 *
 * Pending is the accent because it is the order still waiting on someone;
 * everything after it is a resolved state. Info sits closest to the brand on
 * the hue wheel, so every reading of this map is paired with a glyph — a status
 * is never signalled by hue alone (DESIGN.md §3).
 */
const TONES: Record<OrderStatus, StatusTone> = {
  pending: "accent",
  confirmed: "success",
  prepared: "info",
  delivered: "brand",
  cancelled: "danger",
};

const ICONS: Record<OrderStatus, ReactNode> = {
  pending: <IoTimeOutline />,
  confirmed: <IoCheckmarkCircleOutline />,
  prepared: <IoRestaurantOutline />,
  delivered: <IoBagCheckOutline />,
  cancelled: <IoCloseCircleOutline />,
};

export function orderStatusTone(status: string): StatusTone {
  return TONES[status as OrderStatus] ?? "neutral";
}

export function orderStatusIcon(status: string): ReactNode {
  return ICONS[status as OrderStatus] ?? <IoTimeOutline />;
}

/** The status pill. One component so every list, card and dialog in the
 *  orders area reads the same status the same way. */
export function OrderStatusBadge({
  status,
  label,
  size = "sm",
  className,
}: {
  status: string;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Badge
      tone={orderStatusTone(status)}
      size={size}
      icon={orderStatusIcon(status)}
      className={className}
    >
      {label}
    </Badge>
  );
}
