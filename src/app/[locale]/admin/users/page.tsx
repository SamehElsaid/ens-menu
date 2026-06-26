"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ColDef } from "ag-grid-community";
import {
  FaBan,
  FaUserCheck,
  FaSpinner,
  FaTrash,
  FaEye,
  FaStar,
  FaUsers,
  FaCrown,
  FaUser,
  FaClipboardList,
} from "react-icons/fa";
import {
  IoArrowBack,
  IoSearchOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import CustomInput from "@/components/Custom/CustomInput";
import {
  axiosGet,
  axiosPatch,
  axiosDelete,
  axiosPost,
} from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import { toast } from "react-toastify";
import LinkTo from "@/components/Global/LinkTo";

type UserFilter =
  | "all"
  | "active"
  | "suspended"
  | "trial"
  | "free"
  | "pro"
  | "no-menu"
  | "inactive"
  | "on-homepage";

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
  featuredOnHomepage?: boolean | number;
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
    usersOnHomepage?: number;
  };
}

export default function UsersPage() {
  const locale = useLocale();
  const t = useTranslations("adminUsers");
  const tAccount = useTranslations("adminUsers.userDetails.accountActions");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRTL = locale === "ar";
  const textDir = isRTL ? "rtl" : "ltr";

  const initialFilter = (searchParams.get("filter") as UserFilter) || "all";
  const [planFilter, setPlanFilter] = useState<UserFilter>(
    [
      "all",
      "active",
      "suspended",
      "trial",
      "free",
      "pro",
      "no-menu",
      "inactive",
      "on-homepage",
    ].includes(initialFilter)
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
  const [usersOnHomepage, setUsersOnHomepage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });
  const [suspendModal, setSuspendModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });
  const [reactivateModal, setReactivateModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });
  const [suspendReason, setSuspendReason] = useState("");

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

  const fetchUsers = useCallback(
    async (
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

        const result = await axiosGet<UsersResponse>(
          "/admin/users",
          locale,
          undefined,
          params,
        );

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
          setUsersOnHomepage(result.data.stats?.usersOnHomepage ?? 0);
        } else {
          toast.error(t("error"));
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error(t("error"));
      } finally {
        setLoading(false);
      }
    },
    [locale, t],
  );

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
      "on-homepage",
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
    "on-homepage",
  ];

  const isFeaturedOnHomepage = (user: User) =>
    user.featuredOnHomepage === true || user.featuredOnHomepage === 1;

  const handleRemoveFromHomepage = useCallback(
    async (user: User) => {
      setLoadingUserId(user.id);
      try {
        const result = await axiosDelete<{ success?: boolean }>(
          `/admin/users/${user.id}/feature-on-homepage`,
          locale,
        );

        if (result.status) {
          toast.success(t("removeFromHomepageSuccess"));
          if (planFilter === "on-homepage" && users.length === 1 && page > 1) {
            setPage(page - 1);
          } else {
            fetchUsers(page, searchQuery, planFilter);
          }
        } else {
          toast.error(t("removeFromHomepageError"));
        }
      } catch (err) {
        console.error("Error removing user from homepage:", err);
        toast.error(t("removeFromHomepageError"));
      } finally {
        setLoadingUserId(null);
      }
    },
    [locale, t, fetchUsers, page, searchQuery, planFilter, users.length],
  );

  const handleAddToHomepage = useCallback(
    async (user: User) => {
      setLoadingUserId(user.id);
      try {
        const result = await axiosPost<
          Record<string, never>,
          { success?: boolean }
        >(`/admin/users/${user.id}/feature-on-homepage`, locale, {});

        if (result.status) {
          toast.success(t("addToHomepageSuccess"));
          fetchUsers(page, searchQuery, planFilter);
          return;
        }

        if (result.statusCode === 409) {
          toast.info(t("alreadyOnHomepage"));
          return;
        }
        if (result.statusCode === 400) {
          toast.error(t("noMenuForHomepage"));
          return;
        }

        toast.error(t("addToHomepageError"));
      } catch (err) {
        console.error("Error adding user to homepage:", err);
        toast.error(t("addToHomepageError"));
      } finally {
        setLoadingUserId(null);
      }
    },
    [locale, t, fetchUsers, page, searchQuery, planFilter],
  );

  const handleConfirmSuspend = useCallback(async () => {
    if (!suspendModal.user) return;

    const userIdNum = suspendModal.user.id;
    setLoadingUserId(userIdNum);
    try {
      const payload: { isSuspended: boolean; reason?: string } = {
        isSuspended: true,
      };
      if (suspendReason.trim()) {
        payload.reason = suspendReason.trim();
      }
      const result = await axiosPatch<typeof payload, User>(
        `/admin/users/${userIdNum}/suspend`,
        locale,
        payload,
      );

      if (result.status && result.data) {
        const reason = suspendReason.trim() || null;
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userIdNum
              ? { ...user, isSuspended: true, suspendedReason: reason }
              : user,
          ),
        );
        setSuspended((prev) => prev + 1);
        setActive((prev) => Math.max(0, prev - 1));
        toast.success(t("suspendSuccess"));
        setSuspendModal({ isOpen: false, user: null });
        setSuspendReason("");
      } else {
        toast.error(t("suspendError"));
      }
    } catch (err) {
      console.error("Error suspending user:", err);
      toast.error(t("suspendError"));
    } finally {
      setLoadingUserId(null);
    }
  }, [suspendModal.user, suspendReason, t, locale]);

  const closeSuspendModal = useCallback(() => {
    if (loadingUserId === suspendModal.user?.id) return;
    setSuspendModal({ isOpen: false, user: null });
    setSuspendReason("");
  }, [loadingUserId, suspendModal.user?.id]);

  const handleConfirmActivate = useCallback(async () => {
    if (!reactivateModal.user) return;

    const userIdNum = reactivateModal.user.id;
    setLoadingUserId(userIdNum);
    try {
      const payload = { isSuspended: false };
      const result = await axiosPatch<typeof payload, User>(
        `/admin/users/${userIdNum}/suspend`,
        locale,
        payload,
      );

      if (result.status && result.data) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userIdNum
              ? {
                  ...user,
                  isSuspended: false,
                  suspendedReason: null,
                  suspendedAt: null,
                }
              : user,
          ),
        );
        setActive((prev) => prev + 1);
        setSuspended((prev) => Math.max(0, prev - 1));
        toast.success(t("activateSuccess"));
        setReactivateModal({ isOpen: false, user: null });
      } else {
        toast.error(t("activateError"));
      }
    } catch (err) {
      console.error("Error activating user:", err);
      toast.error(t("activateError"));
    } finally {
      setLoadingUserId(null);
    }
  }, [reactivateModal.user, t, locale]);

  const closeReactivateModal = useCallback(() => {
    if (loadingUserId === reactivateModal.user?.id) return;
    setReactivateModal({ isOpen: false, user: null });
  }, [loadingUserId, reactivateModal.user?.id]);

  const columnDefs: ColDef<User>[] = useMemo(
    () => [
      {
        headerName: t("columns.name"),
        field: "name",
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: { data: User; value: string }) => (
          <button
            type="button"
            onClick={() => router.push(`/admin/users/${params.data.id}`)}
            className="text-primary hover:underline font-medium text-start"
          >
            {params.value}
          </button>
        ),
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
            <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
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
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                isActive
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
          const featured = isFeaturedOnHomepage(user);
          const hasMenu = (user.menusCount ?? 0) > 0;
          const iconBtn =
            "p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center text-sm";
          return (
            <div className={`flex items-center gap-1 `}>
              <LinkTo
                href={`/admin/users/${user.id}`}
                title={t("actions.view")}
                aria-label={t("actions.view")}
                className={`${iconBtn} bg-blue-600 hover:bg-blue-700 text-white`}
                disabled={isLoading}
              >
                <FaEye />
              </LinkTo>
              {featured ? (
                <button
                  type="button"
                  onClick={() => handleRemoveFromHomepage(user)}
                  disabled={isLoading}
                  title={t("actions.removeFromHomepage")}
                  aria-label={t("actions.removeFromHomepage")}
                  className={`${iconBtn} bg-orange-600 hover:bg-orange-700 text-white`}
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaStar />
                  )}
                </button>
              ) : hasMenu ? (
                <button
                  type="button"
                  onClick={() => handleAddToHomepage(user)}
                  disabled={isLoading}
                  title={t("actions.addToHomepage")}
                  aria-label={t("actions.addToHomepage")}
                  className={`${iconBtn} bg-violet-600 hover:bg-violet-700 text-white`}
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaStar />
                  )}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  isActive
                    ? setSuspendModal({ isOpen: true, user })
                    : setReactivateModal({ isOpen: true, user })
                }
                disabled={isLoading}
                title={
                  isActive ? t("actions.suspend") : t("actions.reactivate")
                }
                aria-label={
                  isActive ? t("actions.suspend") : t("actions.reactivate")
                }
                className={`${iconBtn} ${
                  isActive
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : isActive ? (
                  <FaBan />
                ) : (
                  <FaUserCheck />
                )}
              </button>
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: true, user })}
                disabled={isLoading}
                title={t("actions.delete")}
                aria-label={t("actions.delete")}
                className={`${iconBtn} bg-slate-700 hover:bg-slate-800 text-white`}
              >
                <FaTrash />
              </button>
            </div>
          );
        },
      },
    ],
    [
      t,
      isRTL,
      router,
      loadingUserId,
      handleAddToHomepage,
      handleRemoveFromHomepage,
    ],
  );

  const statCards: {
    filter: UserFilter;
    label: string;
    value: number;
    icon: typeof FaBan;
    borderColor: string;
    gradient: string;
    iconColor: string;
    badgeBg: string;
  }[] = [
    {
      filter: "all",
      label: t("totalUsers"),
      value: totalUsersCount,
      icon: FaUsers,
      borderColor: "border-blue-200 dark:border-blue-500/20",
      gradient:
        "from-blue-50 to-blue-100 dark:from-blue-500/20 dark:to-blue-600/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      badgeBg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      filter: "active",
      label: t("activeUsers"),
      value: active,
      icon: FaUserCheck,
      borderColor: "border-green-200 dark:border-green-500/20",
      gradient:
        "from-green-50 to-green-100 dark:from-green-500/20 dark:to-green-600/10",
      iconColor: "text-green-600 dark:text-green-400",
      badgeBg: "bg-green-50 dark:bg-green-500/10",
    },
    {
      filter: "suspended",
      label: t("suspendedUsers"),
      value: suspended,
      icon: FaBan,
      borderColor: "border-red-200 dark:border-red-500/20",
      gradient:
        "from-red-50 to-red-100 dark:from-red-500/20 dark:to-red-600/10",
      iconColor: "text-red-600 dark:text-red-400",
      badgeBg: "bg-red-50 dark:bg-red-500/10",
    },
    {
      filter: "pro",
      label: t("proUsers"),
      value: proUsers,
      icon: FaCrown,
      borderColor: "border-purple-200 dark:border-purple-500/20",
      gradient:
        "from-purple-50 to-purple-100 dark:from-purple-500/20 dark:to-purple-600/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      badgeBg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
      filter: "free",
      label: t("freeUsers"),
      value: freeUsers,
      icon: FaUser,
      borderColor: "border-slate-200 dark:border-slate-600",
      gradient:
        "from-slate-50 to-slate-100 dark:from-slate-500/20 dark:to-slate-600/10",
      iconColor: "text-slate-600 dark:text-slate-400",
      badgeBg: "bg-slate-50 dark:bg-slate-500/10",
    },
    {
      filter: "no-menu",
      label: t("usersWithoutMenu"),
      value: usersWithoutMenu,
      icon: FaClipboardList,
      borderColor: "border-amber-200 dark:border-amber-500/20",
      gradient:
        "from-amber-50 to-amber-100 dark:from-amber-500/20 dark:to-amber-600/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      filter: "on-homepage",
      label: t("usersOnHomepage"),
      value: usersOnHomepage,
      icon: FaStar,
      borderColor: "border-violet-200 dark:border-violet-500/20",
      gradient:
        "from-violet-50 to-violet-100 dark:from-violet-500/20 dark:to-violet-600/10",
      iconColor: "text-violet-600 dark:text-violet-400",
      badgeBg: "bg-violet-50 dark:bg-violet-500/10",
    },
  ];

  const showingFrom = page === 1 ? 1 : (page - 1) * itemsPerPage + 1;
  const showingTo = Math.min(page * itemsPerPage, total);

  return (
    <div className="space-y-6" dir={textDir}>
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className={`flex items-center gap-4 mb-4 `}>
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <IoArrowBack className="text-lg" />
              <span className="font-medium">{t("back")}</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
        </div>
      </div>

      {/* Search Input */}
      <CardDashBoard>
        <div className={`flex items-center gap-3 `}>
          <div className="flex-1">
            <CustomInput
              id="admin-users-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && handleSearch()
              }
              placeholder={t("searchPlaceholder")}
              icon={<IoSearchOutline />}
              dir={textDir}
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
        <div className={`flex flex-wrap gap-2 `}>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isSelected = planFilter === card.filter;
          const sharePct =
            card.filter !== "all" && totalUsersCount > 0
              ? Math.round((card.value / totalUsersCount) * 100)
              : null;

          return (
            <button
              key={card.filter}
              type="button"
              onClick={() => applyFilter(card.filter)}
              aria-pressed={isSelected}
              className="group text-start w-full"
            >
              <CardDashBoard
                borderColor={
                  isSelected ? "border-primary" : card.borderColor
                }
                hover={!isSelected}
                className={`p-4 h-full transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10 shadow-md -translate-y-0.5"
                    : "group-hover:border-slate-300 dark:group-hover:border-slate-600"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div
                    className={`flex items-start justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-linear-to-br ${card.gradient} flex items-center justify-center shadow-sm shrink-0`}
                    >
                      <Icon className={`${card.iconColor} text-lg`} />
                    </div>
                    {sharePct !== null && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${card.badgeBg} ${card.iconColor}`}
                      >
                        {sharePct}%
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
                      {loading ? (
                        <span className="inline-block w-7 h-7 border-2 border-slate-200 dark:border-slate-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        card.value.toLocaleString(locale)
                      )}
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-snug">
                      {card.label}
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
          <div
            className={`mt-4 text-sm text-slate-500 dark:text-slate-400 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
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
        loadingText={t("loading")}
        isLoading={loadingUserId === deleteModal.user?.id}
      />

      {reactivateModal.isOpen && reactivateModal.user && (
        <div
          className="fixed m-0 p-4 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            minHeight: "100dvh",
          }}
        >
          <div
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 ${isRTL ? "text-right" : "text-left"}`}
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {tAccount("reactivateConfirmTitle")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {tAccount("reactivateConfirmMessage")}
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              {reactivateModal.user.name}
            </p>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {tAccount("suspendedReasonLabel")}
            </label>
            <div
              className="w-full px-4 py-3 border border-red-200 dark:border-red-500/30 rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-slate-800 dark:text-slate-200 mb-4 min-h-[72px] whitespace-pre-wrap"
              dir={textDir}
            >
              {reactivateModal.user.suspendedReason?.trim() ||
                t("noSuspendReason")}
            </div>
            <div className={`flex gap-3 `}>
              <button
                type="button"
                onClick={closeReactivateModal}
                disabled={loadingUserId === reactivateModal.user.id}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmActivate}
                disabled={loadingUserId === reactivateModal.user.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loadingUserId === reactivateModal.user.id ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    {t("loading")}
                  </>
                ) : (
                  t("actions.reactivate")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {suspendModal.isOpen && suspendModal.user && (
        <div
          className="fixed m-0 p-4 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            minHeight: "100dvh",
          }}
        >
          <div
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 ${isRTL ? "text-right" : "text-left"}`}
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {tAccount("suspendConfirmTitle")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {tAccount("suspendConfirmMessage")}
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              {suspendModal.user.name}
            </p>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {tAccount("suspendReason")}
            </label>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder={tAccount("suspendReasonPlaceholder")}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 mb-4 resize-y"
              dir={textDir}
            />
            <div className={`flex gap-3 `}>
              <button
                type="button"
                onClick={closeSuspendModal}
                disabled={loadingUserId === suspendModal.user.id}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                disabled={loadingUserId === suspendModal.user.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loadingUserId === suspendModal.user.id ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    {t("loading")}
                  </>
                ) : (
                  t("actions.suspend")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
