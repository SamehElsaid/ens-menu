"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosDelete } from "@/shared/axiosCall";
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
} from "react-icons/io5";

export default function DashboardPage() {
  const t = useTranslations("Menus");
  const locale = useLocale();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      } else {
        toast.error(t("fetchError"));
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

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
    fetchSubscription();
  }, [fetchMenus, fetchSubscription]);

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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t("title")}</h1>
          <p className="text-slate-500 mt-1">{t("subtitle")}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20 overflow-hidden"
          >
            {/* Card Header with Logo */}
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {menu.logo ? (
                    <img
                      src={menu.logo}
                      alt={getMenuName(menu)}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <IoRestaurant className="text-primary text-3xl" />
                  )}
                </div>

                {/* Menu Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 truncate mb-1">
                    {getMenuName(menu)}
                  </h3>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <IoEllipseSharp
                      className={`text-[8px] ${
                        menu.isActive ? "text-green-500" : "text-slate-300"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        menu.isActive ? "text-green-600" : "text-slate-400"
                      }`}
                    >
                      {menu.isActive
                        ? t("menuCard.active")
                        : t("menuCard.inactive")}
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteTarget(menu)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0 group/del"
                  title={t("deleteMenu")}
                >
                  <IoTrashOutline className="text-slate-400 group-hover/del:text-red-500 transition-colors text-sm" />
                </button>
              </div>

              {/* Description */}
              {getMenuDescription(menu) && (
                <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                  {getMenuDescription(menu)}
                </p>
              )}

              {/* Slug URL */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
                <IoGlobeOutline className="text-sm" />
                <span className="font-mono">
                  {menu.slug}
                  {process.env.NEXT_PUBLIC_MENU_URL}
                </span>
              </div>
            </div>

            {/* Card Footer with Action Buttons */}
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center gap-3">
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
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all"
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <IoTrashOutline className="text-red-500 text-3xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {t("deleteConfirmTitle")}
                </h3>
                <p className="text-slate-500 text-sm mb-1">
                  <span className="font-semibold text-slate-700">
                    {getMenuName(deleteTarget)}
                  </span>
                </p>
                <p className="text-slate-500 text-sm">{t("deleteConfirm")}</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleDeleteMenu}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("deleting")}
                    </>
                  ) : (
                    <>
                      <IoTrashOutline className="text-base" />
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
