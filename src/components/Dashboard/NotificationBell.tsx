"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoNotificationsOutline, IoCloseOutline } from "react-icons/io5";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { isDeliveryEntry, resolveEntryTime } from "@/lib/tableOrders";
import { usePendingOrders } from "@/components/Dashboard/PendingOrdersProvider";
import { useRouter } from "@/i18n/navigation";
import ViewTime from "@/shared/ViewTime";
import type { CallEntry } from "@/lib/tableOrders";
import type { CSSProperties } from "react";

interface NotificationBellProps {
  segment: string | null;
}

const MAX_VISIBLE = 15;

export default function NotificationBell({ segment }: NotificationBellProps) {
  const locale = useLocale();
  const t = useTranslations("notifications");
  const isRTL = locale === "ar";
  const router = useRouter();

  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = isFreePlanUser(userData);
  const currency = useAppSelector((s) => s.menuData.menu?.currency ?? "");

  const { pendingEntries, loading } = usePendingOrders();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalCount = pendingEntries.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const computeDropdownStyle = useCallback((): CSSProperties => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      position: "fixed",
      top: rect.bottom + 8,
      ...(isRTL
        ? { left: Math.max(8, rect.left) }
        : { right: Math.max(8, window.innerWidth - rect.right) }),
    };
  }, [isRTL]);

  const open = useCallback(() => {
    setDropdownStyle(computeDropdownStyle());
    setIsOpen(true);
  }, [computeDropdownStyle]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleOrderClick = useCallback(
    (entry: CallEntry) => {
      const isDelivery = isDeliveryEntry(entry);
      const path = isDelivery
        ? `/dashboard/${segment}/delivery-orders`
        : `/dashboard/${segment}/orders`;
      router.push(`${path}?entry=${entry.id}`);
      setIsOpen(false);
    },
    [router, segment],
  );

  if (!segment || isFreePlan) return null;

  const dropdown =
    isOpen && mounted
      ? createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="z-9999 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-[fadeInDown_0.15s_ease-out] dark:border-purple-900/60 dark:bg-[#161b22]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t("title")}
                {totalCount > 0 && (
                  <span className="ms-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {totalCount}
                  </span>
                )}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
              >
                <IoCloseOutline size={18} />
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-sm text-slate-500 dark:text-slate-400">
                  {t("loading")}
                </div>
              ) : pendingEntries.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t("empty")}
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingEntries.slice(0, MAX_VISIBLE).map((entry) => {
                    const isDelivery = isDeliveryEntry(entry);
                    const time = resolveEntryTime(entry.actionDetails);
                    return (
                      <li key={entry.id}>
                        <button
                          onClick={() => handleOrderClick(entry)}
                          className="w-full px-4 py-3 text-start transition-colors hover:bg-purple-50 dark:hover:bg-purple-500/10"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {t("order")} #{entry.orderId}
                                <span
                                  className={`ms-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                    isDelivery
                                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                                      : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                                  }`}
                                >
                                  {isDelivery ? t("delivery") : t("table")}
                                </span>
                              </p>
                              {entry.customerName && (
                                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                  {entry.customerName}
                                </p>
                              )}
                              {!isDelivery && entry.tableNumber && (
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                  {t("tableNo")} {entry.tableNumber}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 text-end">
                              {typeof entry.totalPrice === "number" && (
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                  {entry.totalPrice} {currency}
                                </p>
                              )}
                              {time && (
                                <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                                  <ViewTime data={time} />
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {pendingEntries.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
                <button
                  onClick={() => {
                    router.push(`/dashboard/${segment}/orders`);
                    setIsOpen(false);
                  }}
                  className="w-full text-center text-xs font-medium text-purple-600 hover:underline dark:text-purple-400"
                >
                  {t("viewAll")}
                </button>
              </div>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        aria-label={t("label")}
        className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-purple-50 dark:text-slate-300 dark:hover:bg-purple-500/20"
      >
        <IoNotificationsOutline size={20} />
        {totalCount > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>
      {dropdown}
    </>
  );
}
