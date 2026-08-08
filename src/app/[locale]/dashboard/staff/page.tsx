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
import { Button, buttonClasses } from "@/components/ui";
import { MenuStaff, MenuStaffRole } from "@/types/Menu";
import { useAccountStaffRoles } from "@/hooks/useAccountStaffRoles";
import {
  useDashboardMenus,
  localizedMenuName,
} from "@/hooks/useDashboardMenus";
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
        <PageTitleWithHelp
          className="justify-center"
          title={t("proOnlyTitle")}
          description={t("proOnlyDescription")}
        />
        <LinkTo
          href="/dashboard/subscription"
          className={buttonClasses({
            variant: "primary",
            className: "mt-2 md:mt-4",
          })}
        >
          {t("upgradeShort")}
        </LinkTo>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-staff-header mb-5 min-w-0 md:mb-6">
        <PageTitleWithHelp
          title={t("title")}
          description={
            activeTab === "staff" ? t("subtitle") : tRoles("subtitle")
          }
          meta={
            activeTab === "staff" && !loading && staffList.length > 0 ? (
              <span className="text-xs font-medium text-fg-subtle">
                {t("totalStaffLabel")}:{" "}
                <span className="font-bold tabular-nums text-fg-muted">
                  {staffList.length}
                </span>
              </span>
            ) : activeTab === "roles" && !rolesLoading && roles.length > 0 ? (
              <span className="text-xs font-medium text-fg-subtle">
                {tRoles("totalRolesLabel")}:{" "}
                <span className="font-bold tabular-nums text-fg-muted">
                  {roles.length}
                </span>
              </span>
            ) : undefined
          }
          actions={
            activeTab === "staff" ? (
              <Button
                type="button"
                onClick={openAddModal}
                startIcon={<IoAddCircleOutline className="size-4.5" />}
              >
                {t("addStaff")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={openAddRoleModal}
                startIcon={<IoAddCircleOutline className="size-4.5" />}
              >
                {tRoles("addRole")}
              </Button>
            )
          }
        />

        <div className="mt-5 flex gap-1 border-b border-line/80" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "staff"}
            onClick={() => setActiveTab("staff")}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "staff"
                ? "border-primary text-primary"
                : "border-transparent text-fg-subtle hover:text-fg-muted dark:hover:text-slate-200"
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
                : "border-transparent text-fg-subtle hover:text-fg-muted dark:hover:text-slate-200"
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
