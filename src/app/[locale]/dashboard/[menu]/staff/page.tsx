"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosPatch } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddStaffModal from "@/components/Dashboard/AddStaffModal";
import DeleteStaffConfirm from "@/components/Dashboard/DeleteStaffConfirm";
import StaffCardGrid from "@/components/Dashboard/staff/StaffCardGrid";
import LinkTo from "@/components/Global/LinkTo";
import { MenuStaff } from "@/types/Menu";
import { IoAddCircleOutline, IoArrowBackOutline } from "react-icons/io5";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { toast } from "react-toastify";

export default function StaffPage() {
  const t = useTranslations("Staff");
  const locale = useLocale();
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const userData = useAppSelector((state) => state.auth.data);
  const isFreePlan = isFreePlanUser(userData);

  const [staffList, setStaffList] = useState<MenuStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<MenuStaff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<MenuStaff | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(0);

  const fetchStaff = useCallback(async () => {
    if (!menuId) return;
    if (isFreePlan) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await axiosGet<MenuStaff[] | { staff: MenuStaff[] }>(
        `/menus/${menuId}/staff`,
        locale,
      );
      if (result.status && result.data) {
        const raw = result.data as { staff?: MenuStaff[] };
        const list = Array.isArray(result.data)
          ? result.data
          : (raw?.staff ?? []);
        setStaffList(list);
      } else {
        setStaffList([]);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, isFreePlan]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff, refreshing]);

  const handleEdit = useCallback((row: MenuStaff) => {
    setEditingStaff(row);
  }, []);

  const handleDelete = useCallback((row: MenuStaff) => {
    setDeletingStaff(row);
  }, []);

  const refreshList = useCallback(() => {
    setRefreshing((r) => r + 1);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingStaff(null);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingStaff(null);
    setShowAddModal(true);
  }, []);

  const handleToggleActive = useCallback(
    async (staff: MenuStaff) => {
      if (!menuId || togglingId !== null) return;
      setTogglingId(staff.id);
      try {
        const result = await axiosPatch<
          { isActive: boolean },
          { message?: string }
        >(`/menus/${menuId}/staff/${staff.id}`, locale, {
          isActive: !staff.isActive,
        });
        if (result.status) {
          toast.success(
            staff.isActive ? t("disableSuccess") : t("enableSuccess"),
          );
          refreshList();
        } else {
          toast.error(t("toggleError"));
        }
      } catch {
        toast.error(t("toggleError"));
      } finally {
        setTogglingId(null);
      }
    },
    [menuId, locale, togglingId, t, refreshList],
  );

  if (isFreePlan) {
    return (
      <div
        id="onboarding-staff-upgrade"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[60vh] md:gap-4"
      >
        <PageTitleWithHelp className="justify-center">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
            {t("proOnlyTitle")}
          </h1>
        </PageTitleWithHelp>
        <p className="max-w-md text-sm text-slate-500 md:text-base dark:text-slate-400">
          {t("proOnlyDescription")}
        </p>
        <LinkTo
          href={`/dashboard/${menuId}/subscription`}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] md:mt-4 md:px-8"
        >
          {t("upgradeShort")}
        </LinkTo>
      </div>
    );
  }

  return (
    <>
      <div
        id="onboarding-staff-header"
        className="dashboard-staff-header mb-5 min-w-0 md:mb-6"
      >
        <LinkTo
          href={`/dashboard/${menuId}`}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
        >
          <IoArrowBackOutline className="text-sm rtl:rotate-180" aria-hidden />
          {t("backToOverview")}
        </LinkTo>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <PageTitleWithHelp>
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
                {t("title")}
              </h1>
            </PageTitleWithHelp>
            <p className="mt-0.5 text-sm text-slate-500 md:mt-1 dark:text-slate-400">
              {t("subtitle")}
            </p>
            {!loading && staffList.length > 0 && (
              <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                {t("totalStaffLabel")}:{" "}
                <span className="font-bold tabular-nums text-slate-700 dark:text-slate-300">
                  {staffList.length}
                </span>
              </p>
            )}
          </div>

          <button
            id="onboarding-staff-actions"
            type="button"
            onClick={openAddModal}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] sm:h-11 sm:px-5"
          >
            <IoAddCircleOutline className="text-lg" aria-hidden />
            {t("addStaff")}
          </button>
        </div>
      </div>

      <div id="onboarding-staff-table" className="dashboard-staff-page min-w-0 pb-6">
        <StaffCardGrid
          staffList={staffList}
          loading={loading}
          locale={locale}
          togglingId={togglingId}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          onAdd={openAddModal}
        />
      </div>

      {(showAddModal || editingStaff) && menuId && (
        <AddStaffModal
          menuId={menuId}
          staff={editingStaff}
          onClose={closeAddModal}
          onRefresh={refreshList}
        />
      )}

      {deletingStaff && menuId && (
        <DeleteStaffConfirm
          menuId={menuId}
          staff={deletingStaff}
          displayLabel={deletingStaff.name}
          onClose={() => setDeletingStaff(null)}
          onDeleted={refreshList}
        />
      )}
    </>
  );
}
