"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosDelete, axiosPatch } from "@/shared/axiosCall";
import LinkTo from "@/components/Global/LinkTo";
import CreateMenuModal from "@/components/Dashboard/CreateMenuModal";
import { toast } from "react-toastify";
import { Menu, MenusResponse } from "@/types/Menu";
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
} from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";

export default function DashboardPage() {
  const t = useTranslations("Menus");
  const locale = useLocale();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
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
        setMenus(menusList);
      }
    } finally {
      setLoading(false);
    }
  }, [locale]);

  const fetchSubscription = useCallback(async () => {
    try {
      const result = await axiosGet<SubscriptionResponse>(
        "/user/subscription",
        locale,
      );
      if (result.status && result.data?.subscription) {
        setSubscription(result.data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }, [locale]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus, refreshing]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (!deleteTarget) setDeleteConfirmText("");
  }, [deleteTarget]);

  const handleCreateClick = () => {
    const maxMenus = subscription?.maxMenus ?? 1;
    if (menus.length >= maxMenus) {
      setShowLimitModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleMenuCreated = (newMenu?: Menu) => {
    if (newMenu) {
      setMenus((prev) => [...prev, newMenu]);
    } else {
      fetchMenus();
    }
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

  const handleToggleActive = async (menu: Menu) => {
    const maxMenus = subscription?.maxMenus ?? 1;
    const activeCount = menus.filter((m) => m.isActive).length;

    // تشغيل منيو بينما عدد النشطة بالفعل = الحد → عرض مودال "المنيو الآخر هيتوقف، جدد الاشتراك"
    if (!menu.isActive && activeCount >= maxMenus) {
      setSwitchMenuTarget(menu);
      return;
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
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
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {t("noMenus")}
            </h2>
            <p className="text-slate-500 mb-8">{t("noMenusDescription")}</p>
            <button
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
          />
        )}

        {/* Limit Reached Modal */}
        {showLimitModal && (
          <LimitReachedModal
            t={t}
            subscription={subscription}
            currentCount={menus.length}
            locale={locale}
            onClose={() => setShowLimitModal(false)}
          />
        )}
      </>
    );
  }

  // Menus List
  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 ">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {t("title")}
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-primary/80 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <IoAddCircleOutline className="text-xl" />
          {t("createMenu")}
        </button>
      </div>

      {/* Menus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ">
        {menus.map((menu, index) => (
          <div
            key={`menu-${menu.id}-${index}`}
            className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-slate-950/40 ${
              menu.isActive
                ? "border-slate-100 dark:border-slate-800 hover:border-primary/20 dark:hover:border-primary/40"
                : "border-amber-100/80 dark:border-amber-900/40 bg-slate-50/30 dark:bg-amber-950/10"
            }`}
          >
            {/* Card Header with Logo */}
            <div className="p-6 pb-3">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl bg-primary/5 dark:bg-primary/15 border border-primary/10 dark:border-primary/25 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                  {menu.logo ? (
                    <LoadImage
                      src={menu.logo}
                      alt={getMenuName(menu)}
                      className="w-full h-full object-contain"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <IoRestaurant className="text-primary text-3xl" />
                  )}
                </div>

                {/* Menu Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
                    {getMenuName(menu)}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        menu.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                    >
                      <IoEllipseSharp
                        className={`text-[8px] ${menu.isActive ? "text-green-800 dark:text-green-400" : "text-amber-500 dark:text-amber-400"}`}
                      />
                      {menu.isActive
                        ? t("menuCard.active")
                        : t("menuCard.paused")}
                    </span>
                  </div>
                </div>

                {/* Actions: Pause/Play + Delete */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(menu)}
                    disabled={togglingId === menu.id}
                    title={
                      menu.isActive ? t("menuCard.pause") : t("menuCard.play")
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 disabled:pointer-events-none ${
                      menu.isActive
                        ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/35"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/35"
                    }`}
                  >
                    {togglingId === menu.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : menu.isActive ? (
                      <>
                        <IoPauseOutline className="text-lg" />
                        <span className="hidden sm:inline">
                          {t("menuCard.pause")}
                        </span>
                      </>
                    ) : (
                      <>
                        <IoPlayOutline className="text-lg" />
                        <span className="hidden sm:inline">
                          {t("menuCard.play")}
                        </span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(menu)}
                    title={t("deleteMenu")}
                    className="flex items-center justify-center w-10 h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300 hover:border-red-200 dark:hover:border-red-800 transition-colors"
                  >
                    <IoTrashOutline className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {getMenuDescription(menu) && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                  {getMenuDescription(menu)}
                </p>
              )}

              {/* Created & Updated dates */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-slate-3  00 mt-3">
                {menu.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <IoCalendarOutline className="text-sm shrink-0" />
                    {t("menuCard.createdAt")}: {formatDate(menu.createdAt)}
                  </span>
                )}
                {menu.updatedAt && (
                  <span className="flex items-center gap-1.5">
                    <IoCalendarOutline className="text-sm shrink-0 opacity-70" />
                    {t("menuCard.updatedAt")}: {formatDate(menu.updatedAt)}
                  </span>
                )}
              </div>

              {/* Slug URL */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-300 mt-2">
                <IoGlobeOutline className="text-sm shrink-0" />
                <span className="font-mono truncate">
                  {menu.slug}
                  {process.env.NEXT_PUBLIC_MENU_URL}
                </span>
              </div>
            </div>

            {/* Card Footer with Action Buttons */}
            <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <LinkTo
                href={`/dashboard/${menu.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                <IoSettingsOutline className="text-base" />
                {t("menuCard.manage")}
              </LinkTo>
              <a
                href={`//${menu.slug}${process.env.NEXT_PUBLIC_MENU_URL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:border-primary/30 dark:hover:border-primary/50 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/15 transition-all"
              >
                <IoEyeOutline className="text-base" />
                {t("menuCard.preview")}
                <IoOpenOutline className="text-xs" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Create Menu Modal */}
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
          onClose={() => setShowLimitModal(false)}
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
                href="/pricing"
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
  onClose,
}: {
  t: ReturnType<typeof useTranslations<"Menus">>;
  subscription: Subscription | null;
  currentCount: number;
  locale: string;
  onClose: () => void;
}) {
  const maxMenus = subscription?.maxMenus ?? 1;
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
              {locale === "ar" ? "الخطة الحالية" : "Current Plan"}
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
              href="/pricing"
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
