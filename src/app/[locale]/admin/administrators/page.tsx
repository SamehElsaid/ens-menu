"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { ColDef } from "ag-grid-community";
import { IoArrowBack, IoAddOutline } from "react-icons/io5";
import { FaSpinner, FaUserShield, FaClock } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import { axiosGet, axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import AddAdministratorModal from "@/components/Dashboard/AddAdministratorModal";

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
                headerName: t("columns.actions"),
                width: 100,
                cellRenderer: (params: { data: Administrator }) => {
                    const admin = params.data;
                    if (!admin) return null;
                    const isCurrentUser = admin.email === currentUserEmail;
                    const isLoading = loadingAdminId === admin.id;

                    if (isCurrentUser) {
                        return null; // Don't show delete for current user
                    }

                    return (
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <button
                                onClick={() => setDeleteModal({ isOpen: true, admin })}
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                                {isLoading ? (
                                    <FaSpinner className="animate-spin text-xs" />
                                ) : (
                                    t("actions.delete")
                                )}
                            </button>
                        </div>
                    );
                },
            },
        ],
        [t, isRTL, currentUserEmail, loadingAdminId, formatDate]
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className={`flex items-center gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <button
                            onClick={() => router.back()}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
                        >
                            <IoArrowBack className="text-lg" />
                            <span className="font-medium">{t("back")}</span>
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        {t("title")}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {t("subtitle")}
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CardDashBoard borderColor="border-blue-200 dark:border-blue-500/20" hover={true}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-500/20 dark:to-blue-600/10 flex items-center justify-center shadow-sm">
                            <FaUserShield className="text-blue-600 dark:text-blue-400 text-xl" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                                {t("totalAdmins")}
                            </p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-all duration-300">
                                {loading ? (
                                    <span className="inline-block w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    stats.total.toLocaleString()
                                )}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>

                <CardDashBoard borderColor="border-purple-200 dark:border-purple-500/20" hover={true}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-500/20 dark:to-purple-600/10 flex items-center justify-center shadow-sm">
                            <FaClock className="text-purple-600 dark:text-purple-400 text-xl" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                                {t("lastLogin")}
                            </p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 transition-all duration-300">
                                {loading ? (
                                    <span className="inline-block w-6 h-6 border-2 border-purple-300 dark:border-purple-600 border-t-transparent rounded-full animate-spin"></span>
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
            <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <IoAddOutline className="text-lg" />
                    <span>{t("addNewAdmin")}</span>
                </button>
            </div>

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
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, admin: null })}
                onConfirm={handleDelete}
                title={t("deleteConfirmTitle")}
                message={t("deleteConfirm", { name: deleteModal.admin?.name || "" })}
                confirmText={t("actions.delete")}
                cancelText={t("actions.cancel")}
                isLoading={loadingAdminId === deleteModal.admin?.id}
                loadingText={t("deleting")}
            />
        </div>
    );
}
