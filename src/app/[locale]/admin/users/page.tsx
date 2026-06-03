"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ColDef } from "ag-grid-community";
import { FaBan, FaUserCheck, FaSpinner, FaTrash } from "react-icons/fa";
import { IoArrowBack, IoSearchOutline, IoRefreshOutline } from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import { axiosGet, axiosPatch, axiosDelete } from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import { toast } from "react-toastify";

type UserFilter =
    | "all"
    | "active"
    | "suspended"
    | "trial"
    | "free"
    | "pro"
    | "no-menu"
    | "inactive";

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
        freeUsers?: number;
        proUsers?: number;
        usersWithoutMenu?: number;
    };
}

export default function UsersPage() {
    const locale = useLocale();
    const t = useTranslations("adminUsers");
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRTL = locale === "ar";
    const textDir = isRTL ? "rtl" : "ltr";

    const initialFilter = (searchParams.get("filter") as UserFilter) || "all";
    const [planFilter, setPlanFilter] = useState<UserFilter>(
        ["all", "active", "suspended", "trial", "free", "pro", "no-menu", "inactive"].includes(
            initialFilter,
        )
            ? initialFilter
            : "all",
    );

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [suspended, setSuspended] = useState(0);
    const [active, setActive] = useState(0);
    const [freeUsers, setFreeUsers] = useState(0);
    const [proUsers, setProUsers] = useState(0);
    const [usersWithoutMenu, setUsersWithoutMenu] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        user: User | null;
    }>({ isOpen: false, user: null });

    const applyFilter = useCallback(
        (filter: UserFilter) => {
            setPlanFilter(filter);
            setPage(1);
            const path =
                filter === "all" ? "/admin/users" : `/admin/users?filter=${filter}`;
            router.replace(path);
        },
        [router],
    );

    const fetchUsers = useCallback(async (
        pageNum: number = 1,
        search: string = "",
        filter: UserFilter = "all",
    ) => {
        try {
            setLoading(true);
            const params: Record<string, unknown> = {
                page: pageNum,
                limit: 10,
            };
            if (search) {
                params.search = search;
            }
            if (filter !== "all") {
                params.filter = filter;
            }

            const result = await axiosGet<UsersResponse>("/admin/users", locale, undefined, params);

            if (result.status && result.data) {
                setUsers(result.data.users || []);
                setTotal(result.data.pagination?.totalItems || 0);
                setTotalUsersCount(result.data.stats?.totalUsers || 0);
                setTotalPages(result.data.pagination?.totalPages || 1);
                setItemsPerPage(result.data.pagination?.itemsPerPage || 10);
                setSuspended(result.data.stats?.suspendedUsers || 0);
                setActive(result.data.stats?.activeUsers || 0);
                setFreeUsers(result.data.stats?.freeUsers ?? 0);
                setProUsers(result.data.stats?.proUsers ?? 0);
                setUsersWithoutMenu(result.data.stats?.usersWithoutMenu ?? 0);
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
        const urlFilter = (searchParams.get("filter") as UserFilter) || "all";
        const nextFilter = [
            "all",
            "active",
            "suspended",
            "trial",
            "free",
            "pro",
            "no-menu",
            "inactive",
        ].includes(urlFilter)
            ? urlFilter
            : "all";
        setPlanFilter(nextFilter);
    }, [searchParams]);

    useEffect(() => {
        fetchUsers(page, searchQuery, planFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, locale, planFilter]);

    const handleSearch = useCallback(() => {
        setPage(1);
        fetchUsers(1, searchQuery, planFilter);
    }, [searchQuery, fetchUsers, planFilter]);

    const handleReset = useCallback(() => {
        setSearchQuery("");
        setPlanFilter("all");
        setPage(1);
        router.replace("/admin/users");
        fetchUsers(1, "", "all");
    }, [fetchUsers, router]);

    const handleDelete = useCallback(async () => {
        if (!deleteModal.user) return;

        const userId = deleteModal.user.id;
        setLoadingUserId(userId);
        try {
            const result = await axiosDelete<{ message?: string }>(
                `/admin/users/${userId}`,
                locale,
            );

            if (result.status) {
                toast.success(t("deleteSuccess"));
                setDeleteModal({ isOpen: false, user: null });
                if (users.length === 1 && page > 1) {
                    setPage(page - 1);
                } else {
                    fetchUsers(page, searchQuery, planFilter);
                }
            } else {
                toast.error(t("deleteError"));
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            toast.error(t("deleteError"));
        } finally {
            setLoadingUserId(null);
        }
    }, [
        deleteModal.user,
        locale,
        t,
        fetchUsers,
        users.length,
        page,
        searchQuery,
        planFilter,
    ]);

    const filterOptions: UserFilter[] = [
        "all",
        "active",
        "suspended",
        "free",
        "pro",
        "trial",
        "no-menu",
        "inactive",
    ];

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
                width: 100,
            },
            {
                headerName: t("columns.subscriptionStatus"),
                field: "subscriptionStatus",
                width: 120,
                cellRenderer: (params: { value: string | undefined }) => (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">
                        {params.value || "—"}
                    </span>
                ),
            },
            {
                headerName: t("columns.menusCount"),
                field: "menusCount",
                width: 100,
                cellRenderer: (params: { value: number | undefined }) => {
                    const count = params.value ?? 0;
                    return (
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {count}
                        </span>
                    );
                },
            },
            {
                headerName: t("columns.createdAt"),
                field: "createdAt",
                width: 120,
                cellRenderer: (params: { value: string | undefined }) =>
                    formatAdminDate(params.value, locale),
            },
            {
                headerName: t("columns.lastLogin"),
                field: "lastLoginAt",
                width: 120,
                cellRenderer: (params: { value: string | null | undefined }) =>
                    formatAdminDate(params.value, locale),
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
                width: 260,
                cellRenderer: (params: { data: User }) => {
                    const user = params.data;
                    const isActive = !user.isSuspended;
                    const isLoading = loadingUserId === user.id;
                    return (
                        <div className={`flex items-center gap-1.5 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
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
                                    isActive ? t("actions.suspend") : t("actions.reactivate")
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteModal({ isOpen: true, user })
                                }
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                                <FaTrash className="text-[10px]" />
                                {t("actions.delete")}
                            </button>
                        </div>
                    );
                },
            },
        ],
        [t, isRTL, router, handleSuspend, handleActivate, loadingUserId]
    );

    const statCards: {
        filter: UserFilter;
        label: string;
        value: number;
        icon: typeof FaBan;
        borderColor: string;
        iconBg: string;
        iconColor: string;
    }[] = [
        {
            filter: "suspended",
            label: t("suspendedUsers"),
            value: suspended,
            icon: FaBan,
            borderColor: "border-red-200 dark:border-red-500/20",
            iconBg: "bg-red-50 dark:bg-red-500/10",
            iconColor: "text-red-600 dark:text-red-400",
        },
        {
            filter: "active",
            label: t("activeUsers"),
            value: active,
            icon: FaUserCheck,
            borderColor: "border-green-200 dark:border-green-500/20",
            iconBg: "bg-green-50 dark:bg-green-500/10",
            iconColor: "text-green-600 dark:text-green-400",
        },
        {
            filter: "all",
            label: t("totalUsers"),
            value: totalUsersCount,
            icon: FaUserCheck,
            borderColor: "border-blue-200 dark:border-blue-500/20",
            iconBg: "bg-blue-50 dark:bg-blue-500/10",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
            filter: "pro",
            label: t("proUsers"),
            value: proUsers,
            icon: FaUserCheck,
            borderColor: "border-purple-200 dark:border-purple-500/20",
            iconBg: "bg-purple-50 dark:bg-purple-500/10",
            iconColor: "text-purple-600 dark:text-purple-400",
        },
        {
            filter: "free",
            label: t("freeUsers"),
            value: freeUsers,
            icon: FaUserCheck,
            borderColor: "border-slate-200 dark:border-slate-600",
            iconBg: "bg-slate-50 dark:bg-slate-500/10",
            iconColor: "text-slate-600 dark:text-slate-400",
        },
        {
            filter: "no-menu",
            label: t("usersWithoutMenu"),
            value: usersWithoutMenu,
            icon: FaUserCheck,
            borderColor: "border-amber-200 dark:border-amber-500/20",
            iconBg: "bg-amber-50 dark:bg-amber-500/10",
            iconColor: "text-amber-600 dark:text-amber-400",
        },
    ];

    const showingFrom = page === 1 ? 1 : (page - 1) * itemsPerPage + 1;
    const showingTo = Math.min(page * itemsPerPage, total);

    return (
        <div className="space-y-6" dir={textDir}>
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

            <CardDashBoard>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    {t("filters.label")}
                </p>
                <div className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {filterOptions.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => applyFilter(filter)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                planFilter === filter
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            {t(`filters.${filter}`)}
                        </button>
                    ))}
                </div>
            </CardDashBoard>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    const isSelected = planFilter === card.filter;
                    return (
                        <button
                            key={card.filter}
                            type="button"
                            onClick={() => applyFilter(card.filter)}
                            className="text-left w-full"
                        >
                            <CardDashBoard
                                borderColor={
                                    isSelected
                                        ? "border-primary ring-2 ring-primary/30"
                                        : card.borderColor
                                }
                                className={`transition-all hover:shadow-md cursor-pointer ${isSelected ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.iconBg}`}
                                    >
                                        <Icon className={`${card.iconColor} text-xl`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                            {card.label}
                                        </p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                                            {card.value}
                                        </p>
                                    </div>
                                </div>
                            </CardDashBoard>
                        </button>
                    );
                })}
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

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, user: null })}
                onConfirm={handleDelete}
                title={t("deleteConfirmTitle")}
                message={t("deleteConfirm", {
                    name: deleteModal.user?.name || "",
                })}
                confirmText={t("actions.delete")}
                cancelText={t("cancel")}
                isLoading={loadingUserId === deleteModal.user?.id}
            />
        </div>
    );
}
