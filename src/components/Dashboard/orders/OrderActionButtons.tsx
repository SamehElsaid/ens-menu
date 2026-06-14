"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { postTableOrderAction } from "@/lib/tableOrderActions";
import type { CallEntry, OrderActionType, OrderStatus } from "@/lib/tableOrders";

interface OrderActionButtonsProps {
  menuId: string;
  entry: CallEntry;
  status: OrderStatus;
  onComplete: () => void;
  compact?: boolean;
}

type ActionConfig = {
  action: OrderActionType;
  labelKey: "accept" | "reject" | "markPrepared" | "markDelivered";
  className: string;
};

function actionsForStatus(status: OrderStatus): ActionConfig[] {
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
            "bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500",
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
}: OrderActionButtonsProps) {
  const t = useTranslations("tableOrders");
  const locale = useLocale();
  const [localActing, setLocalActing] = useState(false);
  const actions = actionsForStatus(status);

  if (actions.length === 0) return null;

  const isBusy = localActing;

  const handleAction = async (action: OrderActionType) => {
    if (isBusy) return;
    setLocalActing(true);
    try {
      const ok = await postTableOrderAction(menuId, entry.id, action, locale);
      if (ok) {
        toast.success(t("actionSuccess"));
        onComplete();
      } else {
        toast.error(t("actionError"));
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
          key={cfg.action}
          type="button"
          disabled={isBusy}
          onClick={() => void handleAction(cfg.action)}
          className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${compact ? "w-full" : "flex-1 sm:flex-none sm:min-w-28"} ${cfg.className}`}
        >
          {t(cfg.labelKey)}
        </button>
      ))}
    </div>
  );
}
