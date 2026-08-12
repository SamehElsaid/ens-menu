"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { postTableOrderAction } from "@/lib/tableOrderActions";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Button, type ButtonVariant } from "@/components/ui";
import type {
  CallEntry,
  OrderActionResult,
  OrderActionType,
  OrderStatus,
} from "@/lib/tableOrders";

interface OrderActionButtonsProps {
  menuId: string;
  entry: CallEntry;
  status: OrderStatus;
  onComplete: (result: OrderActionResult) => void;
  compact?: boolean;
  translationNs?: "tableOrders" | "deliveryOrders";
  variant?: "table" | "delivery";
}

/** Staff permission required for each order action (owners always pass). */
const ACTION_PERMISSION: Record<OrderActionType, string> = {
  TABLE_CALL_CONFIRMED: "orders:confirm",
  TABLE_CALL_CANCELLED: "orders:cancel",
  TABLE_CALL_PREPARED: "orders:prepare",
  TABLE_CALL_DELIVERED: "orders:deliver",
  TABLE_CALL_COMPLETED: "orders:complete",
};

type ActionConfig = {
  action: OrderActionType;
  labelKey:
    | "accept"
    | "acceptAddition"
    | "reject"
    | "markPrepared"
    | "markDelivered"
    | "finish";
  variant: ButtonVariant;
};

/**
 * Moving the order along is always the primary button — DESIGN.md §3, the solid
 * brand fill is where the light lands and there is one of it per row. The one
 * exception is re-accepting a guest addition, which takes the accent tint
 * precisely because it is the state saying the order changed under the kitchen
 * and needs looking at again. Rejecting is the only destructive path and
 * carries the danger tone as a ghost rather than a solid red fill, so it never
 * outweighs the action that moves the order forward.
 */
function actionsForStatus(
  status: OrderStatus,
  variant: "table" | "delivery",
  pendingGuestAddition: boolean,
): ActionConfig[] {
  if (variant === "table") {
    // Guest changed the cart after accept — must Accept again before Finish.
    if (
      pendingGuestAddition &&
      (status === "confirmed" || status === "prepared")
    ) {
      return [
        {
          action: "TABLE_CALL_CONFIRMED",
          labelKey: "acceptAddition",
          variant: "accent",
        },
      ];
    }
    switch (status) {
      case "pending":
        return [
          {
            action: "TABLE_CALL_CONFIRMED",
            labelKey: pendingGuestAddition ? "acceptAddition" : "accept",
            variant: "primary",
          },
          {
            action: "TABLE_CALL_CANCELLED",
            labelKey: "reject",
            variant: "dangerGhost",
          },
        ];
      case "confirmed":
      case "prepared":
        return [
          {
            action: "TABLE_CALL_COMPLETED",
            labelKey: "finish",
            variant: "primary",
          },
        ];
      default:
        return [];
    }
  }

  switch (status) {
    case "pending":
      return [
        {
          action: "TABLE_CALL_CONFIRMED",
          labelKey: "accept",
          variant: "primary",
        },
        {
          action: "TABLE_CALL_CANCELLED",
          labelKey: "reject",
          variant: "dangerGhost",
        },
      ];
    case "confirmed":
      return [
        {
          action: "TABLE_CALL_PREPARED",
          labelKey: "markPrepared",
          variant: "primary",
        },
      ];
    case "prepared":
      return [
        {
          action: "TABLE_CALL_DELIVERED",
          labelKey: "markDelivered",
          variant: "primary",
        },
      ];
    default:
      return [];
  }
}

export default function OrderActionButtons({
  menuId,
  entry,
  status,
  onComplete,
  compact = false,
  translationNs = "tableOrders",
  variant = "table",
}: OrderActionButtonsProps) {
  const t = useTranslations(translationNs);
  const locale = useLocale();
  const { can } = useAuthorization();
  const [actingAction, setActingAction] = useState<OrderActionType | null>(
    null,
  );
  const pendingGuestAddition = entry.pendingGuestAddition === true;
  const actions = actionsForStatus(
    status,
    variant,
    pendingGuestAddition,
  ).filter((cfg) => can(ACTION_PERMISSION[cfg.action]));

  if (actions.length === 0) return null;

  const isBusy = actingAction !== null;

  const handleAction = async (action: OrderActionType) => {
    if (isBusy) return;
    setActingAction(action);
    try {
      const nextStatus = await postTableOrderAction(
        menuId,
        entry.id,
        action,
        locale,
      );
      if (nextStatus) {
        toast.success(t("actionSuccess"));
        onComplete({
          entryId: entry.id,
          status: nextStatus,
          clearPendingGuestAddition:
            pendingGuestAddition && action === "TABLE_CALL_CONFIRMED",
        });
      } else {
        toast.error(
          pendingGuestAddition && action === "TABLE_CALL_COMPLETED"
            ? t("acceptAdditionRequired")
            : t("actionError"),
        );
      }
    } catch {
      toast.error(t("actionError"));
    } finally {
      setActingAction(null);
    }
  };

  return (
    <div
      className={`flex gap-1.5 ${compact ? "w-full flex-col" : "flex-wrap justify-end"}`}
    >
      {actions.map((cfg) => (
        <Button
          key={`${cfg.action}-${cfg.labelKey}`}
          type="button"
          size="sm"
          variant={cfg.variant}
          fullWidth={compact}
          disabled={isBusy && actingAction !== cfg.action}
          loading={actingAction === cfg.action}
          onClick={() => void handleAction(cfg.action)}
          className={[
            cfg.variant === "dangerGhost" ? "border-danger-line" : "",
            compact ? "" : "flex-1 sm:min-w-28 sm:flex-none",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {t(cfg.labelKey)}
        </Button>
      ))}
    </div>
  );
}
