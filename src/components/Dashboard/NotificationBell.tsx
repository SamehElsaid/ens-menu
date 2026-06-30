"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  IoNotificationsOutline,
  IoCloseOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
  IoSparklesOutline,
  IoCameraOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import {
  MdOutlineTableBar,
  MdOutlineFastfood,
  MdPeopleOutline,
} from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { TbPhotoEdit } from "react-icons/tb";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { isDeliveryEntry, resolveEntryTime } from "@/lib/tableOrders";
import { usePendingOrders } from "@/components/Dashboard/PendingOrdersProvider";
import { useRouter } from "@/i18n/navigation";
import { axiosGet, axiosPatch, axiosDelete } from "@/shared/axiosCall";
import { menuDashboardPath } from "@/lib/menuDashboardPath";
import ViewTime from "@/shared/ViewTime";
import LinkTo from "@/components/Global/LinkTo";
import type { CallEntry } from "@/lib/tableOrders";
import type { UserNotification } from "@/types/UserNotification";
import type { UserNotificationsResponse } from "@/types/UserNotification";
import type { CSSProperties, ReactNode } from "react";

const SUBSCRIPTION_EXPIRING_TYPES = new Set([
  "subscription_expiring",
  "subscription_expiring_5d",
  "subscription_expiring_1d",
  "subscription_expired",
]);

function isSubscriptionExpiringAlert(type: string): boolean {
  return SUBSCRIPTION_EXPIRING_TYPES.has(type);
}

interface NotificationBellProps {
  segment: string | null;
}

interface PlanTask {
  id: string;
  icon: ReactNode;
  message: string;
  action: string;
  href: string;
}

const MAX_VISIBLE = 10;

