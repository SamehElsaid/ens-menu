"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { axiosGet, axiosDelete, axiosPatch } from "@/shared/axiosCall";
import LinkTo from "@/components/Global/LinkTo";
import CreateMenuModal from "@/components/Dashboard/CreateMenuModal";
import CopyMenuModal from "@/components/Dashboard/CopyMenuModal";
import CreateMenuGroupModal from "@/components/Dashboard/CreateMenuGroupModal";
import AddMenuToGroupModal, {
  ManageMenuGroupModal,
} from "@/components/Dashboard/AddMenuToGroupModal";
import RemoveMenuFromGroupConfirm from "@/components/Dashboard/RemoveMenuFromGroupConfirm";
import ExtraMenusPurchaseModal from "@/components/Dashboard/ExtraMenusPurchaseModal";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { pushFirstMenuCreatedEvent } from "@/shared/gtmEvents";
import { toast } from "react-toastify";
import { Menu, MenusResponse } from "@/types/Menu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { shouldShowAiImportOnboarding } from "@/lib/aiImportOnboarding";
import { normalizeMenuFromApi } from "@/lib/normalizeMenuFromApi";
import { Subscription, SubscriptionResponse } from "@/types/Subscription";
import {
  IoRestaurant,
  IoAddCircleOutline,
  IoGlobeOutline,
  IoEllipseSharp,
  IoStorefrontOutline,
  IoSettingsOutline,
  IoEyeOutline,
  IoOpenOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoCloseOutline,
  IoRocketOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoCalendarOutline,
  IoGitNetworkOutline,
} from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import MenusMobileList from "@/components/Dashboard/mobile/MenusMobileList";
import MenuDashboardCard from "@/components/Dashboard/MenuDashboardCard";
import MenuDeliveryGroupPanel from "@/components/Dashboard/MenuDeliveryGroupPanel";
import {
  buildMenuDisplayGroups,
  resolveMenuGroupMeta,
  extractMenuGroupsFromMenus,
  menusAvailableToJoinGroup,
  type MenuGroupSummary,
} from "@/lib/menuDeliveryGroups";
import StaffMenusList from "@/components/Dashboard/StaffMenusList";
import { useAuthorization } from "@/hooks/useAuthorization";
import { getMenuDashboardRef, menuDashboardPath } from "@/lib/menuDashboardPath";
import {
  publicMenuLinkUrl,
  resolvePublicMenuSlug,
} from "@/lib/publicMenuUrl";
import {
  getEffectiveMaxMenus,
  isProSubscription,
} from "@/lib/subscriptionMenus";

export default function DashboardPage() {
  const { isStaff, isResolved } = useAuthorization();

  // Mounting the owner view before the session is known would fire the
  // owner-only /menus request for a staff member and get a 403.
  if (!isResolved) return <DashboardRootLoader />;
  // Staff see only their granted menus and none of the owner-only actions.
  if (isStaff) return <StaffMenusList />;
  return <OwnerMenusPage />;
}

function DashboardRootLoader() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 sm:min-h-[60vh]">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  );
}

