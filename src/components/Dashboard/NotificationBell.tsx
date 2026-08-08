"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { cn } from "@/lib/cn";
import { Badge, Button, ButtonLink, CountBadge } from "@/components/ui";
import { useIsClient } from "@/components/ui/useDialog";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { isDeliveryEntry, resolveEntryTime } from "@/lib/tableOrders";
import { usePendingOrders } from "@/components/Dashboard/PendingOrdersProvider";
import { useRouter } from "@/i18n/navigation";
import {
  axiosGet,
  axiosPost,
  axiosPatch,
  axiosDelete,
} from "@/shared/axiosCall";
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
const SEEN_TASKS_STORAGE_KEY = "ensmenu:seen-notification-tasks";

/** Divides the panel into its three sources without adding another border. */
function SectionEyebrow({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 pb-1 pt-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-fg-subtle">
        {children}
      </p>
      {action}
    </div>
  );
}

function readSeenTaskKeys(): string[] {
  try {
    const raw = window.localStorage.getItem(SEEN_TASKS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed)
      ? parsed.filter((key): key is string => typeof key === "string")
      : [];
  } catch {
    return [];
  }
}

export default function NotificationBell({ segment }: NotificationBellProps) {
  const locale = useLocale();
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const isRTL = locale === "ar";
  const router = useRouter();

  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = isFreePlanUser(userData);
  const menu = useAppSelector((s) => s.menuData.menu);
  const currency = useAppSelector((s) => s.menuData.menu?.currency ?? "");

  const {
    pendingEntries,
    pendingTableCount,
    pendingDeliveryCount,
    unseenTableCount,
    unseenDeliveryCount,
    markOrdersSeen,
    loading,
  } = usePendingOrders();

  const [accountNotifications, setAccountNotifications] = useState<
    UserNotification[]
  >([]);
  const [unreadAccountCount, setUnreadAccountCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const mounted = useIsClient();
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /** Resolves with the unread count so callers can skip a needless read-all. */
  const fetchAccountNotifications = useCallback(async (): Promise<number> => {
    setNotificationsLoading(true);
    const res = await axiosGet<UserNotificationsResponse>(
      "/user/notifications",
      locale,
      undefined,
      { limit: 20 },
    );
    setNotificationsLoading(false);
    if (res.status && res.data) {
      const unread = Number(res.data.unreadCount ?? 0);
      setAccountNotifications(res.data.notifications ?? []);
      setUnreadAccountCount(unread);
      return unread;
    }
    return 0;
  }, [locale]);

  useEffect(() => {
    void fetchAccountNotifications();
  }, [fetchAccountNotifications]);

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
          href: "/dashboard/staff",
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

  // Tasks belong to a single menu, so they are tracked per menu id.
  const tracksTasks = Boolean(menu && segment);
  const taskKeys = pendingTasks.map((task) => `${menu?.id ?? ""}:${task.id}`);
  const taskKeysJoined = taskKeys.join("|");

  const [seenTaskKeys, setSeenTaskKeys] = useState<string[]>([]);
  const [seenTasksHydrated, setSeenTasksHydrated] = useState(false);

  useEffect(() => {
    setSeenTaskKeys(readSeenTaskKeys());
    setSeenTasksHydrated(true);
  }, []);

  // Drop keys of tasks the user has since completed, so the badge speaks up
  // again if the same task ever comes back.
  useEffect(() => {
    if (!seenTasksHydrated || !tracksTasks) return;
    const stillPending = new Set(
      taskKeysJoined ? taskKeysJoined.split("|") : [],
    );
    const prefix = `${menu?.id ?? ""}:`;
    setSeenTaskKeys((prev) => {
      const kept = prev.filter(
        (key) => !key.startsWith(prefix) || stillPending.has(key),
      );
      return kept.length === prev.length ? prev : kept;
    });
  }, [seenTasksHydrated, tracksTasks, taskKeysJoined, menu?.id]);

  useEffect(() => {
    if (!seenTasksHydrated) return;
    try {
      window.localStorage.setItem(
        SEEN_TASKS_STORAGE_KEY,
        JSON.stringify(seenTaskKeys),
      );
    } catch {
      /* storage unavailable — the badge just returns on reload */
    }
  }, [seenTasksHydrated, seenTaskKeys]);

  const markTasksSeen = useCallback(() => {
    const keys = taskKeysJoined ? taskKeysJoined.split("|") : [];
    if (keys.length === 0) return;
    setSeenTaskKeys((prev) => {
      const merged = new Set(prev);
      keys.forEach((key) => merged.add(key));
      if (merged.size === prev.length) return prev;
      return [...merged];
    });
  }, [taskKeysJoined]);

  const seenTaskSet = useMemo(() => new Set(seenTaskKeys), [seenTaskKeys]);
  const unseenTaskCount = seenTasksHydrated
    ? taskKeys.filter((key) => !seenTaskSet.has(key)).length
    : 0;

  // The bell counts only what the user has not opened the panel on yet, while
  // the panel header keeps showing everything it lists.
  const unseenBadgeCount =
    unseenTableCount +
    unseenDeliveryCount +
    unseenTaskCount +
    unreadAccountCount;
  const totalListedCount =
    pendingEntries.length + pendingTasks.length + accountNotifications.length;

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

  /**
   * Clears the unread counter without flipping the local `isRead` flags, so the
   * highlight on new alerts survives while the panel the user just opened stays
   * on screen.
   */
  const markAllAccountRead = useCallback(async () => {
    const res = await axiosPost<Record<string, never>, { success?: boolean }>(
      "/user/notifications/read-all",
      locale,
      {},
    );
    if (res.status) setUnreadAccountCount(0);
  }, [locale]);

  // Opening the panel means the user has seen everything in it, so the bell
  // badge drops to zero until something new arrives.
  useEffect(() => {
    if (!isOpen) return;
    markOrdersSeen();
    markTasksSeen();
  }, [isOpen, markOrdersSeen, markTasksSeen]);

  // Read-all runs after the refetch so the response cannot revive the counter.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    void (async () => {
      const unread = await fetchAccountNotifications();
      if (cancelled || unread === 0) return;
      await markAllAccountRead();
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, fetchAccountNotifications, markAllAccountRead]);

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

  // Orders live on the account-level pages, so the link carries the order's
  // own menu as a filter instead of relying on the menu currently open.
  const handleOrderClick = useCallback(
    (entry: CallEntry) => {
      const path = isDeliveryEntry(entry)
        ? "/dashboard/delivery-orders"
        : "/dashboard/orders";
      const menuFilter = entry.menuId ? `&menuId=${entry.menuId}` : "";
      router.push(`${path}?entry=${entry.id}${menuFilter}`);
      setIsOpen(false);
    },
    [router],
  );

  const handleNavClick = useCallback(
    (path: string) => {
      router.push(path);
      setIsOpen(false);
    },
    [router],
  );

  const dropdown =
    isOpen && mounted
      ? createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            role="dialog"
            aria-label={t("title")}
            className="z-[9999] w-[22rem] overflow-hidden rounded-lg border border-line bg-raised shadow-lg motion-safe:animate-[ui-pop-in_140ms_cubic-bezier(0.16,1,0.3,1)]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-fg">
                {t("title")}
                <CountBadge count={totalListedCount} tone="neutral" />
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                iconOnly
                onClick={() => setIsOpen(false)}
                aria-label={tCommon("close")}
              >
                <IoCloseOutline className="size-4" />
              </Button>
            </div>

            <div className="max-h-[26rem] overflow-y-auto [scrollbar-width:thin]">
              {/* Account alerts — subscription expiry, downgrade, etc. */}
              <div className="border-b border-line">
                <SectionEyebrow>{t("accountSection")}</SectionEyebrow>

                {notificationsLoading && accountNotifications.length === 0 ? (
                  <p className="px-3 pb-2 text-xs text-fg-subtle">
                    {t("loading")}
                  </p>
                ) : accountNotifications.length === 0 ? (
                  <p className="px-3 pb-2 text-xs text-fg-subtle">
                    {t("noAccountAlerts")}
                  </p>
                ) : (
                  <ul className="divide-y divide-line pb-1">
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
                          className={cn(
                            "flex items-stretch",
                            !notification.isRead && "bg-brand-soft/40",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleAccountNotificationClick(notification)
                            }
                            disabled={!isExpiringAlert}
                            className={cn(
                              "min-w-0 flex-1 px-3 py-2.5 text-start row-settle",
                              isExpiringAlert
                                ? "cursor-pointer hover:bg-surface-2"
                                : "cursor-default",
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <Icon
                                className={cn(
                                  "mt-px size-4 shrink-0",
                                  isUrgent ? "text-warning" : "text-fg-subtle",
                                )}
                                aria-hidden
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-semibold text-fg">
                                    {title}
                                  </p>
                                  {!notification.isRead && (
                                    <span
                                      className="mt-1 size-1.5 shrink-0 rounded-full bg-brand"
                                      aria-hidden
                                    />
                                  )}
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-[11px] text-fg-muted">
                                  {message}
                                </p>
                                {isExpiringAlert && (
                                  <p className="mt-1 text-[11px] font-medium text-brand">
                                    {t("renewNow")}
                                  </p>
                                )}
                                {notification.createdAt && (
                                  <p className="mt-1 text-[11px] text-fg-subtle">
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
                            className={cn(
                              "flex w-9 shrink-0 items-center justify-center border-s border-line row-settle",
                              isExpiringAlert
                                ? "text-brand hover:bg-surface-2"
                                : "text-fg-subtle hover:bg-surface-2 hover:text-fg",
                            )}
                          >
                            <IoArrowForwardOutline
                              className={cn("size-4", isRTL && "rotate-180")}
                              aria-hidden
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Plan feature tasks — only shows items not yet done */}
              <div className="border-b border-line">
                <SectionEyebrow
                  action={
                    isFreePlan ? (
                      <LinkTo
                        href="/dashboard/subscription"
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-medium text-brand hover:underline"
                      >
                        {t("upgradePlan")}
                      </LinkTo>
                    ) : null
                  }
                >
                  {t("planSection")}
                </SectionEyebrow>

                {pendingTasks.length === 0 ? (
                  <p className="flex items-center gap-1.5 px-3 pb-2 text-xs text-success">
                    <IoSparklesOutline
                      className="size-3.5 shrink-0"
                      aria-hidden
                    />
                    {t("allTasksDone")}
                  </p>
                ) : (
                  <>
                    <ul className="pb-1">
                      {pendingTasks.map((task) => (
                        <li key={task.id}>
                          <LinkTo
                            href={task.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 row-settle hover:bg-surface-2"
                          >
                            <span
                              className="shrink-0 text-fg-subtle"
                              aria-hidden
                            >
                              {task.icon}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-medium text-fg">
                                {task.message}
                              </span>
                              <span className="block text-[11px] text-fg-muted">
                                {task.action}
                              </span>
                            </span>
                            <IoArrowForwardOutline
                              className={cn(
                                "size-3.5 shrink-0 text-fg-subtle",
                                isRTL && "rotate-180",
                              )}
                              aria-hidden
                            />
                          </LinkTo>
                        </li>
                      ))}
                    </ul>

                    {isMenuEmpty && segment && (
                      <div className="px-3 pb-2.5">
                        <p className="mb-1.5 text-[11px] text-fg-subtle">
                          {t("aiImportHint")}
                        </p>
                        <ButtonLink
                          href={`/dashboard/${segment}/import`}
                          onClick={() => setIsOpen(false)}
                          fullWidth
                          startIcon={<IoSparklesOutline className="size-3.5" />}
                        >
                          {t("aiImportAction")}
                        </ButtonLink>
                      </div>
                    )}
                  </>
                )}

                {isFreePlan && (
                  <p className="mx-3 mb-2.5 rounded-md bg-surface-2 px-2 py-1.5 text-[11px] text-fg-muted">
                    {t("freePlanUpgradeHint")}
                  </p>
                )}
              </div>

              {/* Recent individual orders (Pro only) */}
              {!isFreePlan && (
                <>
                  {loading ? null : pendingEntries.length === 0 ? (
                    <p className="py-5 text-center text-xs text-fg-subtle">
                      {t("empty")}
                    </p>
                  ) : (
                    <>
                      <SectionEyebrow>{t("recentOrders")}</SectionEyebrow>
                      <ul className="divide-y divide-line">
                        {pendingEntries.slice(0, MAX_VISIBLE).map((entry) => {
                          const isDelivery = isDeliveryEntry(entry);
                          const time = resolveEntryTime(entry.actionDetails);
                          return (
                            <li key={entry.id}>
                              <button
                                type="button"
                                onClick={() => handleOrderClick(entry)}
                                className="w-full px-3 py-2.5 text-start row-settle hover:bg-surface-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-fg">
                                      <span data-numeric>
                                        {t("order")} #{entry.orderId}
                                      </span>
                                      <Badge
                                        tone={isDelivery ? "brand" : "info"}
                                      >
                                        {isDelivery
                                          ? t("delivery")
                                          : t("table")}
                                      </Badge>
                                    </p>
                                    {entry.customerName && (
                                      <p className="mt-0.5 truncate text-xs text-fg-muted">
                                        {entry.customerName}
                                      </p>
                                    )}
                                    {!isDelivery && entry.tableNumber && (
                                      <p className="mt-0.5 text-xs text-fg-muted">
                                        {t("tableNo")} {entry.tableNumber}
                                      </p>
                                    )}
                                  </div>
                                  <div className="shrink-0 text-end">
                                    {typeof entry.totalPrice === "number" && (
                                      <p
                                        className="text-xs font-semibold text-fg"
                                        data-numeric
                                      >
                                        {entry.totalPrice} {currency}
                                      </p>
                                    )}
                                    {time && (
                                      <p className="mt-0.5 text-[11px] text-fg-subtle">
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
              <div className="border-t border-line">
                {loading ? (
                  <div className="flex items-center justify-center py-3 text-xs text-fg-subtle">
                    {t("loading")}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 divide-x divide-line rtl:divide-x-reverse">
                    <button
                      type="button"
                      onClick={() => handleNavClick("/dashboard/orders")}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-fg-muted row-settle hover:bg-surface-2 hover:text-fg"
                    >
                      <MdOutlineTableBar
                        className="size-4 shrink-0"
                        aria-hidden
                      />
                      {t("tableOrders")}
                      <CountBadge count={pendingTableCount} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleNavClick("/dashboard/delivery-orders")
                      }
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-fg-muted row-settle hover:bg-surface-2 hover:text-fg"
                    >
                      <IoCarOutline className="size-4 shrink-0" aria-hidden />
                      {t("onlineOrders")}
                      <CountBadge count={pendingDeliveryCount} />
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
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="sm"
        iconOnly
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        aria-label={t("label")}
        aria-expanded={isOpen}
        className="relative"
      >
        <IoNotificationsOutline className="size-4" />
        {unseenBadgeCount > 0 && (
          <CountBadge
            count={unseenBadgeCount}
            tone="danger"
            className="absolute -end-0.5 -top-0.5"
          />
        )}
      </Button>
      {dropdown}
    </>
  );
}
