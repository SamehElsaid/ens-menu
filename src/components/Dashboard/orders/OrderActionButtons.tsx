"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { postTableOrderAction } from "@/lib/tableOrderActions";
import { useAuthorization } from "@/hooks/useAuthorization";
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
  className: string;
};

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
          className:
            "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400",
        },
      ];
    }
    switch (status) {
      case "pending":
        return [
          {
            action: "TABLE_CALL_CONFIRMED",
            labelKey: pendingGuestAddition ? "acceptAddition" : "accept",
            className:
              "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",
          },
          {
            action: "TABLE_CALL_CANCELLED",
            labelKey: "reject",
            className:
              "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/40",
          },
        ];
      case "confirmed":
      case "prepared":
        return [
          {
            action: "TABLE_CALL_COMPLETED",
            labelKey: "finish",
            className:
              "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active",
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
          className:
            "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",
        },
        {
          action: "TABLE_CALL_CANCELLED",
          labelKey: "reject",
          className:
            "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/40",
        },
      ];
    case "confirmed":
      return [
        {
          action: "TABLE_CALL_PREPARED",
          labelKey: "markPrepared",
          className:
            "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500",
        },
      ];
    case "prepared":
      return [
        {
          action: "TABLE_CALL_DELIVERED",
          labelKey: "markDelivered",
          className:
            "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-active",
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
  const [localActing, setLocalActing] = useState(false);
  const pendingGuestAddition = entry.pendingGuestAddition === true;
  const actions = actionsForStatus(
    status,
    variant,
    pendingGuestAddition,
  ).filter((cfg) => can(ACTION_PERMISSION[cfg.action]));

  if (actions.length === 0) return null;

  const isBusy = localActing;

  const handleAction = async (action: OrderActionType) => {
    if (isBusy) return;
    setLocalActing(true);
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
      setLocalActing(false);
    }
  };

  return (
    <div
      className={`flex gap-2 ${compact ? "w-full flex-col" : "flex-wrap justify-end"}`}
    >
      {actions.map((cfg) => (
        <button
          key={`${cfg.action}-${cfg.labelKey}`}
          type="button"
          disabled={isBusy}
          onClick={() => void handleAction(cfg.action)}
          className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${compact ? "w-full" : "flex-1 sm:flex-none sm:min-w-28"} ${cfg.className}`}
        >
          {t(cfg.labelKey)}
        </button>
      ))}
    </div>
  );
}
