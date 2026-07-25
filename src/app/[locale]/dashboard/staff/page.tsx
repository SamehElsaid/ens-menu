"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosPatch } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddStaffModal from "@/components/Dashboard/AddStaffModal";
import DeleteStaffConfirm from "@/components/Dashboard/DeleteStaffConfirm";
import StaffCardGrid from "@/components/Dashboard/staff/StaffCardGrid";
import RoleCardGrid from "@/components/Dashboard/staff/RoleCardGrid";
import AddRoleModal from "@/components/Dashboard/staff/AddRoleModal";
import DeleteRoleConfirm from "@/components/Dashboard/staff/DeleteRoleConfirm";
import LinkTo from "@/components/Global/LinkTo";
import { MenuStaff, MenuStaffRole } from "@/types/Menu";
import { useAccountStaffRoles } from "@/hooks/useAccountStaffRoles";
import { useDashboardMenus, localizedMenuName } from "@/hooks/useDashboardMenus";
import {
  IoAddCircleOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { toast } from "react-toastify";

type StaffTab = "staff" | "roles";

/**
 * Account-level staff: members belong to the account and are granted access to
 * specific menus, with one role that applies across every menu they hold.
 */
export default function AccountStaffPage() {
  const t = useTranslations("Staff");
  const tRoles = useTranslations("Roles");
  const locale = useLocale();

  const userData = useAppSelector((state) => state.auth.data);
  const isFreePlan = isFreePlanUser(userData);

  const [activeTab, setActiveTab] = useState<StaffTab>("staff");

  const [staffList, setStaffList] = useState<MenuStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<MenuStaff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<MenuStaff | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(0);

  const { menus } = useDashboardMenus();
  const menuNameById = useMemo(() => {
    const map: Record<number, string> = {};
    for (const menu of menus) map[menu.id] = localizedMenuName(menu, locale);
    return map;
  }, [menus, locale]);

  const {
    roles,
    loading: rolesLoading,
    refresh: refreshRoles,
  } = useAccountStaffRoles(!isFreePlan);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<MenuStaffRole | null>(null);
  const [duplicatingRole, setDuplicatingRole] = useState<MenuStaffRole | null>(
    null,
  );
  const [deletingRole, setDeletingRole] = useState<MenuStaffRole | null>(null);

  const fetchStaff = useCallback(async () => {
    if (isFreePlan) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await axiosGet<{ staff?: MenuStaff[] }>(
        "/dashboard/staff",
        locale,
      );
      setStaffList(result.status ? (result.data?.staff ?? []) : []);
    } finally {
      setLoading(false);
    }
  }, [locale, isFreePlan]);

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

  const openAddRoleModal = useCallback(() => {
    setEditingRole(null);
    setDuplicatingRole(null);
    setShowAddRoleModal(true);
  }, []);

  const closeRoleModal = useCallback(() => {
    setShowAddRoleModal(false);
    setEditingRole(null);
    setDuplicatingRole(null);
  }, []);

  const handleEditRole = useCallback((role: MenuStaffRole) => {
    setEditingRole(role);
  }, []);

  const handleDuplicateRole = useCallback((role: MenuStaffRole) => {
    setDuplicatingRole(role);
  }, []);

  const handleDeleteRole = useCallback((role: MenuStaffRole) => {
    setDeletingRole(role);
  }, []);

  // Role edits can change permissions/names shown on staff cards.
  const onRolesChanged = useCallback(() => {
    refreshRoles();
    refreshList();
  }, [refreshRoles, refreshList]);

  const handleToggleActive = useCallback(
    async (staff: MenuStaff) => {
      if (togglingId !== null) return;
      setTogglingId(staff.id);
      try {
        const result = await axiosPatch<
          { isActive: boolean },
          { message?: string }
        >(`/dashboard/staff/${staff.id}`, locale, {
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
    [locale, togglingId, t, refreshList],
  );

  if (isFreePlan) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[60vh] md:gap-4">
        <PageTitleWithHelp className="justify-center">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
            {t("proOnlyTitle")}
          </h1>
        </PageTitleWithHelp>
        <p className="max-w-md text-sm text-slate-500 md:text-base dark:text-slate-400">
          {t("proOnlyDescription")}
        </p>
        <LinkTo
          href="/dashboard/subscription"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] md:mt-4 md:px-8"
        >
          {t("upgradeShort")}
        </LinkTo>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-staff-header mb-5 min-w-0 md:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <PageTitleWithHelp>
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
                {t("title")}
              </h1>
            </PageTitleWithHelp>
            <p className="mt-0.5 text-sm text-slate-500 md:mt-1 dark:text-slate-400">
              {activeTab === "staff" ? t("subtitle") : tRoles("subtitle")}
            </p>
            {activeTab === "staff" && !loading && staffList.length > 0 && (
              <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                {t("totalStaffLabel")}:{" "}
                <span className="font-bold tabular-nums text-slate-700 dark:text-slate-300">
                  {staffList.length}
                </span>
              </p>
            )}
            {activeTab === "roles" && !rolesLoading && roles.length > 0 && (
              <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                {tRoles("totalRolesLabel")}:{" "}
                <span className="font-bold tabular-nums text-slate-700 dark:text-slate-300">
                  {roles.length}
                </span>
              </p>
            )}
          </div>

          {activeTab === "staff" ? (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] sm:h-11 sm:px-5"
            >
              <IoAddCircleOutline className="text-lg" aria-hidden />
              {t("addStaff")}
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddRoleModal}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] sm:h-11 sm:px-5"
            >
              <IoAddCircleOutline className="text-lg" aria-hidden />
              {tRoles("addRole")}
            </button>
          )}
        </div>

        <div
          className="mt-5 flex gap-1 border-b border-slate-200 dark:border-slate-700/80"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "staff"}
            onClick={() => setActiveTab("staff")}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "staff"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <IoPeopleOutline className="text-base" aria-hidden />
            {t("tabStaff")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "roles"}
            onClick={() => setActiveTab("roles")}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "roles"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <IoShieldCheckmarkOutline className="text-base" aria-hidden />
            {t("tabRoles")}
          </button>
        </div>
      </div>

      {activeTab === "staff" ? (
        <div className="dashboard-staff-page min-w-0 pb-6">
          <StaffCardGrid
            staffList={staffList}
            loading={loading}
            locale={locale}
            togglingId={togglingId}
            menuNameById={menuNameById}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
            onAdd={openAddModal}
          />
        </div>
      ) : (
        <div className="min-w-0 pb-6">
          <RoleCardGrid
            roles={roles}
            loading={rolesLoading}
            locale={locale}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onDuplicate={handleDuplicateRole}
            onAdd={openAddRoleModal}
          />
        </div>
      )}

      {(showAddModal || editingStaff) && (
        <AddStaffModal
          staff={editingStaff}
          onClose={closeAddModal}
          onRefresh={refreshList}
        />
      )}

      {deletingStaff && (
        <DeleteStaffConfirm
          staff={deletingStaff}
          displayLabel={deletingStaff.name}
          onClose={() => setDeletingStaff(null)}
          onDeleted={refreshList}
        />
      )}

      {(showAddRoleModal || editingRole || duplicatingRole) && (
        <AddRoleModal
          role={duplicatingRole ?? editingRole}
          mode={duplicatingRole ? "duplicate" : "edit"}
          onClose={closeRoleModal}
          onSaved={onRolesChanged}
        />
      )}

      {deletingRole && (
        <DeleteRoleConfirm
          role={deletingRole}
          onClose={() => setDeletingRole(null)}
          onDeleted={onRolesChanged}
        />
      )}
    </>
  );
}