function OwnerMenusPage() {
  const t = useTranslations("Menus");
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authData = useAppSelector((state) => state.auth.data);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [addToGroupTarget, setAddToGroupTarget] = useState<Menu | null>(null);
  const [removeFromGroupTarget, setRemoveFromGroupTarget] =
    useState<Menu | null>(null);
  const [manageGroupTarget, setManageGroupTarget] =
    useState<MenuGroupSummary | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showExtraMenusModal, setShowExtraMenusModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [copyTarget, setCopyTarget] = useState<Menu | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(0);
  const [switchMenuTarget, setSwitchMenuTarget] = useState<Menu | null>(null);
  const [isSwitchingMenu, setIsSwitchingMenu] = useState(false);

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await axiosGet<MenusResponse | Menu[]>(
        "/menus",
        locale,
        undefined,
        { locale },
      );

      if (result.status && result.data) {
        const menusList = Array.isArray(result.data)
          ? result.data
          : (result.data.menus ?? []);
        setMenus(
          menusList
            .map((item) => normalizeMenuFromApi(item))
            .filter((item): item is Menu => item != null),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [locale]);

  const fetchSubscription = useCallback(async () => {
    try {
      setSubscriptionLoading(true);
      const result = await axiosGet<SubscriptionResponse>(
        "/user/subscription",
        locale,
      );
      if (result.status && result.data?.subscription) {
        setSubscription(result.data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [locale]);

  const resolveSubscription = useCallback(async (): Promise<Subscription | null> => {
    if (subscription != null || !subscriptionLoading) {
      return subscription;
    }
    try {
      const result = await axiosGet<SubscriptionResponse>(
        "/user/subscription",
        locale,
      );
      if (result.status && result.data?.subscription) {
        setSubscription(result.data.subscription);
        return result.data.subscription;
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
    return subscription;
  }, [subscription, subscriptionLoading, locale]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus, refreshing]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);


  useEffect(() => {
    if (!deleteTarget) setDeleteConfirmText("");
  }, [deleteTarget]);

  const handleCreateClick = async () => {
    const sub = await resolveSubscription();
    const effectiveMax = getEffectiveMaxMenus(sub);
    if (menus.length >= effectiveMax) {
      if (isProSubscription(sub)) {
        setShowExtraMenusModal(true);
      } else {
        setShowLimitModal(true);
      }
    } else {
      setShowCreateModal(true);
    }
  };

  const handleMenuCreated = (newMenu?: Menu) => {
    const isFirstMenu = menus.length === 0;

    if (isFirstMenu) {
      pushFirstMenuCreatedEvent();
    }

    if (newMenu) {
      const normalized = normalizeMenuFromApi(newMenu) ?? newMenu;
      setMenus((prev) => [...prev, normalized]);
      const nextPath = shouldShowAiImportOnboarding(authData)
        ? menuDashboardPath(normalized, "import")
        : menuDashboardPath(normalized);
      router.push(nextPath);
    } else {
      fetchMenus();
    }
  };

  const handleCopyClick = async (menu: Menu) => {
    const sub = await resolveSubscription();
    const effectiveMax = getEffectiveMaxMenus(sub);
    if (menus.length >= effectiveMax) {
      if (isProSubscription(sub)) {
        setShowExtraMenusModal(true);
      } else {
        setShowLimitModal(true);
      }
      return;
    }
    setCopyTarget(menu);
  };

  const handleMenuCopied = (newMenu: Menu) => {
    const normalized = normalizeMenuFromApi(newMenu) ?? newMenu;
    setMenus((prev) => [normalized, ...prev]);
    setCopyTarget(null);
    router.push(menuDashboardPath(normalized));
  };

  const handleDeleteMenu = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const result = await axiosDelete<{ message?: string }>(
        `/menus/${deleteTarget.id}`,
        locale,
      );

      if (result.status) {
        toast.success(t("deleteSuccess"));
        setMenus((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error(t("deleteError"));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getMenuName = (menu: Menu) => {
    return locale === "ar"
      ? menu.nameAr || menu.nameEn
      : menu.nameEn || menu.nameAr;
  };

  const getMenuDescription = (menu: Menu) => {
    return locale === "ar"
      ? menu.descriptionAr || menu.descriptionEn
      : menu.descriptionEn || menu.descriptionAr;
  };

  const getMenuPublicUrl = (menu: Menu) =>
    publicMenuLinkUrl(resolvePublicMenuSlug(menu.slug, menu.id));

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const menuDisplayGroups = useMemo(
    () => buildMenuDisplayGroups(menus),
    [menus],
  );

  const firstManageMenuId = useMemo(() => {
    for (const group of menuDisplayGroups) {
      if (group.type === "group") return group.menus[0]?.id ?? null;
      return group.menu.id;
    }
    return null;
  }, [menuDisplayGroups]);

  const showCreateGroupButton = menus.length >= 2;

  const menuGroups = useMemo(
    () => extractMenuGroupsFromMenus(menus),
    [menus],
  );
  const hasUngroupedMenus = menusAvailableToJoinGroup(menus).length > 0;
  const canAddToExistingGroup = menuGroups.length > 0 && hasUngroupedMenus;

  const handleCreateGroupClick = () => {
    if (!isProSubscription(subscription)) {
      setShowLimitModal(true);
      return;
    }
    setShowCreateGroupModal(true);
  };

  const handleAddToGroupClick = (menu: Menu) => {
    if (!isProSubscription(subscription)) {
      setShowLimitModal(true);
      return;
    }
    setAddToGroupTarget(menu);
  };

  const handleManageGroupClick = (group: MenuGroupSummary) => {
    if (!isProSubscription(subscription)) {
      setShowLimitModal(true);
      return;
    }
    setManageGroupTarget(group);
  };

  const handleRemoveFromGroupClick = (menu: Menu) => {
    if (!isProSubscription(subscription)) {
      setShowLimitModal(true);
      return;
    }
    setRemoveFromGroupTarget(menu);
  };

  const refreshMenus = () => setRefreshing((n) => n + 1);

  const cardLabels = useMemo(
    () => ({
      active: t("menuCard.active"),
      paused: t("menuCard.paused"),
      pause: t("menuCard.pause"),
      play: t("menuCard.play"),
      deleteMenu: t("deleteMenu"),
      copyMenu: t("menuCard.copyMenu"),
      createdAt: t("menuCard.createdAt"),
      updatedAt: t("menuCard.updatedAt"),
      manage: t("menuCard.manage"),
      preview: t("menuCard.preview"),
      addToGroup: canAddToExistingGroup ? t("menuCard.addToGroup") : undefined,
      removeFromGroup: t("menuCard.removeFromGroup"),
    }),
    [t, canAddToExistingGroup],
  );

  const handleToggleActive = async (menu: Menu) => {
    const effectiveMax = getEffectiveMaxMenus(subscription);
    const activeCount = menus.filter((m) => m.isActive).length;

    // تشغيل منيو بينما عدد النشطة بالفعل = الحد → عرض مودال "المنيو الآخر هيتوقف، جدد الاشتراك"
    if (!menu.isActive && activeCount >= effectiveMax) {
      const sub = await resolveSubscription();
      const resolvedMax = getEffectiveMaxMenus(sub);
      const resolvedActiveCount = menus.filter((m) => m.isActive).length;
      if (resolvedActiveCount >= resolvedMax) {
        if (isProSubscription(sub)) {
          setShowExtraMenusModal(true);
        } else {
          setSwitchMenuTarget(menu);
        }
        return;
      }
    }

    try {
      setTogglingId(menu.id);
      const result = await axiosPatch<{ isActive: boolean }, Menu>(
        `/menus/${menu.id}`,
        locale,
        { isActive: !menu.isActive as boolean },
      );
      if (result.status && result.data) {
        setMenus((prev) =>
          prev.map((m) =>
            m.id === menu.id ? { ...m, isActive: !m.isActive } : m,
          ),
        );
        toast.success(t("toggleSuccess"));
      } else {
        toast.error(t("toggleError"));
      }
    } catch (error) {
      console.error("Error toggling menu:", error);
      toast.error(t("toggleError"));
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmSwitchMenu = async () => {
    if (!switchMenuTarget) return;
    const otherActive = menus.filter(
      (m) => m.isActive && m.id !== switchMenuTarget.id,
    );
    try {
      setIsSwitchingMenu(true);
      for (const m of otherActive) {
        await axiosPatch<{ isActive: boolean }, { message?: string }>(
          `/menus/${m.id}`,
          locale,
          { isActive: false },
        );
      }
      const result = await axiosPatch<{ isActive: boolean }, Menu>(
        `/menus/${switchMenuTarget.id}`,
        locale,
        { isActive: true },
      );
      if (result.status) {
        setMenus((prev) =>
          prev.map((m) => ({
            ...m,
            isActive:
              m.id === switchMenuTarget.id
                ? true
                : otherActive.some((o) => o.id === m.id)
                  ? false
                  : m.isActive,
          })),
        );
        toast.success(t("toggleSuccess"));
        setSwitchMenuTarget(null);
      } else {
        toast.error(t("toggleError"));
      }
    } catch (error) {
      console.error("Error switching active menu:", error);
      toast.error(t("toggleError"));
    } finally {
      setIsSwitchingMenu(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 sm:min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">{t("loading")}</p>
      </div>
    );
  }

  // Empty State
  if (menus.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 ">
          <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center">
            <IoStorefrontOutline className="text-primary text-6xl" />
          </div>
          <div className="text-center max-w-md">
            <PageTitleWithHelp className="justify-center mb-2">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {t("noMenus")}
              </h2>
            </PageTitleWithHelp>
            <p className="text-slate-500 mb-8">{t("noMenusDescription")}</p>
            <button
              id="onboarding-create-menu"
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-primary to-primary/80 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <IoAddCircleOutline className="text-2xl" />
              {t("createFirstMenu")}
            </button>
          </div>
        </div>

        {showCreateModal && (
          <CreateMenuModal
            onClose={() => setShowCreateModal(false)}
            onMenuCreated={handleMenuCreated}
            onRefresh={() => setRefreshing(refreshing + 1)}
          />
        )}

        {/* Limit Reached Modal */}
        {showLimitModal && (
          <LimitReachedModal
            t={t}
            subscription={subscription}
            currentCount={menus.length}
            locale={locale}
            upgradeMenuRef={getMenuDashboardRef(menus[0])}
            onClose={() => setShowLimitModal(false)}
          />
        )}

        {showExtraMenusModal && (
          <ExtraMenusPurchaseModal
            subscription={subscription}
            currentCount={menus.length}
            onClose={() => setShowExtraMenusModal(false)}
          />
        )}
      </>
    );
  }

  // Menus List
  return (
    <>
      {/* Page Header */}
      <div className="menus-page-header mb-5 flex flex-col gap-3 text-start sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <PageTitleWithHelp>
            <h1 className="text-xl font-bold text-slate-800 sm:text-3xl dark:text-slate-100">
              {t("title")}
            </h1>
          </PageTitleWithHelp>
          <p className="mt-0.5 text-sm text-slate-500 sm:mt-1 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex w-full max-w-[320px] flex-col gap-2 sm:w-auto sm:flex-row sm:max-w-none">
          {showCreateGroupButton && (
            <button
              type="button"
              onClick={handleCreateGroupClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-600/70 bg-linear-to-r from-teal-50 to-emerald-50 px-4 py-2.5 text-sm font-bold text-teal-900 shadow-sm transition hover:border-teal-600 hover:from-teal-100 hover:to-emerald-100 active:scale-[0.98] sm:w-auto sm:px-5 sm:py-3 sm:text-base dark:border-teal-500/50 dark:from-teal-950/50 dark:to-emerald-950/30 dark:text-teal-100 dark:hover:from-teal-900/50"
            >
              <IoGitNetworkOutline className="text-lg sm:text-xl" />
              {t("createGroup")}
            </button>
          )}
          <button
            id="onboarding-create-menu"
            onClick={handleCreateClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-primary/80 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98] sm:w-auto sm:px-6 sm:py-3 sm:text-base"
          >
            <IoAddCircleOutline className="text-lg sm:text-xl" />
            {t("createMenu")}
          </button>
        </div>
      </div>

      <MenusMobileList
        menus={menus}
        locale={locale}
        getMenuName={getMenuName}
        getMenuDescription={getMenuDescription}
        formatDate={formatDate}
        togglingId={togglingId}
        getMenuPublicUrl={getMenuPublicUrl}
        getDashboardPath={(menu) => menuDashboardPath(menu)}
        onToggleActive={handleToggleActive}
        onDelete={setDeleteTarget}
        onCopy={handleCopyClick}
        onAddToGroup={canAddToExistingGroup ? handleAddToGroupClick : undefined}
        onRemoveFromGroup={handleRemoveFromGroupClick}
        onManageGroup={handleManageGroupClick}
      />

      {/* Menus Grid — desktop/tablet */}
      <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-1 xl:grid-cols-2">
        {menuDisplayGroups.map((group) => {
          if (group.type === "group") {
            return (
              <MenuDeliveryGroupPanel
                key={`menu-group-${group.groupId}`}
                groupName={group.groupName}
                memberCount={group.menus.length}
                layout="desktop"
                onManageGroup={() =>
                  handleManageGroupClick({
                    id: group.groupId,
                    name: group.groupName,
                    menuIds: group.menus.map((m) => m.id),
                  })
                }
                menuCards={group.menus.map((menu) => (
                      <MenuDashboardCard
                        key={menu.id}
                        menu={menu}
                        menuName={getMenuName(menu)}
                        description={getMenuDescription(menu)}
                        formatDate={formatDate}
                        togglingId={togglingId}
                        menuPublicUrl={getMenuPublicUrl(menu)}
                        groupMeta={resolveMenuGroupMeta(menu)}
                        manageLinkId={
                          menu.id === firstManageMenuId
                            ? "onboarding-manage-menu"
                            : undefined
                        }
                        isNested
                        labels={cardLabels}
                        onToggleActive={handleToggleActive}
                        onDelete={setDeleteTarget}
                        onCopy={handleCopyClick}
                        onAddToGroup={
                          canAddToExistingGroup
                            ? handleAddToGroupClick
                            : undefined
                        }
                        onRemoveFromGroup={handleRemoveFromGroupClick}
                      />
                    ))}
              />
            );
          }

          const menu = group.menu;

          return (
            <MenuDashboardCard
              key={menu.id}
              menu={menu}
              menuName={getMenuName(menu)}
              description={getMenuDescription(menu)}
              formatDate={formatDate}
              togglingId={togglingId}
              menuPublicUrl={getMenuPublicUrl(menu)}
              groupMeta={resolveMenuGroupMeta(menu)}
              manageLinkId={
                menu.id === firstManageMenuId ? "onboarding-manage-menu" : undefined
              }
              labels={cardLabels}
              onToggleActive={handleToggleActive}
              onDelete={setDeleteTarget}
              onCopy={handleCopyClick}
              onAddToGroup={
                canAddToExistingGroup ? handleAddToGroupClick : undefined
              }
              onRemoveFromGroup={handleRemoveFromGroupClick}
            />
          );
        })}
      </div>

      {/* Create Menu Modal */}
      {showCreateModal && (
        <CreateMenuModal
          onClose={() => setShowCreateModal(false)}
          onMenuCreated={handleMenuCreated}
          onRefresh={() => setRefreshing(refreshing + 1)}
        />
      )}

      {copyTarget && (
        <CopyMenuModal
          menu={copyTarget}
          menuName={getMenuName(copyTarget)}
          onClose={() => setCopyTarget(null)}
          onCopied={handleMenuCopied}
        />
      )}

      {showCreateGroupModal && (
        <CreateMenuGroupModal
          menus={menus}
          getMenuName={getMenuName}
          onClose={() => setShowCreateGroupModal(false)}
          onCreated={refreshMenus}
        />
      )}

      {addToGroupTarget && menuGroups.length > 0 && (
        <AddMenuToGroupModal
          menu={addToGroupTarget}
          groups={menuGroups}
          getMenuName={getMenuName}
          onClose={() => setAddToGroupTarget(null)}
          onSaved={refreshMenus}
        />
      )}

      {manageGroupTarget && (
        <ManageMenuGroupModal
          group={manageGroupTarget}
          menus={menus}
          getMenuName={getMenuName}
          onClose={() => setManageGroupTarget(null)}
          onSaved={refreshMenus}
        />
      )}

      {removeFromGroupTarget && (
        <RemoveMenuFromGroupConfirm
          menu={removeFromGroupTarget}
          menus={menus}
          getMenuName={getMenuName}
          onClose={() => setRemoveFromGroupTarget(null)}
          onRemoved={refreshMenus}
        />
      )}

      {/* Limit Reached Modal */}
      {showLimitModal && (
        <LimitReachedModal
          t={t}
          subscription={subscription}
          currentCount={menus.length}
          locale={locale}
          upgradeMenuRef={getMenuDashboardRef(menus[0])}
          onClose={() => setShowLimitModal(false)}
        />
      )}

      {showExtraMenusModal && (
        <ExtraMenusPurchaseModal
          subscription={subscription}
          currentCount={menus.length}
          onClose={() => setShowExtraMenusModal(false)}
        />
      )}

      {/* Switch Menu (Free limit) Modal */}
      {switchMenuTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-700/50">
            {/* Header with close */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <IoWarningOutline className="text-amber-600 dark:text-amber-400 text-xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {t("switchMenuLimitTitle")}
                </h3>
              </div>
              <button
                onClick={() => !isSwitchingMenu && setSwitchMenuTarget(null)}
                disabled={isSwitchingMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 disabled:opacity-50"
                aria-label={t("close")}
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {t("switchMenuLimitMessage")}
              </p>
              {switchMenuTarget && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {t("selectedMenu")}
                  </p>
                  <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                    {getMenuName(switchMenuTarget)}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30 sm:flex-row sm:justify-end">
              <button
                onClick={() => setSwitchMenuTarget(null)}
                disabled={isSwitchingMenu}
                className="order-2 sm:order-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 sm:w-auto"
              >
                {t("cancel")}
              </button>
              <LinkTo
                href={menuDashboardPath(switchMenuTarget, "personal")}
                className="order-1 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg sm:order-2 sm:w-auto"
              >
                <IoRocketOutline className="text-lg" />
                {t("upgradePlan")}
              </LinkTo>
              <button
                onClick={handleConfirmSwitchMenu}
                disabled={isSwitchingMenu}
                className="order-0 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-60 sm:order-3 sm:w-auto"
              >
                {isSwitchingMenu ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{t("switching")}</span>
                  </>
                ) : (
                  t("switchMenuConfirm")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <IoTrashOutline className="text-red-500 text-3xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {t("deleteConfirmTitle")}
                </h3>
                <p className="text-slate-500 text-sm mb-1 dark:text-slate-300">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {getMenuName(deleteTarget)}
                  </span>
                </p>
                <p className="text-slate-500 text-sm dark:text-slate-300">
                  {t("deleteConfirm")}
                </p>
                <p className="text-sm font-medium text-slate-700 mt-3 mb-1 dark:text-slate-300">
                  {t("typeMenuNameToConfirm")}
                </p>
                <input
                  id="delete-confirm-input"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={getMenuName(deleteTarget)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-red-300 focus:ring-2 focus:ring-red-100 focus:outline-none"
                  dir={locale === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteConfirmText("");
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleDeleteMenu}
                  disabled={
                    isDeleting ||
                    deleteConfirmText.trim() !== getMenuName(deleteTarget)
                  }
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin dark:border-slate-00"></div>
                      {t("deleting")}
                    </>
                  ) : (
                    <>
                      <IoTrashOutline className="text-base dark:text-slate-400" />
                      {t("confirm")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// ─── Limit Reached Modal ────────────────────────────────────────────
function LimitReachedModal({
  t,
  subscription,
  currentCount,
  locale,
  upgradeMenuRef,
  onClose,
}: {
  t: ReturnType<typeof useTranslations<"Menus">>;
  subscription: Subscription | null;
  currentCount: number;
  locale: string;
  upgradeMenuRef?: string;
  onClose: () => void;
}) {
  const maxMenus = getEffectiveMaxMenus(subscription);
  const planName = subscription?.planName || subscription?.plan || "Free";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 end-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IoCloseOutline className="text-gray-400 text-xl" />
          </button>

          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
            <IoWarningOutline className="text-amber-500 text-3xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {t("limitReached")}
            </h3>
            <p className="text-slate-500 text-sm">
              {t("limitReachedDescription", {
                current: String(currentCount),
                max: String(maxMenus),
                plan: planName,
              })}
            </p>
          </div>

          {/* Plan info badge */}
          <div className="w-full p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {t("currentPlan")}
            </span>
            <span className="text-sm font-bold text-slate-800">
              {planName} ({currentCount}/{maxMenus})
            </span>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              {t("close")}
            </button>
            <LinkTo
              href={
                upgradeMenuRef
                  ? `/dashboard/${upgradeMenuRef}/subscription`
                  : "/pricing"
              }
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
            >
              <IoRocketOutline className="text-base" />
              {t("upgradePlan")}
            </LinkTo>
          </div>
        </div>
      </div>
    </div>
  );
}
