"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  SectionHeader,
} from "@/components/ui";
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
      <Card padded="lg">
        <SectionHeader
          title={`${t("lists.title")} (${menus.length})`}
          className="mb-4"
          actions={
            menus.length > 0 ? (
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
            ) : null
          }
        />
        {menus.length > 0 ? (
          // The menus share edges as one ruled list: an operator reads down a
          // roster of menus, not a stack of separate panels.
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line">
            {menus.map((menu) => (
              <li
                key={menu.id}
                className="flex flex-wrap items-start justify-between gap-3 p-3"
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-fg">
                      {isRTL
                        ? menu.nameAr || menu.name
                        : menu.nameEn || menu.name}
                    </span>
                    <Badge tone={menu.isActive ? "success" : "neutral"} dot>
                      {menu.isActive
                        ? t("status.active")
                        : t("status.suspended")}
                    </Badge>
                  </div>
                  <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-fg-muted">
                    <div className="flex items-center gap-1.5">
                      <dt className="ui-label">{t("lists.link")}</dt>
                      <dd className="font-mono" dir="ltr">
                        {menu.slug}
                      </dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <dt className="ui-label">{t("lists.products")}</dt>
                      <dd className="ui-figure" lang="en">
                        {menu.itemsCount || menu.activeItemsCount || 0}
                      </dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <dt className="ui-label">{t("lists.date")}</dt>
                      <dd className="ui-figure" lang="en">
                        {formatDate(menu.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <ButtonLink
                    href={publicMenuLinkUrl(menu.slug)}
                    external
                    variant="secondary"
                    size="sm"
                  >
                    {t("lists.view")}
                  </ButtonLink>
                  <Button
                    variant={menu.isActive ? "dangerGhost" : "secondary"}
                    size="sm"
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
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t("lists.noMenus")} size="sm" />
        )}
      </Card>

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
