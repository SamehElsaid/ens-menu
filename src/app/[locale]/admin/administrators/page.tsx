"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { IoAddOutline } from "react-icons/io5";
import { FaHistory } from "react-icons/fa";
import { toast } from "react-toastify";
import { FiAlertTriangle } from "react-icons/fi";
import { axiosGet, axiosDelete } from "@/shared/axiosCall";
import { useAppSelector } from "@/store/hooks";
import {
  Badge,
  Button,
  ButtonLink,
  ConfirmDialog,
  DataTable,
  EmptyState,
  PageHeader,
  PageShell,
  Pagination,
  StatCard,
  StatGrid,
  type DataColumn,
} from "@/components/ui";
import AddAdministratorModal from "@/components/Dashboard/AddAdministratorModal";
import EditAdministratorPermissionsModal from "@/components/Admin/EditAdministratorPermissionsModal";
import {
  getAdminPermissionsByEmail,
  removeAdminPermissionsByEmail,
} from "@/lib/adminPermissions";
import { ADMIN_PERMISSION_KEYS } from "@/types/AdminPermission";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

interface Administrator {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
  profileImage: string | null;
  [key: string]: unknown;
}

interface AdminsResponse {
  admins: Administrator[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  statistics?: {
    totalAdmins: number;
    lastLoginOfAdmin: string | null;
  };
}

export default function AdministratorsPage() {
  const locale = useLocale();
  const t = useTranslations("adminAdministrators");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");

  const currentUser = useAppSelector((state) => state.auth.data) as unknown as {
    user?: { email?: string };
  };
  const currentUserEmail = currentUser?.user?.email || "";
  const { has: hasAdminPermission } = useAdminPermissions();
  const canManageAdmins = hasAdminPermission("administrators");

  const [admins, setAdmins] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    lastLogin: null as string | null,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    admin: Administrator | null;
  }>({ isOpen: false, admin: null });
  const [permissionsModal, setPermissionsModal] = useState<{
    open: boolean;
    admin: Administrator | null;
  }>({ open: false, admin: null });
  const [loadingAdminId, setLoadingAdminId] = useState<number | null>(null);

  const fetchAdmins = useCallback(
    async (pageNum: number = 1) => {
      try {
        setLoading(true);
        const params: Record<string, unknown> = {
          page: pageNum,
          limit: 10,
        };

        const result = await axiosGet<AdminsResponse>(
          "/admin/admins",
          locale,
          undefined,
          params,
        );

        if (result.status && result.data) {
          setAdmins(result.data.admins || []);
          setTotalItems(result.data.pagination?.totalItems || 0);
          setTotalPages(result.data.pagination?.totalPages || 1);
          setItemsPerPage(result.data.pagination?.itemsPerPage || 10);
          setStats({
            total:
              result.data.statistics?.totalAdmins ||
              result.data.admins?.length ||
              0,
            lastLogin: result.data.statistics?.lastLoginOfAdmin || null,
          });
        } else {
          toast.error(t("error"));
        }
      } catch (err) {
        console.error("Error fetching administrators:", err);
        toast.error(t("error"));
      } finally {
        setLoading(false);
      }
    },
    [locale, t],
  );

