"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { axiosGet, axiosDelete, axiosPut } from "@/shared/axiosCall";
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
import { useAppSelector } from "@/store/hooks";
import { shouldShowAiImportOnboarding } from "@/lib/aiImportOnboarding";
import { normalizeMenuFromApi } from "@/lib/normalizeMenuFromApi";
import { Subscription, SubscriptionResponse } from "@/types/Subscription";
import {
  IoAddCircleOutline,
  IoStorefrontOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoRocketOutline,
  IoGitNetworkOutline,
} from "react-icons/io5";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  PageShell,
  StatCard,
  StatGrid,
  buttonClasses,
} from "@/components/ui";
import AttentionQueue, {
  type AttentionItem,
} from "@/components/Dashboard/AttentionQueue";
import { usePendingOrders } from "@/components/Dashboard/PendingOrdersProvider";
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
import {
  getMenuDashboardRef,
  menuDashboardPath,
} from "@/lib/menuDashboardPath";
import { publicMenuLinkUrl, resolvePublicMenuSlug } from "@/lib/publicMenuUrl";
import {
  getEffectiveMaxMenus,
  isProSubscription,
} from "@/lib/subscriptionMenus";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

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
  return <LoadingBlock size="xl" className="min-h-[40vh] sm:min-h-[60vh]" />;
}