export default function NotificationBell({ segment }: NotificationBellProps) {
  const locale = useLocale();
  const t = useTranslations("notifications");
  const isRTL = locale === "ar";
  const router = useRouter();

  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = isFreePlanUser(userData);
  const menu = useAppSelector((s) => s.menuData.menu);
  const currency = useAppSelector((s) => s.menuData.menu?.currency ?? "");

  const { pendingEntries, pendingTableCount, pendingDeliveryCount, loading } =
    usePendingOrders();

  const [accountNotifications, setAccountNotifications] = useState<
    UserNotification[]
  >([]);
  const [unreadAccountCount, setUnreadAccountCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAccountNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    const res = await axiosGet<UserNotificationsResponse>(
      "/user/notifications",
      locale,
      undefined,
      { limit: 20 },
    );
    setNotificationsLoading(false);
    if (res.status && res.data) {
      setAccountNotifications(res.data.notifications ?? []);
      setUnreadAccountCount(Number(res.data.unreadCount ?? 0));
    }
  }, [locale]);

  useEffect(() => {
    if (segment) {
      void fetchAccountNotifications();
    }
  }, [segment, fetchAccountNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    void fetchAccountNotifications();
  }, [isOpen, fetchAccountNotifications]);

  // Build plan tasks dynamically — only include when NOT yet done
  const pendingTasks: PlanTask[] = [];
  if (menu && segment) {
    if ((menu.categoriesCount ?? 0) === 0) {
      pendingTasks.push({
        id: "no-categories",
        icon: <BiCategory className="text-base" />,
        message: t("noCategories"),
        action: t("noCategoriesAction"),
        href: `/dashboard/${segment}/categories`,
      });
    }
    if ((menu.itemsCount ?? 0) === 0) {
      pendingTasks.push({
        id: "no-items",
        icon: <MdOutlineFastfood className="text-base" />,
        message: t("noItems"),
        action: t("noItemsAction"),
        href: `/dashboard/${segment}/items`,
      });
    }
    if (!isFreePlan) {
      if ((menu.tablesCount ?? 0) === 0) {
        pendingTasks.push({
          id: "no-tables",
          icon: <MdOutlineTableBar className="text-base" />,
          message: t("noTables"),
          action: t("noTablesAction"),
          href: `/dashboard/${segment}/table`,
        });
      }
      if ((menu.staffCount ?? 0) === 0) {
        pendingTasks.push({
          id: "no-staff",
          icon: <MdPeopleOutline className="text-base" />,
          message: t("noStaff"),
          action: t("noStaffAction"),
          href: `/dashboard/${segment}/staff`,
        });
      }
      if (!menu.logo?.trim()) {
        pendingTasks.push({
          id: "no-logo",
          icon: <TbPhotoEdit className="text-base" />,
          message: t("noLogo"),
          action: t("noLogoAction"),
          href: `/dashboard/${segment}/settings/media`,
        });
      }
    }
  }

  const isMenuEmpty =
    menu !== null &&
    (menu.categoriesCount ?? 0) === 0 &&
    (menu.itemsCount ?? 0) === 0;

  const totalBadgeCount =
    pendingEntries.length + pendingTasks.length + unreadAccountCount;

  const getNotificationLabel = useCallback(
    (notification: UserNotification) => {
      const title = isRTL ? notification.titleAr : notification.title;
      const message = isRTL ? notification.messageAr : notification.message;
      return { title, message };
    },
    [isRTL],
  );

  const markNotificationRead = useCallback(
    async (notification: UserNotification) => {
      if (notification.isRead) return;
      await axiosPatch<Record<string, never>, { success?: boolean }>(
        `/user/notifications/${notification.id}/read`,
        locale,
        {},
      );
      setAccountNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadAccountCount((count) => Math.max(0, count - 1));
    },
    [locale],
  );

  const goToSubscriptionRenewal = useCallback(
    async (notification: UserNotification) => {
      await markNotificationRead(notification);
      router.push(menuDashboardPath(menu, "subscription"));
      setIsOpen(false);
    },
    [markNotificationRead, router, menu],
  );

  const handleAccountNotificationClick = useCallback(
    (notification: UserNotification) => {
      if (isSubscriptionExpiringAlert(notification.type)) {
        void goToSubscriptionRenewal(notification);
      }
    },
    [goToSubscriptionRenewal],
  );

  const handleDismissNotification = useCallback(
    async (notification: UserNotification) => {
      const res = await axiosDelete<{ success?: boolean }>(
        `/user/notifications/${notification.id}`,
        locale,
      );
      if (!res.status) return;

      setAccountNotifications((prev) =>
        prev.filter((item) => item.id !== notification.id),
      );
      if (!notification.isRead) {
        setUnreadAccountCount((count) => Math.max(0, count - 1));
      }
    },
    [locale],
  );

  const handleNotificationArrowClick = useCallback(
    (notification: UserNotification) => {
      if (isSubscriptionExpiringAlert(notification.type)) {
        void goToSubscriptionRenewal(notification);
        return;
      }
      void handleDismissNotification(notification);
    },
    [goToSubscriptionRenewal, handleDismissNotification],
  );

  const handleMarkAllNotificationsRead = useCallback(async () => {
    const res = await axiosPatch<Record<string, never>, { success?: boolean }>(
      "/user/notifications/read-all",
      locale,
      {},
    );
    if (res.status) {
      setAccountNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
      setUnreadAccountCount(0);
    }
  }, [locale]);

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

  const handleNavClick = useCallback(
    (path: string) => {
      router.push(path);
      setIsOpen(false);
    },
    [router],
  );

  if (!segment) return null;

  const dropdown =
    isOpen && mounted
      ? createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="z-9999 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-[fadeInDown_0.15s_ease-out] dark:border-purple-900/60 dark:bg-[#161b22]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t("title")}
                {totalBadgeCount > 0 && (
                  <span className="ms-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {totalBadgeCount}
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

            <div className="max-h-[480px] overflow-y-auto">
              {/* Account alerts — subscription expiry, downgrade, etc. */}
              <div className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between px-4 pb-1 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {t("accountSection")}
                  </p>
                </div>

                {notificationsLoading && accountNotifications.length === 0 ? (
                  <p className="px-4 pb-3 text-xs text-slate-500 dark:text-slate-400">
                    {t("loading")}
                  </p>
                ) : accountNotifications.length === 0 ? (
                  <p className="px-4 pb-3 text-xs text-slate-500 dark:text-slate-400">
                    {t("noAccountAlerts")}
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 pb-1 dark:divide-slate-800">
                    {accountNotifications.slice(0, 5).map((notification) => {
                      const { title, message } =
                        getNotificationLabel(notification);
                      const isExpiringAlert = isSubscriptionExpiringAlert(
                        notification.type,
                      );
                      const isUrgent =
                        notification.type === "subscription_expiring_1d" ||
                        notification.type === "subscription_expired" ||
                        notification.type === "downgraded_to_free";
                      const Icon = isUrgent
                        ? IoAlertCircleOutline
                        : notification.type === "subscription_created"
                          ? IoSparklesOutline
                          : IoTimeOutline;

                      return (
                        <li
                          key={notification.id}
                          className={`flex items-stretch ${
                            !notification.isRead
                              ? "bg-purple-50/60 dark:bg-purple-500/5"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleAccountNotificationClick(notification)
                            }
                            disabled={!isExpiringAlert}
                            className={`min-w-0 flex-1 px-4 py-3 text-start transition-colors ${
                              isExpiringAlert
                                ? "cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-500/10"
                                : "cursor-default"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                                  isUrgent
                                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                }`}
                              >
                                <Icon className="text-base" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                    {title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="mt-1 size-2 shrink-0 rounded-full bg-purple-500" />
                                  )}
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                                  {message}
                                </p>
                                {isExpiringAlert && (
                                  <p className="mt-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                                    {t("renewNow")}
                                  </p>
                                )}
                                {notification.createdAt && (
                                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                                    <ViewTime data={notification.createdAt} />
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleNotificationArrowClick(notification)
                            }
                            aria-label={
                              isExpiringAlert
                                ? t("goToRenewal")
                                : t("dismissAlert")
                            }
                            title={
                              isExpiringAlert
                                ? t("goToRenewal")
                                : t("dismissAlert")
                            }
                            className={`flex shrink-0 flex-col items-center justify-center border-s border-slate-100 px-3 transition-colors dark:border-slate-800 ${
                              isExpiringAlert
                                ? "text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-500/10"
                                : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            }`}
                          >
                            <IoArrowForwardOutline
                              className={`text-lg ${isRTL ? "rotate-180" : ""}`}
                            />
                            <span className="mt-0.5 text-[9px] font-medium">
                              {isExpiringAlert
                                ? t("goToRenewal")
                                : t("dismissAlert")}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Plan feature tasks — only shows items not yet done */}
              <div className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between px-4 pb-1 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {t("planSection")}
                  </p>
                  {isFreePlan && (
                    <LinkTo
                      href={`/dashboard/${segment}/subscription`}
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] font-semibold text-purple-600 hover:underline dark:text-purple-400"
                    >
                      {t("upgradePlan")}
                    </LinkTo>
                  )}
                </div>

                {pendingTasks.length === 0 ? (
                  /* All tasks done → green success state */
                  <div className="flex items-center gap-2 px-4 pb-3 pt-1">
                    <IoSparklesOutline className="shrink-0 text-base text-emerald-500" />
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {t("allTasksDone")}
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="pb-1">
                      {pendingTasks.map((task) => (
                        <li key={task.id}>
                          <LinkTo
                            href={task.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-amber-50 dark:hover:bg-amber-500/10"
                          >
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                              {task.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                {task.message}
                              </p>
                              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                {task.action}
                              </p>
                            </div>
                            <IoArrowForwardOutline
                              className={`shrink-0 text-sm text-amber-400 ${isRTL ? "rotate-180" : ""}`}
                            />
                          </LinkTo>
                        </li>
                      ))}
                    </ul>

                    {isMenuEmpty && segment && (
                      <div className="px-4 pb-3">
                        <p className="mb-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                          {t("aiImportHint")}
                        </p>
                        <LinkTo
                          href={`/dashboard/${segment}/import`}
                          onClick={() => setIsOpen(false)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                        >
                          <IoSparklesOutline className="text-sm" />
                          {t("aiImportAction")}
                          <IoCameraOutline className="text-sm" />
                        </LinkTo>
                      </div>
                    )}
                  </>
                )}

                {isFreePlan && (
                  <p className="mx-4 mb-3 rounded-lg bg-purple-50 px-2.5 py-2 text-[11px] text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                    {t("freePlanUpgradeHint")}
                  </p>
                )}
              </div>

              {/* Recent individual orders (Pro only) */}
              {!isFreePlan && (
                <>
                  {loading ? null : pendingEntries.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      {t("empty")}
                    </p>
                  ) : (
                    <>
                      <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {t("recentOrders")}
                      </p>
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
                                        {isDelivery
                                          ? t("delivery")
                                          : t("table")}
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
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer — order summary buttons (Pro only) */}
            {!isFreePlan && (
              <div className="border-t border-slate-100 dark:border-slate-800">
                {loading ? (
                  <div className="flex items-center justify-center py-4 text-sm text-slate-500 dark:text-slate-400">
                    {t("loading")}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 rtl:divide-x-reverse">
                    {/* Table orders button */}
                    <button
                      onClick={() =>
                        handleNavClick(`/dashboard/${segment}/orders`)
                      }
                      className="flex flex-col items-center gap-1.5 px-3 py-3 transition-colors hover:bg-sky-50 dark:hover:bg-sky-500/10"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                          <MdOutlineTableBar className="text-sm" />
                        </div>
                        {pendingTableCount > 0 && (
                          <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                            {pendingTableCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        {t("tableOrders")}
                      </p>
                    </button>

                    {/* Online/delivery orders button */}
                    <button
                      onClick={() =>
                        handleNavClick(`/dashboard/${segment}/delivery-orders`)
                      }
                      className="flex flex-col items-center gap-1.5 px-3 py-3 transition-colors hover:bg-violet-50 dark:hover:bg-violet-500/10"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                          <IoCarOutline className="text-sm" />
                        </div>
                        {pendingDeliveryCount > 0 && (
                          <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                            {pendingDeliveryCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        {t("onlineOrders")}
                      </p>
                    </button>
                  </div>
                )}
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
        {totalBadgeCount > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {totalBadgeCount > 99 ? "99+" : totalBadgeCount}
          </span>
        )}
      </button>
      {dropdown}
    </>
  );
}