  useEffect(() => {
    fetchAdmins(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, locale]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteModal.admin) return;

    const adminId = deleteModal.admin.id;
    setLoadingAdminId(adminId);
    try {
      const result = await axiosDelete<{ message?: string }>(
        `/admin/admins/${adminId}`,
        locale,
      );

      if (result.status) {
        removeAdminPermissionsByEmail(deleteModal.admin.email);
        toast.success(t("deleteSuccess"));
        setDeleteModal({ isOpen: false, admin: null });
        // If current page will be empty after deletion, go to previous page
        if (admins.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchAdmins(page);
        }
      } else {
        toast.error(t("deleteError"));
      }
    } catch (err) {
      console.error("Error deleting administrator:", err);
      toast.error(t("deleteError"));
    } finally {
      setLoadingAdminId(null);
    }
  }, [deleteModal.admin, locale, t, fetchAdmins, admins.length, page]);

  const formatDate = useCallback(
    (dateString?: string | null) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(date);
    },
    [locale],
  );

  const columns = useMemo<DataColumn<Administrator>[]>(
    () => [
      {
        id: "index",
        header: "#",
        hideOnMobile: true,
        numeric: true,
        headerClassName: "w-px",
        cell: (row) => (
          <span className="ui-figure text-fg-subtle" lang="en">
            {String(
              (page - 1) * itemsPerPage +
                admins.findIndex((a) => a.id === row.id) +
                1,
            ).padStart(2, "0")}
          </span>
        ),
      },
      {
        id: "name",
        header: t("columns.name"),
        primary: true,
        cell: (row) => (
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-fg">{row.name}</span>
            {row.email === currentUserEmail ? (
              <Badge tone="brand" dot>
                {t("you")}
              </Badge>
            ) : null}
          </span>
        ),
      },
      {
        id: "email",
        header: t("columns.email"),
        cell: (row) => (
          <span className="truncate font-mono text-[12px] text-fg-muted" dir="ltr">
            {row.email}
          </span>
        ),
      },
      {
        id: "createdAt",
        header: t("columns.dateAdded"),
        numeric: true,
        cell: (row) => (
          <span className="ui-figure text-[12px] text-fg-muted" lang="en">
            {formatDate(row.createdAt) || "—"}
          </span>
        ),
      },
      {
        id: "lastLoginAt",
        header: t("columns.lastLogin"),
        numeric: true,
        cell: (row) => (
          <span className="ui-figure text-[12px] text-fg-muted" lang="en">
            {row.lastLoginAt ? formatDate(row.lastLoginAt) : "—"}
          </span>
        ),
      },
      {
        id: "permissions",
        header: t("columns.permissions"),
        cell: (row) => {
          const stored = getAdminPermissionsByEmail(row.email);
          const isFull =
            !stored || stored.length >= ADMIN_PERMISSION_KEYS.length;
          return (
            <Badge tone={isFull ? "brand" : "neutral"} dot>
              {isFull
                ? t("permissions.fullAccess")
                : t("permissions.limited", { count: stored?.length ?? 0 })}
            </Badge>
          );
        },
      },
    ],
    [t, currentUserEmail, formatDate, page, itemsPerPage, admins],
  );

  const rangeFrom = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const rangeTo = Math.min(page * itemsPerPage, totalItems || admins.length);

  /**
   * The roster as an instrument panel.
   *
   * The two figures lead as an edge-sharing rail, the actions that used to
   * float in their own centred row moved into the page header where the
   * page's verbs belong, and the roster itself is one ruled table that
   * becomes a labelled card per administrator below `md`.
   */
  return (
    <PageShell
      kind="detail"
      header={
        <>
          <PageHeader
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={[
              { label: tAdmin("title"), href: "/admin" },
              { label: t("title") },
            ]}
            breadcrumbsLabel={tCommon("breadcrumb")}
            actions={
              canManageAdmins ? (
                <>
                  <ButtonLink
                    href="/admin/administrators/log"
                    variant="secondary"
                    startIcon={<FaHistory />}
                  >
                    {t("viewActivityLog")}
                  </ButtonLink>
                  <Button
                    startIcon={<IoAddOutline />}
                    onClick={() => setShowAddModal(true)}
                  >
                    {t("addNewAdmin")}
                  </Button>
                </>
              ) : null
            }
          />

          <StatGrid columns={2} ruled>
            <StatCard
              label={t("totalAdmins")}
              value={
                <span lang="en">{stats.total.toLocaleString("en-US")}</span>
              }
              loading={loading}
            />
            <StatCard
              label={t("lastLogin")}
              value={
                <span lang="en">
                  {stats.lastLogin ? formatDate(stats.lastLogin) : "—"}
                </span>
              }
              loading={loading}
            />
          </StatGrid>
        </>
      }
      footer={
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={loading}
          summary={
            totalItems > 0
              ? tCommon("paginationInfo", {
                  from: rangeFrom,
                  to: rangeTo,
                  total: totalItems,
                })
              : undefined
          }
          labels={{
            region: tCommon("pagination"),
            previous: tCommon("previousPage"),
            next: tCommon("nextPage"),
            page: (n) => tCommon("goToPage", { page: n }),
          }}
        />
      }
    >
      {/* A six-column roster of a handful of people does not need the full
          ledger width, so this page takes the narrower detail measure — the
          alternative was six columns stretched across 1900px. */}
      <DataTable<Administrator>
        columns={columns}
        rows={admins}
        getRowKey={(row) => String(row.id)}
        caption={t("title")}
        loading={loading}
        skeletonRows={itemsPerPage}
        empty={
          <EmptyState
            title={tCommon("noResultsTitle")}
            size="sm"
            action={
              canManageAdmins ? (
                <Button
                  size="sm"
                  startIcon={<IoAddOutline />}
                  onClick={() => setShowAddModal(true)}
                >
                  {t("addNewAdmin")}
                </Button>
              ) : undefined
            }
          />
        }
        rowActions={
          canManageAdmins
            ? (row) => (
                <span className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setPermissionsModal({ open: true, admin: row })
                    }
                  >
                    {t("actions.permissions")}
                  </Button>
                  {row.email !== currentUserEmail ? (
                    <Button
                      variant="dangerGhost"
                      size="sm"
                      onClick={() => setDeleteModal({ isOpen: true, admin: row })}
                      disabled={loadingAdminId === row.id}
                      loading={loadingAdminId === row.id}
                    >
                      {t("actions.delete")}
                    </Button>
                  ) : null}
                </span>
              )
            : undefined
        }
      />

      {showAddModal && (
        <AddAdministratorModal
          onClose={() => setShowAddModal(false)}
          onRefresh={() => fetchAdmins(page)}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, admin: null })}
        onConfirm={handleDelete}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirm", {
          name: deleteModal.admin?.name || "",
        })}
        confirmLabel={t("actions.delete")}
        cancelLabel={t("actions.cancel")}
        loading={loadingAdminId === deleteModal.admin?.id}
        tone="danger"
        icon={<FiAlertTriangle />}
      />

      <EditAdministratorPermissionsModal
        open={permissionsModal.open}
        admin={permissionsModal.admin}
        isCurrentUser={permissionsModal.admin?.email === currentUserEmail}
        onClose={() => setPermissionsModal({ open: false, admin: null })}
      />
    </PageShell>
  );
}
