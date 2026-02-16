"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { ColDef } from "ag-grid-community";
import { FaBan, FaUserCheck, FaSpinner } from "react-icons/fa";
import { IoArrowBack, IoSearchOutline, IoRefreshOutline } from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import { axiosGet, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";

interface User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string | null;
    country: string | null;
    profileImage: string | null;
    createdAt: string;
    lastLoginAt: string | null;
    isSuspended: boolean;
    suspendedAt: string | null;
    suspendedReason: string | null;
    planName: string;
    subscriptionStatus: string;
    startDate: string;
    endDate: string | null;
    billingCycle: string;
    menusCount: number;
}

interface UsersResponse {
    users: User[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
    stats: {
        totalUsers: number;
        activeUsers: number;
        suspendedUsers: number;
    };
}

export default function UsersPage() {
    const locale = useLocale();
    const t = useTranslations("adminUsers");
    const router = useRouter();
    const isRTL = locale === "ar";

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [suspended, setSuspended] = useState(0);
    const [active, setActive] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

    const fetchUsers = useCallback(async (pageNum: number = 1, search: string = "") => {
        try {
            setLoading(true);
            const params: Record<string, unknown> = {
                page: pageNum,
                limit: 10,
            };
            if (search) {
                params.search = search;
            }

            const result = await axiosGet<UsersResponse>("/admin/users", locale, undefined, params);

            if (result.status && result.data) {
                setUsers(result.data.users || []);
                setTotal(result.data.pagination?.totalItems || 0);
                setTotalPages(result.data.pagination?.totalPages || 1);
                setItemsPerPage(result.data.pagination?.itemsPerPage || 10);
                setSuspended(result.data.stats?.suspendedUsers || 0);
                setActive(result.data.stats?.activeUsers || 0);
            } else {
                toast.error(t("error"));
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            toast.error(t("error"));
        } finally {
            setLoading(false);
        }
    }, [locale, t]);

    useEffect(() => {
        fetchUsers(page, searchQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, locale]);

    const handleSearch = useCallback(() => {
        setPage(1);
        fetchUsers(1, searchQuery);
    }, [searchQuery, fetchUsers]);

    const handleReset = useCallback(() => {
        setSearchQuery("");
        setPage(1);
        fetchUsers(1, "");
    }, [fetchUsers]);

    const handleSuspend = useCallback(async (userId: string) => {
        const userIdNum = parseInt(userId, 10);
        setLoadingUserId(userIdNum);
        try {
            const payload = { isSuspended: true };
            const result = await axiosPatch<typeof payload, User>(
                `/admin/users/${userId}/suspend`,
                locale,
                payload
            );
            
            if (result.status && result.data) {
                // Update local state instead of refetching
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userIdNum 
                            ? { ...user, isSuspended: true }
                            : user
                    )
                );
                // Update stats
                setSuspended(prev => prev + 1);
                setActive(prev => Math.max(0, prev - 1));
                toast.success(t("suspendSuccess"));
            } else {
                toast.error(t("suspendError"));
            }
        } catch (err) {
            console.error("Error suspending user:", err);
            toast.error(t("suspendError"));
        } finally {
            setLoadingUserId(null);
        }
    }, [t, locale]);

    const handleActivate = useCallback(async (userId: string) => {
        const userIdNum = parseInt(userId, 10);
        setLoadingUserId(userIdNum);
        try {
            const payload = { isSuspended: false };
            const result = await axiosPatch<typeof payload, User>(
                `/admin/users/${userId}/suspend`,
                locale,
                payload
            );
            
            if (result.status && result.data) {
                // Update local state instead of refetching
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user.id === userIdNum 
                            ? { ...user, isSuspended: false }
                            : user
                    )
                );
                // Update stats
                setActive(prev => prev + 1);
                setSuspended(prev => Math.max(0, prev - 1));
                toast.success(t("activateSuccess"));
            } else {
                toast.error(t("activateError"));
            }
        } catch (err) {
            console.error("Error activating user:", err);
            toast.error(t("activateError"));
        } finally {
            setLoadingUserId(null);
        }
    }, [t, locale]);

    const columnDefs: ColDef<User>[] = useMemo(
        () => [
            {
                headerName: t("columns.name"),
                field: "name",
                flex: 1,
                minWidth: 150,
            },
            {
                headerName: t("columns.email"),
                field: "email",
                flex: 1,
                minWidth: 200,
            },
            {
                headerName: t("columns.plan"),
                field: "planName",
                width: 120,
            },
            {
                headerName: t("columns.status"),
                field: "isSuspended",
                width: 120,
                cellRenderer: (params: { value: boolean }) => {
                    const isSuspended = params.value || false;
                    const isActive = !isSuspended;
                    return (
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                        >
                            {isActive ? t("status.active") : t("status.suspended")}
                        </span>
                    );
                },
            },
            {
                headerName: t("columns.actions"),
                width: 180,
                cellRenderer: (params: { data: User }) => {
                    const user = params.data;
                    const isActive = !user.isSuspended;
                    const isLoading = loadingUserId === user.id;
                    return (
                        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                            <button
                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                                {t("actions.view")}
                            </button>
                            <button
                                onClick={() =>
                                    isActive ? handleSuspend(user.id.toString()) : handleActivate(user.id.toString())
                                }
                                disabled={isLoading}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative inline-flex items-center justify-center gap-1.5 min-w-[80px] ${
                                    isActive
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin text-xs" />
                                    </>
                                ) : (
                                    isActive ? t("actions.suspend") : t("status.active")
                                )}
                            </button>
                        </div>
                    );
                },
            },
        ],
        [t, isRTL, router, handleSuspend, handleActivate, loadingUserId]
    );

    const showingFrom = page === 1 ? 1 : (page - 1) * itemsPerPage + 1;
    const showingTo = Math.min(page * itemsPerPage, total);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className={`flex items-center gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <button
                            onClick={() => router.back()}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isRTL ? "flex-row-reverse" : ""
                                }`}
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

            {/* Search Input */}
            <CardDashBoard>
                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="flex-1 relative">
                        <IoSearchOutline
                            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 text-xl ${isRTL ? "right-4" : "left-4"
                                }`}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            placeholder={t("searchPlaceholder")}
                            className={`w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isRTL ? "text-right" : "text-left"
                                }`}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="h-12 px-6 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                        {t("search")}
                    </button>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="h-12 inline-flex items-center gap-2 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <IoRefreshOutline className="text-lg" />
                            {t("reset")}
                        </button>
                    )}
                </div>
            </CardDashBoard>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CardDashBoard borderColor="border-red-200 dark:border-red-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                            <FaBan className="text-red-600 dark:text-red-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                {t("suspendedUsers")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {suspended}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>

                <CardDashBoard borderColor="border-green-200 dark:border-green-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                            <FaUserCheck className="text-green-600 dark:text-green-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                {t("activeUsers")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {active}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>

                <CardDashBoard borderColor="border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <FaUserCheck className="text-blue-600 dark:text-blue-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                {t("totalUsers")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {total}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>
            </div>

            {/* Users Table */}
            <CardDashBoard>
                <DataTable<User>
                    rowData={users}
                    columnDefs={columnDefs}
                    loading={loading}
                    locale={locale}
                    showRowNumbers={true}
                    pagination={true}
                    paginationPageSize={itemsPerPage}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(page) => setPage(page)}
                />
                {!loading && total > 0 && (
                    <div className={`mt-4 text-sm text-slate-500 dark:text-slate-400 ${isRTL ? "text-right" : "text-left"
                        }`}>
                        {t("showing", { from: showingFrom, to: showingTo, total })}
                    </div>
                )}
            </CardDashBoard>
        </div>
    );
}
