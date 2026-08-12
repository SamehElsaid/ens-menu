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
import {
  Button,
  ButtonLink,
  CountBadge,
  EmptyState,
  PageShell,
  Tabs,
} from "@/components/ui";
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
      <EmptyState
        icon={<IoPeopleOutline aria-hidden />}
        title={t("proOnlyTitle")}
        description={t("proOnlyDescription")}
        action={
          <ButtonLink href="/dashboard/subscription">
            {t("upgradeShort")}
          </ButtonLink>
        }
      />
    );
  }

  return (
    <PageShell
      kind="wide"
      header={
        <PageTitleWithHelp
          className="dashboard-staff-header"
          title={t("title")}
          description={
            activeTab === "staff" ? t("subtitle") : tRoles("subtitle")
          }
          actions={
            activeTab === "staff" ? (
              <Button
                type="button"
                onClick={openAddModal}
                startIcon={<IoAddCircleOutline aria-hidden />}
              >
                {t("addStaff")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={openAddRoleModal}
                startIcon={<IoAddCircleOutline aria-hidden />}
              >
                {tRoles("addRole")}
              </Button>
            )
          }
        />
      }
      /* The count belongs on the tab it describes, not beside the page title:
         one number that changes meaning when you switch tabs is worse than two
         numbers that each stay put. */
      toolbar={
        <Tabs
          className="border-b-0!"
          label={t("title")}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as "staff" | "roles")}
          items={[
            {
              id: "staff",
              label: t("tabStaff"),
              icon: <IoPeopleOutline aria-hidden />,
              badge:
                !loading && staffList.length > 0 ? (
                  <CountBadge
                    count={staffList.length}
                    tone={activeTab === "staff" ? "brand" : "neutral"}
                  />
                ) : undefined,
            },
            {
              id: "roles",
              label: t("tabRoles"),
              icon: <IoShieldCheckmarkOutline aria-hidden />,
              badge:
                !rolesLoading && roles.length > 0 ? (
                  <CountBadge
                    count={roles.length}
                    tone={activeTab === "roles" ? "brand" : "neutral"}
                  />
                ) : undefined,
            },
          ]}
        />
      }
    >
      {activeTab === "staff" ? (
        <div className="dashboard-staff-page min-w-0">
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
        <div className="min-w-0">
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
    </PageShell>
  );
}
