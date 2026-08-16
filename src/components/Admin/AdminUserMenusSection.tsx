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
import { axiosDelete, axiosPut, axiosPost } from "@/shared/axiosCall";
import { publicMenuLinkUrl } from "@/lib/publicMenuUrl";
import { toast } from "react-toastify";
import { useApiAction } from "@/hooks/useApiAction";
import type { AdminUserMenuSummary } from "@/types/User";
import { formatAppDate } from "@/lib/formatDateTime";

type AdminUserMenusSectionProps = {
  userId: string;
  menus: AdminUserMenuSummary[];
  featuredOnHomepage?: boolean;
  onMenusChange: (menus: AdminUserMenuSummary[]) => void;
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

  const [confirmingMenu, setConfirmingMenu] = useState<AdminUserMenuSummary | null>(
    null,
  );
  const [updatingMenuId, setUpdatingMenuId] = useState<number | null>(null);
  const [featureOnHomepageLoading, setFeatureOnHomepageLoading] =
    useState(false);
  const { runApiAction } = useApiAction();

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
      await runApiAction(
        () =>
          axiosDelete(
            `/admin/users/${userId}/feature-on-homepage`,
            locale,
          ),
        {
          successToast: t("lists.removeFromHomepageSuccess"),
          errorToast: t("lists.removeFromHomepageError"),
          onSuccess: onRefresh,
        },
      );
    } finally {
      setFeatureOnHomepageLoading(false);
    }
  }, [userId, locale, t, onRefresh, runApiAction]);

  const handleToggleMenuStatus = async (menu: AdminUserMenuSummary) => {
    try {
      setUpdatingMenuId(menu.id);
      const newStatus = !menu.isActive;
      await runApiAction(
        () =>
          axiosPut<{ isActive: boolean }, AdminUserMenuSummary>(
            `/menus/${menu.id}/status`,
            locale,
            { isActive: newStatus },
          ),
        {
          successToast: newStatus
            ? t("lists.activateSuccess")
            : t("lists.deactivateSuccess"),
          errorToast: t("lists.updateError"),
          onSuccess: () => {
            onMenusChange(
              menus.map((item) =>
                item.id === menu.id ? { ...item, isActive: newStatus } : item,
              ),
            );
            setConfirmingMenu(null);
          },
        },
      );
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
                      {formatAppDate(menu.createdAt, locale, "-")}
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