function OwnerMenusPage() {
  const t = useTranslations("Menus");
  const tDash = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();
  const { unseenTableCount, unseenDeliveryCount } = usePendingOrders();
  const authData = useAppSelector((state) => state.auth.data);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [addToGroupTarget, setAddToGroupTarget] = useState<Menu | null>(null);
  const [removeFromGroupTarget, setRemoveFromGroupTarget] =
    useState<Menu | null>(null);
  const [manageGroupTarget, setManageGroupTarget] =
    useState<MenuGroupSummary | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showExtraMenusModal, setShowExtraMenusModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [copyTarget, setCopyTarget] = useState<Menu | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [switchMenuTarget, setSwitchMenuTarget] = useState<Menu | null>(null);
  const [isSwitchingMenu, setIsSwitchingMenu] = useState(false);
  const { runApiAction } = useApiAction();

  const requestMenus = useCallback(
    () =>
      axiosGet<MenusResponse | Menu[]>(
        "/menus",
        locale,
        undefined,
        { locale },
      ),
    [locale],
  );
  const menusQuery = useApiQuery({
    request: requestMenus,
    onSuccess: (data) => {
      const menusList = Array.isArray(data) ? data : (data.menus ?? []);
      setMenus(
        menusList
          .map((item) => normalizeMenuFromApi(item))
          .filter((item): item is Menu => item != null),
      );
    },
  });
  const loading = menusQuery.loading;
  const fetchMenus = menusQuery.refetch;

  const requestSubscription = useCallback(
    () => axiosGet<SubscriptionResponse>("/user/subscription", locale),
    [locale],
  );
  const subscriptionQuery = useApiQuery({
    request: requestSubscription,
    onSuccess: (data) => {
      if (data.subscription) setSubscription(data.subscription);
    },
  });
  const subscriptionLoading = subscriptionQuery.loading;

  const resolveSubscription =
    useCallback(async (): Promise<Subscription | null> => {
      if (subscription != null || !subscriptionLoading) {
        return subscription;
      }
      const result = await subscriptionQuery.refetch();
      if (result?.data?.subscription) {
        return result.data.subscription;
      }
      return subscription;
    }, [subscription, subscriptionLoading, subscriptionQuery]);

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
      await runApiAction(
        () => axiosDelete(`/menus/${deleteTarget.id}`, locale),
        {
          successToast: t("deleteSuccess"),
          errorToast: t("deleteError"),
          onSuccess: () =>
            setMenus((current) =>
              current.filter((menu) => menu.id !== deleteTarget.id),
            ),
        },
      );
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

  const totalItems = useMemo(
    () => menus.reduce((sum, menu) => sum + (menu.itemsCount ?? 0), 0),
    [menus],
  );

  /* A live menu with nothing on it is the one state here that costs the merchant
     money while they are not looking at this page, so it earns a queue row. */
  const emptyLiveMenus = useMemo(
    () => menus.filter((menu) => menu.isActive && !menu.itemsCount).length,
    [menus],
  );

  const attention: AttentionItem[] = [
    {
      id: "unseenOrders",
      label: tDash("attentionUnseenOrders"),
      value: unseenTableCount,
      href: "/dashboard/orders",
      tone: "danger",
    },
    {
      id: "unseenDelivery",
      label: tDash("attentionUnseenDelivery"),
      value: unseenDeliveryCount,
      href: "/dashboard/delivery-orders",
      tone: "danger",
    },
    {
      id: "emptyMenus",
      label: tDash("attentionEmptyMenus"),
      value: emptyLiveMenus,
      href: "/dashboard",
      tone: "warning",
      hint: tDash("attentionEmptyMenusHint"),
    },
  ];

  const firstManageMenuId = useMemo(() => {
    for (const group of menuDisplayGroups) {
      if (group.type === "group") return group.menus[0]?.id ?? null;
      return group.menu.id;
    }
    return null;
  }, [menuDisplayGroups]);

  const showCreateGroupButton = menus.length >= 2;

  const menuGroups = useMemo(() => extractMenuGroupsFromMenus(menus), [menus]);
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

  const refreshMenus = () => {
    void fetchMenus();
  };

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
      await runApiAction(
        () =>
          axiosPut(`/menus/${menu.id}`, locale, {
            isActive: !menu.isActive,
          }),
        {
          successToast: t("toggleSuccess"),
          errorToast: t("toggleError"),
          onSuccess: () =>
            setMenus((current) =>
              current.map((item) =>
                item.id === menu.id
                  ? { ...item, isActive: !item.isActive }
                  : item,
              ),
            ),
        },
      );
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
        await axiosPut<{ isActive: boolean }, { message?: string }>(
          `/menus/${m.id}`,
          locale,
          { isActive: false },
        );
      }
      const result = await axiosPut<{ isActive: boolean }, Menu>(
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
      <LoadingBlock
        size="xl"
        label={t("loading")}
        className="min-h-[40vh] sm:min-h-[60vh]"
      />
    );
  }

  // Empty State
  if (menus.length === 0) {
    return (
      <>
        <EmptyState
          icon={<IoStorefrontOutline />}
          title={
            <PageTitleWithHelp className="flex justify-center">
              {t("noMenus")}
            </PageTitleWithHelp>
          }
          description={t("noMenusDescription")}
          className="min-h-[60vh]"
          action={
            <Button
              id="onboarding-create-menu"
              size="lg"
              onClick={handleCreateClick}
              startIcon={<IoAddCircleOutline className="size-5" />}
            >
              {t("createFirstMenu")}
            </Button>
          }
        />

        {showCreateModal && (
          <CreateMenuModal
            onClose={() => setShowCreateModal(false)}
            onMenuCreated={handleMenuCreated}
            onRefresh={refreshMenus}
          />
        )}

        {/* Limit Reached Modal */}
        {showLimitModal && (
          <LimitReachedModal
            t={t}
            subscription={subscription}
            currentCount={menus.length}
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
    <PageShell
      kind="wide"
      header={
        <PageTitleWithHelp className="menus-page-header">
          <PageHeader
            title={t("title")}
            description={t("subtitle")}
            actions={
              <>
                {showCreateGroupButton && (
                  <Button
                    variant="secondary"
                    onClick={handleCreateGroupClick}
                    startIcon={<IoGitNetworkOutline className="size-4.5" />}
                  >
                    {t("createGroup")}
                  </Button>
                )}
                <Button
                  id="onboarding-create-menu"
                  onClick={handleCreateClick}
                  startIcon={<IoAddCircleOutline className="size-4.5" />}
                >
                  {t("createMenu")}
                </Button>
              </>
            }
          />
        </PageTitleWithHelp>
      }
    >
      {/* The account's state before its inventory. This page was a grid of menu
          cards with no answer to "is anything waiting for me" — which is the
          question an operator opens it with in the morning. */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:items-start">
        <StatGrid columns={2}>
          <StatCard
            label={tDash("myMenus")}
            value={`${menus.length}/${getEffectiveMaxMenus(subscription)}`}
            hint={tDash("kpiActiveMenus", {
              count: menus.filter((m) => m.isActive).length,
            })}
          />
          <StatCard
            label={tDash("orders")}
            value={String(unseenTableCount)}
            hint={tDash("kpiUnseenHint")}
            href="/dashboard/orders"
          />
          <StatCard
            label={tDash("deliveryOrders")}
            value={String(unseenDeliveryCount)}
            hint={tDash("kpiUnseenHint")}
            href="/dashboard/delivery-orders"
          />
          <StatCard
            label={tDash("kpiItems")}
            value={String(totalItems)}
            hint={tDash("kpiItemsHint")}
          />
        </StatGrid>

        <AttentionQueue
          title={tDash("attentionTitle")}
          description={tDash("attentionVenueDescription")}
          items={attention}
          allClearTitle={tDash("attentionAllClear")}
          allClearHint={tDash("attentionAllClearVenueHint")}
        />
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
                    labels={cardLabels}
                    onToggleActive={handleToggleActive}
                    onDelete={setDeleteTarget}
                    onCopy={handleCopyClick}
                    onAddToGroup={
                      canAddToExistingGroup ? handleAddToGroupClick : undefined
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
                menu.id === firstManageMenuId
                  ? "onboarding-manage-menu"
                  : undefined
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
          onRefresh={refreshMenus}
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
        <Modal
          open
          onClose={() => setSwitchMenuTarget(null)}
          dismissible={!isSwitchingMenu}
          closeLabel={t("close")}
          size="sm"
          icon={<IoWarningOutline className="size-5" />}
          iconTone="warning"
          title={t("switchMenuLimitTitle")}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setSwitchMenuTarget(null)}
                disabled={isSwitchingMenu}
              >
                {t("cancel")}
              </Button>
              <LinkTo
                href={menuDashboardPath(switchMenuTarget, "personal")}
                className={buttonClasses({ variant: "secondary" })}
              >
                <IoRocketOutline className="size-4.5" aria-hidden />
                {t("upgradePlan")}
              </LinkTo>
              <Button
                onClick={handleConfirmSwitchMenu}
                loading={isSwitchingMenu}
              >
                {isSwitchingMenu ? t("switching") : t("switchMenuConfirm")}
              </Button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-fg-muted">
            {t("switchMenuLimitMessage")}
          </p>
          <div className="mt-4 rounded-xl border border-brand-line bg-brand-soft px-4 py-3">
            <p className="ui-label text-fg-muted">{t("selectedMenu")}</p>
            <p className="mt-0.5 font-semibold text-fg">
              {getMenuName(switchMenuTarget)}
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDialog
          open
          onClose={() => {
            setDeleteTarget(null);
            setDeleteConfirmText("");
          }}
          onConfirm={handleDeleteMenu}
          title={t("deleteConfirmTitle")}
          description={t("deleteConfirm")}
          confirmLabel={isDeleting ? t("deleting") : t("confirm")}
          cancelLabel={t("cancel")}
          loading={isDeleting}
          confirmDisabled={
            deleteConfirmText.trim() !== getMenuName(deleteTarget)
          }
          tone="danger"
          icon={<IoTrashOutline className="size-5" />}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-fg">
              {getMenuName(deleteTarget)}
            </p>
            <Field
              label={t("typeMenuNameToConfirm")}
              htmlFor="delete-confirm-input"
            >
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={getMenuName(deleteTarget)}
                dir={locale === "ar" ? "rtl" : "ltr"}
              />
            </Field>
          </div>
        </ConfirmDialog>
      )}
    </PageShell>
  );
}
// ─── Limit Reached Modal ────────────────────────────────────────────
function LimitReachedModal({
  t,
  subscription,
  currentCount,
  upgradeMenuRef,
  onClose,
}: {
  t: ReturnType<typeof useTranslations<"Menus">>;
  subscription: Subscription | null;
  currentCount: number;
  upgradeMenuRef?: string;
  onClose: () => void;
}) {
  const maxMenus = getEffectiveMaxMenus(subscription);
  const planName = subscription?.planName || subscription?.plan || "Free";

  return (
    <Modal
      open
      onClose={onClose}
      closeLabel={t("close")}
      size="sm"
      icon={<IoWarningOutline className="size-5" />}
      iconTone="warning"
      title={t("limitReached")}
      description={t("limitReachedDescription", {
        current: String(currentCount),
        max: String(maxMenus),
        plan: planName,
      })}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
          <LinkTo
            href={
              upgradeMenuRef
                ? `/dashboard/${upgradeMenuRef}/subscription`
                : "/pricing"
            }
            className={buttonClasses({ variant: "primary" })}
          >
            <IoRocketOutline className="size-4" aria-hidden />
            {t("upgradePlan")}
          </LinkTo>
        </>
      }
    >
      <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-4 py-3">
        <span className="text-[13px] text-fg-muted">{t("currentPlan")}</span>
        <span className="text-[13px] font-semibold text-fg">
          {planName} ({currentCount}/{maxMenus})
        </span>
      </div>
    </Modal>
  );
}
