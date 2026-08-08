"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { ColDef } from "ag-grid-community";
import { IoArrowBack, IoAddOutline } from "react-icons/io5";
import { FaUserShield, FaClock, FaHistory } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import { axiosGet, axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  ButtonLink,
  ConfirmDialog,
  PageHeader,
  Spinner,
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
    const router = useRouter();
    const isRTL = locale === "ar";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const fetchAdmins = useCallback(async (pageNum: number = 1) => {
        try {
            setLoading(true);
            const params: Record<string, unknown> = {
                page: pageNum,
                limit: 10,
            };

            const result = await axiosGet<AdminsResponse>("/admin/admins", locale, undefined, params);

            if (result.status && result.data) {
                setAdmins(result.data.admins || []);
                setTotalItems(result.data.pagination?.totalItems || 0);
                setTotalPages(result.data.pagination?.totalPages || 1);
                setItemsPerPage(result.data.pagination?.itemsPerPage || 10);
                setStats({
                    total: result.data.statistics?.totalAdmins || result.data.admins?.length || 0,
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
    }, [locale, t]);

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
                locale
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

    const formatDate = useCallback((dateString?: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        }).format(date);
    }, [locale]);

    const columnDefs: ColDef<Administrator>[] = useMemo(
        () => [
            {
                headerName: t("columns.name"),
                field: "name",
                flex: 1,
                minWidth: 200,
                cellRenderer: (params: { data: Administrator }) => {
                    const admin = params.data;
                    if (!admin) return null;
                    const isCurrentUser = admin.email === currentUserEmail;
                    return (
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                {admin.name}
                            </span>
                            {isCurrentUser && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    {t("you")}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                headerName: t("columns.email"),
                field: "email",
                flex: 1,
                minWidth: 250,
            },
            {
                headerName: t("columns.dateAdded"),
                field: "createdAt",
                width: 150,
                cellRenderer: (params: { data: Administrator }) => {
                    const admin = params.data;
                    if (!admin) return null;
                    return (
                        <span className="text-slate-600 dark:text-slate-400">
                            {formatDate(admin.createdAt)}
                        </span>
                    );
                },
            },
            {
                headerName: t("columns.lastLogin"),
                field: "lastLoginAt",
                width: 150,
                cellRenderer: (params: { data: Administrator }) => {
                    const admin = params.data;
                    if (!admin) return null;
                    return (
                        <span className="text-slate-600 dark:text-slate-400">
                            {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "—"}
                        </span>
                    );
                },
            },
            {
                headerName: t("columns.permissions"),
                width: 130,
                cellRenderer: (params: { data: Administrator }) => {
                    const admin = params.data;
                    if (!admin) return null;
                    const stored = getAdminPermissionsByEmail(admin.email);
                    const label =
                        !stored || stored.length >= ADMIN_PERMISSION_KEYS.length
                            ? t("permissions.fullAccess")
                            : t("permissions.limited", { count: stored.length });
                    return (
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {label}
                        </span>
                    );
                },
            },
            {
                headerName: t("columns.actions"),
                width: 180,
                cellRenderer: (params: { data: Administrator }) => {
                    const admin = params.data;
                    if (!admin) return null;
                    const isCurrentUser = admin.email === currentUserEmail;
                    const isLoading = loadingAdminId === admin.id;

                    return (
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                            {canManageAdmins && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                        setPermissionsModal({ open: true, admin })
                                    }
                                >
                                    {t("actions.permissions")}
                                </Button>
                            )}
                            {!isCurrentUser && canManageAdmins && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setDeleteModal({ isOpen: true, admin })}
                                    disabled={isLoading}
                                    loading={isLoading}
                                >
                                    {t("actions.delete")}
                                </Button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [t, isRTL, currentUserEmail, loadingAdminId, formatDate, canManageAdmins]
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("title")}
                description={t("subtitle")}
                actions={
                    <Button
                        variant="secondary"
                        startIcon={<IoArrowBack className="rtl:rotate-180" />}
                        onClick={() => router.back()}
                    >
                        {t("back")}
                    </Button>
                }
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CardDashBoard borderColor="border-blue-200 dark:border-blue-500/20" hover={true}>
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-xl bg-info-soft">
                            <FaUserShield className="text-xl text-info-fg" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                                {t("totalAdmins")}
                            </p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-all duration-300">
                                {loading ? (
                                    <Spinner size="md" />
                                ) : (
                                    stats.total.toLocaleString()
                                )}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>

                <CardDashBoard borderColor="border-purple-200 dark:border-purple-500/20" hover={true}>
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-xl bg-brand-soft">
                            <FaClock className="text-xl text-brand-soft-fg" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                                {t("lastLogin")}
                            </p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 transition-all duration-300">
                                {loading ? (
                                    <Spinner size="sm" />
                                ) : stats.lastLogin ? (
                                    formatDate(stats.lastLogin)
                                ) : (
                                    "—"
                                )}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>
            </div>

            {/* Add New Administrator Button */}
            {canManageAdmins && (
                <div className={`flex flex-wrap items-center gap-3 ${isRTL ? "justify-start" : "justify-end"}`}>
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
                </div>
            )}

            {/* Administrators Table */}
            <CardDashBoard>
                <DataTable<Administrator>
                    rowData={admins}
                    columnDefs={columnDefs}
                    loading={loading}
                    locale={locale}
                    showRowNumbers={true}
                    pagination={true}
                    page={page}
                    totalPages={totalPages}
                    paginationPageSize={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            </CardDashBoard>

            {/* Add Administrator Modal */}
            {showAddModal && (
                <AddAdministratorModal
                    onClose={() => setShowAddModal(false)}
                    onRefresh={() => fetchAdmins(page)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                open={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, admin: null })}
                onConfirm={handleDelete}
                title={t("deleteConfirmTitle")}
                description={t("deleteConfirm", { name: deleteModal.admin?.name || "" })}
                confirmLabel={t("actions.delete")}
                cancelLabel={t("actions.cancel")}
                loading={loadingAdminId === deleteModal.admin?.id}
                tone="danger"
                icon={<FiAlertTriangle />}
            />

            <EditAdministratorPermissionsModal
                open={permissionsModal.open}
                admin={permissionsModal.admin}
                isCurrentUser={
                    permissionsModal.admin?.email === currentUserEmail
                }
                onClose={() => setPermissionsModal({ open: false, admin: null })}
            />
        </div>
    );
}
