"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiAlertTriangle } from "react-icons/fi";
import { Button, ButtonLink, ConfirmDialog } from "@/components/ui";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosDelete, axiosPatch, axiosPost } from "@/shared/axiosCall";
import { publicMenuLinkUrl } from "@/lib/publicMenuUrl";
import { toast } from "react-toastify";

export interface AdminUserMenu {
  id: number;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  isActive: boolean;
  itemsCount?: number;
  activeItemsCount?: number;
  createdAt: string;
}

type AdminUserMenusSectionProps = {
  userId: string;
  menus: AdminUserMenu[];
  featuredOnHomepage?: boolean;
  onMenusChange: (menus: AdminUserMenu[]) => void;
  onRefresh: () => void;
};

export default function AdminUserMenusSection({
  userId,
  menus,
  featuredOnHomepage = false,
  onMenusChange,
  onRefresh,
}: AdminUserMenusSectionProps) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails");
  const isRTL = locale === "ar";

  const [confirmingMenu, setConfirmingMenu] = useState<AdminUserMenu | null>(
    null,
  );
  const [updatingMenuId, setUpdatingMenuId] = useState<number | null>(null);
  const [featureOnHomepageLoading, setFeatureOnHomepageLoading] =
    useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFeatureOnHomepage = useCallback(async () => {
    setFeatureOnHomepageLoading(true);
    try {
      const result = await axiosPost<
        Record<string, never>,
        { success?: boolean; message?: string }
      >(`/admin/users/${userId}/feature-on-homepage`, locale, {});

      if (result.status) {
        toast.success(t("lists.addToHomepageSuccess"));
        onRefresh();
        return;
      }

      if (result.statusCode === 409) {
        toast.info(t("lists.alreadyOnHomepage"));
        return;
      }
      if (result.statusCode === 400) {
        toast.error(t("lists.noMenuForHomepage"));
        return;
      }

      toast.error(t("lists.addToHomepageError"));
    } catch (err) {
      console.error("Error featuring user on homepage:", err);
      toast.error(t("lists.addToHomepageError"));
    } finally {
      setFeatureOnHomepageLoading(false);
    }
  }, [userId, locale, t, onRefresh]);

  const handleRemoveFromHomepage = useCallback(async () => {
    setFeatureOnHomepageLoading(true);
    try {
      const result = await axiosDelete<{ success?: boolean }>(
        `/admin/users/${userId}/feature-on-homepage`,
        locale,
      );

      if (result.status) {
        toast.success(t("lists.removeFromHomepageSuccess"));
        onRefresh();
        return;
      }

      toast.error(t("lists.removeFromHomepageError"));
    } catch (err) {
      console.error("Error removing user from homepage:", err);
      toast.error(t("lists.removeFromHomepageError"));
    } finally {
      setFeatureOnHomepageLoading(false);
    }
  }, [userId, locale, t, onRefresh]);

  const handleToggleMenuStatus = async (menu: AdminUserMenu) => {
    try {
      setUpdatingMenuId(menu.id);
      const newStatus = !menu.isActive;
      const result = await axiosPatch<{ isActive: boolean }, AdminUserMenu>(
        `/menus/${menu.id}/status`,
        locale,
        { isActive: newStatus },
      );

      if (result.status && result.data) {
        onMenusChange(
          menus.map((m) =>
            m.id === menu.id ? { ...m, isActive: newStatus } : m,
          ),
        );
        toast.success(
          newStatus ? t("lists.activateSuccess") : t("lists.deactivateSuccess"),
        );
        setConfirmingMenu(null);
      } else {
        toast.error(t("lists.updateError"));
      }
    } catch (error) {
      console.error("Error updating menu status:", error);
      toast.error(t("lists.updateError"));
    } finally {
      setUpdatingMenuId(null);
    }
  };

  const confirmingMenuName = confirmingMenu
    ? isRTL
      ? confirmingMenu.nameAr || confirmingMenu.name || ""
      : confirmingMenu.nameEn || confirmingMenu.name || ""
    : "";

  return (
    <>
      <CardDashBoard>
        <div
          className={`mb-6 flex flex-wrap items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t("lists.title")} ({menus.length})
          </h2>
          {menus.length > 0 ? (
            featuredOnHomepage ? (
              <Button
                variant="danger"
                size="sm"
                loading={featureOnHomepageLoading}
                onClick={handleRemoveFromHomepage}
              >
                {featureOnHomepageLoading
                  ? t("lists.removeFromHomepageLoading")
                  : t("lists.removeFromHomepage")}
              </Button>
            ) : (
              <Button
                size="sm"
                loading={featureOnHomepageLoading}
                onClick={handleFeatureOnHomepage}
              >
                {featureOnHomepageLoading
                  ? t("lists.addToHomepageLoading")
                  : t("lists.addToHomepage")}
              </Button>
            )
          ) : null}
        </div>
        {menus.length > 0 ? (
          <div className="space-y-4">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div
                  className={`flex items-start justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {isRTL
                        ? menu.nameAr || menu.name
                        : menu.nameEn || menu.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                        menu.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {menu.isActive
                        ? t("status.active")
                        : t("status.suspended")}
                    </span>
                    <div
                      className={`flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <span>
                        {t("lists.link")}: {menu.slug}
                      </span>
                      <span>
                        {t("lists.products")}:{" "}
                        {menu.itemsCount || menu.activeItemsCount || 0}
                      </span>
                      <span>
                        {t("lists.date")}: {formatDate(menu.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <ButtonLink
                    href={publicMenuLinkUrl(menu.slug)}
                    external
                    variant="secondary"
                    size="sm"
                  >
                    {t("lists.view")}
                  </ButtonLink>
                  <Button
                    variant={menu.isActive ? "danger" : "primary"}
                    size="sm"
                    className="min-w-[100px]"
                    loading={updatingMenuId === menu.id}
                    onClick={() => setConfirmingMenu(menu)}
                  >
                    {updatingMenuId === menu.id
                      ? t("lists.updating")
                      : menu.isActive
                        ? t("lists.stop")
                        : t("lists.activate")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              {t("lists.noMenus")}
            </p>
          </div>
        )}
      </CardDashBoard>

      {confirmingMenu && (
        <ConfirmDialog
          open={true}
          onClose={() =>
            updatingMenuId !== confirmingMenu.id && setConfirmingMenu(null)
          }
          onConfirm={() => handleToggleMenuStatus(confirmingMenu)}
          title={
            confirmingMenu.isActive
              ? t("lists.confirmStopTitle")
              : t("lists.confirmActivateTitle")
          }
          description={
            confirmingMenu.isActive
              ? t("lists.confirmStopMessage", { menuName: confirmingMenuName })
              : t("lists.confirmActivateMessage", {
                  menuName: confirmingMenuName,
                })
          }
          confirmLabel={
            confirmingMenu.isActive ? t("lists.stop") : t("lists.activate")
          }
          cancelLabel={t("lists.cancel")}
          loading={updatingMenuId === confirmingMenu.id}
          tone="brand"
          icon={<FiAlertTriangle />}
        />
      )}
    </>
  );
}
