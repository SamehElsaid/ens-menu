"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ColDef } from "ag-grid-community";
import {
  FaBan,
  FaUserCheck,
  FaTrash,
  FaEye,
  FaStar,
  FaUsers,
  FaCrown,
  FaUser,
  FaClipboardList,
} from "react-icons/fa";
import { IoArrowBack, IoRefreshOutline } from "react-icons/io5";
import DataTable from "@/components/Custom/DataTable";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Field,
  PageHeader,
  SearchInput,
  SegmentedControl,
  StatCard,
  StatGrid,
  Textarea,
  Toolbar,
  buttonClasses,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  axiosGet,
  axiosPatch,
  axiosDelete,
  axiosPost,
} from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import {
  buildAdminUserDetailPath,
  buildAdminUsersListPath,
  parseAdminUsersListFilter,
  parseAdminUsersListPage,
  type AdminUsersListFilter,
} from "@/lib/adminUsersListUrl";
import { toast } from "react-toastify";
import LinkTo from "@/components/Global/LinkTo";

type UserFilter = AdminUsersListFilter;

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
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRTL = locale === "ar";
  const textDir = isRTL ? "rtl" : "ltr";

  const initialFilter = parseAdminUsersListFilter(searchParams.get("filter"));
  const initialPage = parseAdminUsersListPage(searchParams.get("page"));
  const initialSearch = searchParams.get("search") ?? "";

  const [planFilter, setPlanFilter] = useState<UserFilter>(initialFilter);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
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
  const [searchQuery, setSearchQuery] = useState(initialSearch);
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

  const syncListUrl = useCallback(
    (filter: UserFilter, pageNum: number, search: string) => {
      router.replace(buildAdminUsersListPath(filter, pageNum, search));
    },
    [router],
  );

  const applyFilter = useCallback(
    (filter: UserFilter) => {
      setPlanFilter(filter);
      setPage(1);
      syncListUrl(filter, 1, searchQuery);
    },
    [searchQuery, syncListUrl],
  );

  const openUserDetails = useCallback(
    (userId: number) => {
      const listPath = buildAdminUsersListPath(planFilter, page, searchQuery);
      router.push(buildAdminUserDetailPath(userId, listPath));
    },
    [page, planFilter, router, searchQuery],
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
    setPlanFilter(parseAdminUsersListFilter(searchParams.get("filter")));
    setPage(parseAdminUsersListPage(searchParams.get("page")));
    setSearchQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  const appliedSearch = searchParams.get("search") ?? "";

  useEffect(() => {
    fetchUsers(page, appliedSearch, planFilter);
  }, [page, locale, planFilter, appliedSearch, fetchUsers]);

  const handleSearch = useCallback(() => {
    setPage(1);
    syncListUrl(planFilter, 1, searchQuery);
  }, [searchQuery, planFilter, syncListUrl]);

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setPlanFilter("all");
    setPage(1);
    router.replace("/admin/users");
  }, [router]);

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
          <Button
            variant="link"
            size="sm"
            onClick={() => openUserDetails(params.data.id)}
          >
            {params.value}
          </Button>
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
          <span className="text-xs font-medium capitalize text-fg-muted">
            {params.value || "—"}
          </span>
        ),
      },
      {
        headerName: t("columns.menusCount"),
        field: "menusCount",
        width: 100,
        cellRenderer: (params: { value: number | undefined }) => (
          <Badge tone="info" className="tabular-nums">
            {params.value ?? 0}
          </Badge>
        ),
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
            <Badge tone={isActive ? "success" : "danger"} dot>
              {isActive ? t("status.active") : t("status.suspended")}
            </Badge>
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
          return (
            <div className="flex items-center gap-1">
              <LinkTo
                href={`/admin/users/${user.id}`}
                title={t("actions.view")}
                aria-label={t("actions.view")}
                className={buttonClasses({
                  variant: "secondary",
                  size: "sm",
                  iconOnly: true,
                })}
              >
                <FaEye />
              </LinkTo>
              {featured ? (
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  loading={isLoading}
                  onClick={() => handleRemoveFromHomepage(user)}
                  title={t("actions.removeFromHomepage")}
                  aria-label={t("actions.removeFromHomepage")}
                >
                  <FaStar />
                </Button>
              ) : hasMenu ? (
                <Button
                  variant="subtle"
                  size="sm"
                  iconOnly
                  loading={isLoading}
                  onClick={() => handleAddToHomepage(user)}
                  title={t("actions.addToHomepage")}
                  aria-label={t("actions.addToHomepage")}
                >
                  <FaStar />
                </Button>
              ) : null}
              <Button
                variant={isActive ? "dangerGhost" : "secondary"}
                size="sm"
                iconOnly
                disabled={isLoading}
                onClick={() =>
                  isActive
                    ? setSuspendModal({ isOpen: true, user })
                    : setReactivateModal({ isOpen: true, user })
                }
                title={
                  isActive ? t("actions.suspend") : t("actions.reactivate")
                }
                aria-label={
                  isActive ? t("actions.suspend") : t("actions.reactivate")
                }
              >
                {isActive ? <FaBan /> : <FaUserCheck />}
              </Button>
              <Button
                variant="dangerGhost"
                size="sm"
                iconOnly
                disabled={isLoading}
                onClick={() => setDeleteModal({ isOpen: true, user })}
                title={t("actions.delete")}
                aria-label={t("actions.delete")}
              >
                <FaTrash />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      t,
      isRTL,
      openUserDetails,
      loadingUserId,
      handleAddToHomepage,
      handleRemoveFromHomepage,
      planFilter,
      page,
      searchQuery,
    ],
  );

  const statCards: {
    filter: UserFilter;
    label: string;
    value: number;
    icon: typeof FaBan;
  }[] = [
    {
      filter: "all",
      label: t("totalUsers"),
      value: totalUsersCount,
      icon: FaUsers,
    },
    {
      filter: "active",
      label: t("activeUsers"),
      value: active,
      icon: FaUserCheck,
    },
    {
      filter: "suspended",
      label: t("suspendedUsers"),
      value: suspended,
      icon: FaBan,
    },
    {
      filter: "pro",
      label: t("proUsers"),
      value: proUsers,
      icon: FaCrown,
    },
    {
      filter: "free",
      label: t("freeUsers"),
      value: freeUsers,
      icon: FaUser,
    },
    {
      filter: "no-menu",
      label: t("usersWithoutMenu"),
      value: usersWithoutMenu,
      icon: FaClipboardList,
    },
    {
      filter: "on-homepage",
      label: t("usersOnHomepage"),
      value: usersOnHomepage,
      icon: FaStar,
    },
  ];

  const showingFrom = page === 1 ? 1 : (page - 1) * itemsPerPage + 1;
  const showingTo = Math.min(page * itemsPerPage, total);

  return (
    <div className="space-y-6" dir={textDir}>
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button
            variant="secondary"
            startIcon={<IoArrowBack />}
            onClick={() => router.back()}
          >
            {t("back")}
          </Button>
        }
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <Toolbar
          search={
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("searchPlaceholder")}
              label={t("search")}
              clearLabel={tCommon("clearSearch")}
              debounceMs={0}
            />
          }
          filters={
            <SegmentedControl
              options={filterOptions.map((filter) => ({
                value: filter,
                label: t(`filters.${filter}`),
              }))}
              value={planFilter}
              onChange={applyFilter}
              label={t("filters.label")}
              size="sm"
            />
          }
          actions={
            <>
              <Button type="submit">{t("search")}</Button>
              {searchQuery && (
                <Button
                  variant="secondary"
                  startIcon={<IoRefreshOutline />}
                  onClick={handleReset}
                >
                  {t("reset")}
                </Button>
              )}
            </>
          }
        />
      </form>

      <StatGrid columns={4}>
        {statCards.map((card) => {
          const Icon = card.icon;
          const isSelected = planFilter === card.filter;
          const sharePct =
            card.filter !== "all" && totalUsersCount > 0
              ? Math.round((card.value / totalUsersCount) * 100)
              : null;

          return (
            <StatCard
              key={card.filter}
              label={card.label}
              value={card.value.toLocaleString(locale)}
              hint={sharePct !== null ? `${sharePct}%` : undefined}
              icon={<Icon />}
              loading={loading}
              onClick={() => applyFilter(card.filter)}
              className={cn(
                "h-full",
                isSelected && "border-brand bg-brand-soft/40",
              )}
            />
          );
        })}
      </StatGrid>

      <Card>
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
          onPageChange={(nextPage) => {
            setPage(nextPage);
            syncListUrl(planFilter, nextPage, searchQuery);
          }}
        />
        {!loading && total > 0 && (
          <p className="mt-4 text-[13px] text-fg-muted">
            {t("showing", { from: showingFrom, to: showingTo, total })}
          </p>
        )}
      </Card>

      <ConfirmDialog
        open={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleDelete}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirm", {
          name: deleteModal.user?.name || "",
        })}
        confirmLabel={t("actions.delete")}
        cancelLabel={t("cancel")}
        loading={loadingUserId === deleteModal.user?.id}
        tone="brand"
        icon={<FiAlertTriangle />}
      />

      <ConfirmDialog
        open={reactivateModal.isOpen && Boolean(reactivateModal.user)}
        onClose={closeReactivateModal}
        onConfirm={handleConfirmActivate}
        title={tAccount("reactivateConfirmTitle")}
        description={tAccount("reactivateConfirmMessage")}
        confirmLabel={t("actions.reactivate")}
        cancelLabel={t("cancel")}
        loading={loadingUserId === reactivateModal.user?.id}
        tone="brand"
        icon={<FaUserCheck />}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-medium text-fg">
            {reactivateModal.user?.name}
          </p>
          <div className="flex flex-col gap-1.5">
            <p className="text-[13px] font-medium text-fg">
              {tAccount("suspendedReasonLabel")}
            </p>
            <Alert tone="danger" icon={<FaBan />}>
              <span className="whitespace-pre-wrap">
                {reactivateModal.user?.suspendedReason?.trim() ||
                  t("noSuspendReason")}
              </span>
            </Alert>
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={suspendModal.isOpen && Boolean(suspendModal.user)}
        onClose={closeSuspendModal}
        onConfirm={handleConfirmSuspend}
        title={tAccount("suspendConfirmTitle")}
        description={tAccount("suspendConfirmMessage")}
        confirmLabel={t("actions.suspend")}
        cancelLabel={t("cancel")}
        loading={loadingUserId === suspendModal.user?.id}
        tone="danger"
        icon={<FaBan />}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-medium text-fg">
            {suspendModal.user?.name}
          </p>
          <Field label={tAccount("suspendReason")}>
            <Textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder={tAccount("suspendReasonPlaceholder")}
              dir={textDir}
            />
          </Field>
        </div>
      </ConfirmDialog>
    </div>
  );
}
