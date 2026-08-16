"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { FaBan } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  CountBadge,
  ErrorState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageColumns,
  PageHeader,
  PageShell,
  SectionHeader,
  Select,
  StatCard,
  StatGrid,
  Tabs,
  Textarea,
} from "@/components/ui";
import type { StatusTone, TabItem } from "@/components/ui";
import { axiosGet, axiosPut, axiosPost } from "@/shared/axiosCall";
import { safeAdminUsersListReturnPath } from "@/lib/adminUsersListUrl";
import { toast } from "react-toastify";
import UserFollowUpTimeline from "@/components/Admin/UserFollowUpTimeline";
import CustomerOrdersSection from "@/components/Admin/CustomerOrdersSection";
import CustomerAddressesSection from "@/components/Admin/CustomerAddressesSection";
import CustomerNotesSection from "@/components/Admin/CustomerNotesSection";
import CustomerActivitySection from "@/components/Admin/CustomerActivitySection";
import CustomerVouchersSection from "@/components/Admin/CustomerVouchersSection";
import CustomerSupportSection from "@/components/Admin/CustomerSupportSection";
import AdminUserMenusSection from "@/components/Admin/AdminUserMenusSection";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import type { AccountStatus, UserOrder } from "@/types/AdminCustomer";
import type {
  AdminUserDetail,
  AdminUserMenuSummary,
} from "@/types/User";
import type { PlanSummary } from "@/types/Plan";
import type { AdminSubscription } from "@/types/Subscription";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

/**
 * The record was one 14-section scroll: subscription, usage, follow-ups, the
 * profile, account actions, menus, orders, addresses, notes, vouchers, activity
 * and support, all mounted at once. These are four different jobs, so they are
 * four views — and only the visible one mounts, which also stops the page from
 * firing a dozen requests to answer one question.
 */
type CustomerTab = "overview" | "menus" | "commerce" | "relationship";

interface UserDetailsResponse {
  user: AdminUserDetail;
  menus: AdminUserMenuSummary[];
  subscriptions: AdminSubscription[];
  featuredOnHomepage?: boolean;
  featuredMenuId?: number | null;
}

export default function UserDetailsPage() {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails");
  const tAccount = useTranslations("adminUsers.userDetails.accountActions");
  const tCustomer = useTranslations("adminUsers.userDetails.customerSections");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const tUsers = useTranslations("adminUsers");
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const listReturnPath = safeAdminUsersListReturnPath(searchParams.get("list"));
  const userId =
    typeof params.userId === "string"
      ? params.userId
      : ((params.userId as string[])?.[0] ?? "");

  const [userData, setUserData] = useState<UserDetailsResponse | null>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [subscriptionForm, setSubscriptionForm] = useState<{
    planId: number;
    billingCycle: string;
    startDate: string;
    endDate: string;
  }>({ planId: 0, billingCycle: "free", startDate: "", endDate: "" });
  const [subscriptionSubmitting, setSubscriptionSubmitting] = useState(false);
  const [extraMenusInput, setExtraMenusInput] = useState("0");
  const [extraMenusSaving, setExtraMenusSaving] = useState(false);
  const [applyFreeConfirmOpen, setApplyFreeConfirmOpen] = useState(false);
  const [applyFreeLoading, setApplyFreeLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendSubmitting, setSuspendSubmitting] = useState(false);
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false);
  const [accountActionLoading, setAccountActionLoading] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    country: "",
    restaurantName: "",
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const [softDeleteConfirmOpen, setSoftDeleteConfirmOpen] = useState(false);
  const [softDeleteLoading, setSoftDeleteLoading] = useState(false);
  const [resetLinkLoading, setResetLinkLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [activeTab, setActiveTab] = useState<CustomerTab>("overview");
  const { runApiAction } = useApiAction();

  const requestUserDetails = useCallback(
    () => axiosGet<UserDetailsResponse>(`/admin/users/${userId}`, locale),
    [userId, locale],
  );
  const userDetailsQuery = useApiQuery({
    request: requestUserDetails,
    enabled: Boolean(userId),
    errorToast: t("error"),
    onSuccess: (data) =>
      setUserData({
          ...data,
          user: {
            ...data.user,
            isEmailVerified: Boolean(data.user.isEmailVerified),
          },
        }),
  });
  const loading = userDetailsQuery.loading;
  const fetchUserDetails = userDetailsQuery.refetch;

  const requestSubscriptionPlans = useCallback(
    () =>
      axiosGet<{ plans: PlanSummary[] }>(
        "/admin/plans/subscription",
        locale,
      ),
    [locale],
  );
  const plansQuery = useApiQuery({
    request: requestSubscriptionPlans,
    enabled: false,
    errorToast: t("subscriptionInfo.plansLoadError"),
    onSuccess: (data) => {
      if (!data.plans?.length) return;
      setPlans(data.plans);
      const freePlan = data.plans.find(
        (plan) => plan.name?.toLowerCase() === "free",
      );
      const proPlan = data.plans.find(
        (plan) => plan.name?.toLowerCase() === "pro",
      );
      const currentPlanName = userData?.user?.planName?.toLowerCase();
      const defaultPlan =
        currentPlanName === "pro" && proPlan
          ? proPlan
          : freePlan || data.plans[0];
      setSubscriptionForm({
        planId: defaultPlan?.id ?? data.plans[0].id,
        billingCycle:
          defaultPlan?.name?.toLowerCase() === "free" ? "free" : "yearly",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: "",
      });
    },
  });
  const plansLoading = plansQuery.loading;

  useEffect(() => {
    if (!userData?.user) return;
    const activeSub =
      userData.subscriptions?.find((sub) => sub.status === "active") ||
      userData.subscriptions?.[0];
    const extra = userData.user.extraMenus ?? activeSub?.extraMenus ?? 0;
    setExtraMenusInput(String(extra));
  }, [userData]);

  const userAnalytics = useMemo(() => {
    const u = userData?.user;
    const menuList = userData?.menus ?? [];
    if (!u) return null;

    const activeSubscription =
      userData?.subscriptions?.find((sub) => sub.status === "active") ||
      userData?.subscriptions?.[0];
    const subEnd = activeSubscription?.endDate ?? u.endDate ?? null;

    const activeMenus = menuList.filter((m) => m.isActive).length;
    const totalItems = menuList.reduce(
      (sum, m) => sum + (m.itemsCount ?? 0),
      0,
    );
    const activeItems = menuList.reduce(
      (sum, m) => sum + (m.activeItemsCount ?? 0),
      0,
    );
    const daysSinceLogin = u.lastLoginAt
      ? Math.floor((Date.now() - new Date(u.lastLoginAt).getTime()) / 86400000)
      : null;
    const subscriptionEnd = subEnd ? new Date(subEnd) : null;
    const daysUntilExpiry =
      subscriptionEnd && subscriptionEnd > new Date()
        ? Math.ceil((subscriptionEnd.getTime() - Date.now()) / 86400000)
        : null;

    return {
      menusCount: menuList.length,
      activeMenus,
      totalItems,
      activeItems,
      daysSinceLogin,
      daysUntilExpiry,
    };
  }, [userData]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleSetPassword = useCallback(async () => {
    if (!newPassword.trim()) {
      toast.error(tAccount("passwordRequired"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(tAccount("passwordMismatch"));
      return;
    }
    setPasswordSubmitting(true);
    try {
      await runApiAction(
        () =>
          axiosPut(`/admin/users/${userId}/password`, locale, {
            newPassword,
          }),
        {
          successToast: tAccount("passwordSuccess"),
          errorToast: tAccount("passwordError"),
          onSuccess: () => {
            setPasswordModalOpen(false);
            setNewPassword("");
            setConfirmPassword("");
          },
        },
      );
    } finally {
      setPasswordSubmitting(false);
    }
  }, [newPassword, confirmPassword, userId, locale, tAccount, runApiAction]);

  const handleSuspendUser = useCallback(async () => {
    setSuspendSubmitting(true);
    try {
      const payload: { isSuspended: boolean; reason?: string } = {
        isSuspended: true,
      };
      if (suspendReason.trim()) {
        payload.reason = suspendReason.trim();
      }
      await runApiAction(
        () => axiosPut(`/admin/users/${userId}/suspend`, locale, payload),
        {
          successToast: tAccount("suspendSuccess"),
          errorToast: tAccount("suspendError"),
          onSuccess: () => {
            setSuspendModalOpen(false);
            setSuspendReason("");
            void fetchUserDetails();
          },
        },
      );
    } finally {
      setSuspendSubmitting(false);
    }
  }, [
    userId,
    locale,
    suspendReason,
    tAccount,
    fetchUserDetails,
    runApiAction,
  ]);

  const handleReactivateUser = useCallback(async () => {
    setAccountActionLoading(true);
    try {
      await runApiAction(
        () =>
          axiosPut(`/admin/users/${userId}/suspend`, locale, {
            isSuspended: false,
          }),
        {
          successToast: tAccount("reactivateSuccess"),
          errorToast: tAccount("reactivateError"),
          onSuccess: () => {
            setReactivateConfirmOpen(false);
            void fetchUserDetails();
          },
        },
      );
    } finally {
      setAccountActionLoading(false);
    }
  }, [userId, locale, tAccount, fetchUserDetails, runApiAction]);

  const openEditProfile = useCallback(() => {
    if (!userData?.user) return;
    setProfileForm({
      name: userData.user.name ?? "",
      email: userData.user.email ?? "",
      phoneNumber: userData.user.phoneNumber ?? "",
      country: userData.user.country ?? "",
      restaurantName: userData.user.restaurantName ?? "",
    });
    setEditProfileOpen(true);
  }, [userData?.user]);

  const handleSaveProfile = useCallback(async () => {
    setProfileSubmitting(true);
    try {
      await runApiAction(
        () =>
          axiosPut(
            `/admin/users/${userId}/profile`,
            locale,
            profileForm,
          ),
        {
          successToast: tCustomer("profile.saveSuccess"),
          errorToast: tCustomer("profile.saveError"),
          onSuccess: () => {
            setEditProfileOpen(false);
            void fetchUserDetails();
          },
        },
      );
    } finally {
      setProfileSubmitting(false);
    }
  }, [
    profileForm,
    userId,
    locale,
    tCustomer,
    fetchUserDetails,
    runApiAction,
  ]);

  const handleToggleBlock = useCallback(async () => {
    const isBlocked = !userData?.user?.isBlocked;
    setBlockSubmitting(true);
    try {
      await runApiAction(
        () =>
          axiosPut(`/admin/users/${userId}/block`, locale, {
            isBlocked,
            reason: blockReason.trim() || undefined,
          }),
        {
          successToast: isBlocked
            ? tCustomer("block.blockSuccess")
            : tCustomer("block.unblockSuccess"),
          errorToast: tCustomer("block.error"),
          onSuccess: () => {
            setBlockModalOpen(false);
            setBlockReason("");
            void fetchUserDetails();
          },
        },
      );
    } finally {
      setBlockSubmitting(false);
    }
  }, [
    userData?.user?.isBlocked,
    userId,
    locale,
    blockReason,
    tCustomer,
    fetchUserDetails,
    runApiAction,
  ]);

  const handleSoftDelete = useCallback(async () => {
    setSoftDeleteLoading(true);
    try {
      await runApiAction(
        () => axiosPost(`/admin/users/${userId}/soft-delete`, locale, {}),
        {
          successToast: tCustomer("softDelete.success"),
          errorToast: tCustomer("softDelete.error"),
          onSuccess: () => {
            setSoftDeleteConfirmOpen(false);
            void fetchUserDetails();
          },
        },
      );
    } finally {
      setSoftDeleteLoading(false);
    }
  }, [userId, locale, tCustomer, fetchUserDetails, runApiAction]);

  const handleRestoreUser = useCallback(async () => {
    setAccountActionLoading(true);
    try {
      await runApiAction(
        () => axiosPost(`/admin/users/${userId}/restore`, locale, {}),
        {
          successToast: tCustomer("restore.success"),
          errorToast: tCustomer("restore.error"),
          onSuccess: () => void fetchUserDetails(),
        },
      );
    } finally {
      setAccountActionLoading(false);
    }
  }, [userId, locale, tCustomer, fetchUserDetails, runApiAction]);

  const handleSendResetLink = useCallback(async () => {
    setResetLinkLoading(true);
    try {
      await runApiAction(
        () =>
          axiosPost(`/admin/users/${userId}/send-reset-password`, locale, {
            locale,
          }),
        {
          successToast: tCustomer("resetLink.success"),
          errorToast: tCustomer("resetLink.error"),
        },
      );
    } finally {
      setResetLinkLoading(false);
    }
  }, [userId, locale, tCustomer, runApiAction]);

  const getAccountStatusLabel = (status?: AccountStatus) => {
    if (!status) return t("status.active");
    return tCustomer(`accountStatus.${status}`);
  };

  const getAccountStatusTone = (status?: AccountStatus): StatusTone => {
    switch (status) {
      case "deleted":
        return "neutral";
      case "blocked":
        return "warning";
      case "suspended":
        return "danger";
      default:
        return "success";
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    if (cycle.toLowerCase() === "free") return t("free");
    if (cycle.toLowerCase().includes("month")) return t("monthly");
    if (cycle.toLowerCase().includes("year")) return t("yearly");
    return cycle;
  };

  const openSubscriptionModal = useCallback(async () => {
    setSubscriptionModalOpen(true);
    await plansQuery.refetch();
  }, [plansQuery]);

  const handleChangeSubscription = useCallback(async () => {
    if (!subscriptionForm.planId) {
      toast.error(t("subscriptionInfo.selectPlan"));
      return;
    }
    const isFree =
      plans
        .find((p) => p.id === subscriptionForm.planId)
        ?.name?.toLowerCase() === "free";
    const billingCycle = isFree ? "free" : subscriptionForm.billingCycle;
    if (!isFree && !["monthly", "yearly"].includes(billingCycle)) {
      toast.error(t("subscriptionInfo.selectBilling"));
      return;
    }
    setSubscriptionSubmitting(true);
    try {
      const payload = {
        planId: subscriptionForm.planId,
        billingCycle,
        startDate: subscriptionForm.startDate || undefined,
        endDate: subscriptionForm.endDate || undefined,
        status: "active",
      };
      await runApiAction(
        () =>
          axiosPut(
            `/admin/users/${userId}/subscription`,
            locale,
            payload,
          ),
        {
          successToast: t("subscriptionInfo.changeSuccess"),
          errorToast: t("subscriptionInfo.changeError"),
          onSuccess: () => {
            setSubscriptionModalOpen(false);
            void fetchUserDetails();
          },
        },
      );
    } finally {
      setSubscriptionSubmitting(false);
    }
  }, [
    subscriptionForm,
    plans,
    userId,
    locale,
    t,
    fetchUserDetails,
    runApiAction,
  ]);

  const handleSaveExtraMenus = useCallback(async () => {
    const parsed = parseInt(extraMenusInput, 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      toast.error(t("subscriptionInfo.extraMenusInvalid"));
      return;
    }
    setExtraMenusSaving(true);
    try {
      await runApiAction(
        () =>
          axiosPut(`/admin/users/${userId}/extra-menus`, locale, {
            extraMenus: parsed,
          }),
        {
          successToast: t("subscriptionInfo.extraMenusSuccess"),
          errorToast: t("subscriptionInfo.extraMenusError"),
          onSuccess: () => void fetchUserDetails(),
        },
      );
    } finally {
      setExtraMenusSaving(false);
    }
  }, [
    extraMenusInput,
    userId,
    locale,
    t,
    fetchUserDetails,
    runApiAction,
  ]);

  const handleApplyFreeLimits = useCallback(async () => {
    setApplyFreeLoading(true);
    try {
      await runApiAction(
        () =>
          axiosPost(`/admin/users/${userId}/apply-free-limits`, locale, {}),
        {
          successToast: t("subscriptionInfo.applyFreeSuccess"),
          errorToast: t("subscriptionInfo.applyFreeError"),
          onSuccess: () => {
            setApplyFreeConfirmOpen(false);
            void fetchUserDetails();
          },
        },
      );
    } finally {
      setApplyFreeLoading(false);
    }
  }, [userId, locale, t, fetchUserDetails, runApiAction]);

  const tabItems: TabItem[] = [
    { id: "overview", label: t("tabs.overview") },
    {
      id: "menus",
      label: t("tabs.menus"),
      badge: userData?.menus?.length ? (
        <CountBadge count={userData.menus.length} tone="neutral" />
      ) : undefined,
    },
    { id: "commerce", label: t("tabs.commerce") },
    { id: "relationship", label: t("tabs.relationship") },
  ];

  /**
   * The record's identity, not its data, so it is built before the loading gate
   * and stays put while the record is fetched. The title is the person — the
   * page used to be titled "User details" for every customer, which made two
   * open tabs indistinguishable.
   */
  const header = (
    <PageHeader
      eyebrow={tUsers("title")}
      title={userData?.user?.name?.trim() || t("title")}
      description={userData?.user?.email}
      breadcrumbs={[
        { label: tAdmin("title"), href: "/admin" },
        { label: tUsers("title"), href: "/admin/users" },
        { label: userData?.user?.name?.trim() || t("title") },
      ]}
      breadcrumbsLabel={tCommon("breadcrumb")}
      meta={
        userData?.user ? (
          <>
            <Badge tone={getAccountStatusTone(userData.user.accountStatus)} dot>
              {getAccountStatusLabel(userData.user.accountStatus)}
            </Badge>
            <Badge
              tone={
                userData.user.planName?.toLowerCase() === "free" ||
                !userData.user.planName
                  ? "brand"
                  : "info"
              }
            >
              {userData.user.planName || t("free")}
            </Badge>
          </>
        ) : undefined
      }
      actions={
        <>
          <Button
            variant="secondary"
            startIcon={<IoArrowBack />}
            onClick={() => router.push(listReturnPath)}
          >
            {t("back")}
          </Button>
          {userData?.user ? (
            <Button onClick={openSubscriptionModal}>
              {t("subscriptionInfo.changeSubscription")}
            </Button>
          ) : null}
        </>
      }
    />
  );

  if (loading) {
    return (
      <PageShell kind="wide" header={header}>
        <LoadingBlock label={t("loading")} className="min-h-[400px]" />
      </PageShell>
    );
  }

  if (!userData || !userData.user) {
    return (
      <ErrorState
        title={t("error")}
        description={tCommon("errorDescription")}
        onRetry={fetchUserDetails}
        retryLabel={tCommon("retry")}
        className="min-h-[400px]"
      />
    );
  }

  const user = userData.user;
  const menus = userData.menus || [];
  const activeSubscription =
    userData.subscriptions?.find((sub) => sub.status === "active") ||
    userData.subscriptions?.[0];
  const subscription = activeSubscription || {
    billingCycle: user.billingCycle,
    startDate: user.startDate,
    endDate: user.endDate,
    planName: user.planName,
    status: user.subscriptionStatus,
  };

  const planBaseMenus = user.maxMenus ?? activeSubscription?.maxMenus ?? 1;
  const currentExtraMenus =
    user.extraMenus ?? activeSubscription?.extraMenus ?? 0;
  const effectiveMenuLimit =
    user.effectiveMaxMenus ?? planBaseMenus + currentExtraMenus;
  const hasActiveSubscription =
    String(subscription.status ?? user.subscriptionStatus).toLowerCase() ===
      "active" && Boolean(user.subscriptionId ?? activeSubscription?.id);

  /**
   * Commercial state of the account — the plan, its dates and the seat limit —
   * kept as the first thing the operator sees, because that is what a support
   * call about this customer is almost always about.
   */
  const subscriptionCard = (
    <Card padded="lg" className="space-y-6">
      <SectionHeader title={t("subscriptionInfo.title")} />
      <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <dt className="mb-1 text-[13px] text-fg-muted">
            {t("subscriptionInfo.currentPlan")}
          </dt>
          <dd className="text-[15px] font-semibold text-fg">
            {subscription.planName || t("free")}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-[13px] text-fg-muted">
            {t("subscriptionInfo.paymentType")}
          </dt>
          <dd className="text-[15px] font-semibold text-fg">
            {getBillingCycleLabel(subscription.billingCycle)}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-[13px] text-fg-muted">
            {t("subscriptionInfo.startDate")}
          </dt>
          <dd className="text-[15px] font-semibold text-fg">
            {formatDate(subscription.startDate)}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-[13px] text-fg-muted">
            {t("subscriptionInfo.endDate")}
          </dt>
          <dd className="text-[15px] font-semibold text-fg">
            {formatDate(subscription.endDate)}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-[13px] text-fg-muted">
            {t("subscriptionInfo.menuLimit")}
          </dt>
          <dd className="text-[15px] font-semibold text-fg">
            {t("subscriptionInfo.menuLimitValue", {
              total: String(effectiveMenuLimit),
              base: String(planBaseMenus),
              extra: String(currentExtraMenus),
            })}
          </dd>
        </div>
      </dl>

      {hasActiveSubscription && (
        <Card variant="ghost" padded="md" className="space-y-3">
          <SectionHeader
            title={t("subscriptionInfo.extraMenusTitle")}
            description={t("subscriptionInfo.extraMenusHint", {
              base: String(planBaseMenus),
            })}
          />
          <div className="flex flex-wrap items-end gap-3">
            <Field
              label={t("subscriptionInfo.extraMenusCount")}
              htmlFor="admin-extra-menus"
              className="w-full max-w-40"
            >
              <Input
                id="admin-extra-menus"
                type="number"
                min={0}
                max={100}
                value={extraMenusInput}
                onChange={(e) => setExtraMenusInput(e.target.value)}
                disabled={extraMenusSaving}
              />
            </Field>
            <p className="pb-2.5 text-[13px] text-fg-muted">
              {t("subscriptionInfo.extraMenusPreview", {
                total: String(
                  planBaseMenus + (parseInt(extraMenusInput, 10) || 0),
                ),
              })}
            </p>
            <Button
              onClick={() => void handleSaveExtraMenus()}
              loading={extraMenusSaving}
              className="mb-px"
            >
              {extraMenusSaving
                ? t("subscriptionInfo.saving")
                : t("subscriptionInfo.extraMenusSave")}
            </Button>
          </div>
        </Card>
      )}
    </Card>
  );

  /**
   * Usage, as the answer to "is this account actually being used?". The expiry
   * card is the only one allowed a tone, and only inside a week of lapsing.
   */
  const usageCard = userAnalytics ? (
    <Card padded="lg" className="space-y-6">
      <SectionHeader title={t("analytics.title")} />
      <StatGrid columns={4}>
        <StatCard
          label={t("analytics.menusCount")}
          value={userAnalytics.menusCount}
        />
        <StatCard
          label={t("analytics.activeMenus")}
          value={userAnalytics.activeMenus}
        />
        <StatCard
          label={t("analytics.totalItems")}
          value={userAnalytics.totalItems}
        />
        <StatCard
          label={t("analytics.activeItems")}
          value={userAnalytics.activeItems}
        />
        <StatCard
          label={t("analytics.daysSinceLogin")}
          value={userAnalytics.daysSinceLogin ?? t("analytics.neverLoggedIn")}
        />
        {userAnalytics.daysUntilExpiry !== null &&
          userAnalytics.daysUntilExpiry <= 7 && (
            <StatCard
              className="col-span-2 border-danger-line bg-danger-soft"
              label={t("analytics.expiringSoon")}
              value={t("analytics.daysUntilExpiry", {
                days: userAnalytics.daysUntilExpiry,
              })}
            />
          )}
      </StatGrid>
    </Card>
  ) : null;

  /**
   * Who this account is. It sits in the side column as a single stack of
   * label/value pairs: it is reference material an operator glances at while
   * working in the main column, not something they read top to bottom.
   */
  const identityCard = (
    <Card padded="lg" className="space-y-4">
      <SectionHeader title={t("basicInfo.title")} />
      <dl className="divide-y divide-line">
        <div className="flex items-baseline justify-between gap-3 pb-2.5">
          <dt className="text-[13px] text-fg-muted">
            {t("basicInfo.restaurantName")}
          </dt>
          <dd className="text-[13px] font-semibold text-fg">
            {user.restaurantName?.trim() || "—"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-[13px] text-fg-muted">
            {t("basicInfo.emailStatus")}
          </dt>
          <dd>
            <Badge tone={user.isEmailVerified ? "success" : "warning"} dot>
              {user.isEmailVerified ? t("verified") : t("unverified")}
            </Badge>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-[13px] text-fg-muted">
            {t("basicInfo.phoneNumber")}
          </dt>
          <dd className="text-[13px] font-semibold text-fg">
            {user.phoneNumber ? <PhoneDisplay value={user.phoneNumber} /> : "—"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-[13px] text-fg-muted">
            {t("basicInfo.registrationDate")}
          </dt>
          <dd className="text-[13px] font-semibold text-fg">
            {formatDate(user.createdAt)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-[13px] text-fg-muted">
            {t("basicInfo.lastLogin")}
          </dt>
          <dd className="text-[13px] font-semibold text-fg">
            {formatDate(user.lastLoginAt)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-2.5">
          <dt className="text-[13px] text-fg-muted">
            {tCustomer("lastActivity")}
          </dt>
          <dd className="text-[13px] font-semibold text-fg">
            {formatDate(user.lastLoginAt ?? user.updatedAt ?? null)}
          </dd>
        </div>
      </dl>
    </Card>
  );

  /**
   * Account actions, ordered by how reversible they are: profile and password
   * first, suspension and deletion last and visually separated. They used to be
   * one wrapped row of seven equally-weighted buttons, where "soft delete" sat
   * next to "edit profile".
   */
  const accountActionsCard = (
    <Card padded="lg" className="space-y-4">
      <SectionHeader title={tAccount("title")} />

      {user.isSuspended && user.suspendedReason ? (
        <p className="text-[13px] text-danger">
          {tAccount("suspendedReasonLabel")}: {user.suspendedReason}
        </p>
      ) : null}
      {user.isBlocked && user.blockedReason ? (
        <p className="text-[13px] text-warning">
          {tCustomer("block.reasonLabel")}: {user.blockedReason}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={openEditProfile} fullWidth>
          {tCustomer("profile.edit")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setPasswordModalOpen(true)}
          fullWidth
        >
          {tAccount("changePassword")}
        </Button>
        <Button
          variant="ghost"
          onClick={handleSendResetLink}
          loading={resetLinkLoading}
          fullWidth
        >
          {resetLinkLoading
            ? tCustomer("resetLink.sending")
            : tCustomer("resetLink.send")}
        </Button>
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-4">
        {user.isSuspended ? (
          <Button
            onClick={() => setReactivateConfirmOpen(true)}
            disabled={accountActionLoading}
            fullWidth
          >
            {tAccount("reactivate")}
          </Button>
        ) : (
          <Button
            variant="dangerGhost"
            onClick={() => setSuspendModalOpen(true)}
            fullWidth
          >
            {tAccount("suspend")}
          </Button>
        )}
        <Button
          variant="dangerGhost"
          onClick={() => setBlockModalOpen(true)}
          fullWidth
        >
          {user.isBlocked
            ? tCustomer("block.unblock")
            : tCustomer("block.block")}
        </Button>
        {user.deletedAt ? (
          <Button
            variant="secondary"
            onClick={handleRestoreUser}
            disabled={accountActionLoading}
            fullWidth
          >
            {tCustomer("restore.action")}
          </Button>
        ) : (
          <Button
            variant="dangerGhost"
            onClick={() => setSoftDeleteConfirmOpen(true)}
            fullWidth
          >
            {tCustomer("softDelete.action")}
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <PageShell
      kind="wide"
      header={header}
      toolbar={
        <Tabs
          items={tabItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as CustomerTab)}
          label={t("tabs.label")}
          className="border-b-0!"
        />
      }
    >
      {activeTab === "overview" ? (
        <PageColumns
          side={
            <>
              {identityCard}
              {accountActionsCard}
            </>
          }
        >
          {subscriptionCard}
          {usageCard}
        </PageColumns>
      ) : null}

      {activeTab === "menus" ? (
        <AdminUserMenusSection
          userId={userId}
          menus={menus}
          featuredOnHomepage={userData.featuredOnHomepage}
          onMenusChange={(updatedMenus) =>
            setUserData((prev) =>
              prev ? { ...prev, menus: updatedMenus } : prev,
            )
          }
          onRefresh={fetchUserDetails}
        />
      ) : null}

      {activeTab === "commerce" ? (
        <>
          <CustomerOrdersSection
            userId={Number(userId)}
            onSelectOrder={setSelectedOrder}
          />
          <CustomerVouchersSection userId={Number(userId)} />
          <CustomerAddressesSection userId={Number(userId)} />
        </>
      ) : null}

      {activeTab === "relationship" ? (
        <>
          <Card padded="lg">
            <UserFollowUpTimeline
              userId={user.id}
              userName={user.name}
              phoneNumber={user.phoneNumber}
            />
          </Card>
          <CustomerNotesSection userId={Number(userId)} />
          <CustomerSupportSection userId={Number(userId)} />
          <CustomerActivitySection userId={Number(userId)} />
        </>
      ) : null}

      <Modal
        open={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        title={t("subscriptionInfo.changeSubscription")}
        closeLabel={tCommon("close")}
        dismissible={!subscriptionSubmitting}
        footer={
          plansLoading ? undefined : (
            <>
              <Button
                variant="secondary"
                onClick={() => setSubscriptionModalOpen(false)}
                disabled={subscriptionSubmitting}
              >
                {t("lists.cancel")}
              </Button>
              <Button
                type="submit"
                form="admin-change-subscription-form"
                loading={subscriptionSubmitting}
              >
                {subscriptionSubmitting
                  ? t("subscriptionInfo.saving")
                  : t("subscriptionInfo.save")}
              </Button>
            </>
          )
        }
      >
        {plansLoading ? (
          <LoadingBlock label={t("loading")} />
        ) : (
          <form
            id="admin-change-subscription-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleChangeSubscription();
            }}
            className="flex flex-col gap-4"
          >
            <Field label={t("subscriptionInfo.plan")} required>
              <Select
                value={subscriptionForm.planId || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const plan = plans.find((p) => p.id === id);
                  setSubscriptionForm((prev) => ({
                    ...prev,
                    planId: id,
                    billingCycle:
                      plan?.name?.toLowerCase() === "free"
                        ? "free"
                        : prev.billingCycle === "free"
                          ? "yearly"
                          : prev.billingCycle,
                  }));
                }}
                required
              >
                <option value="">{t("subscriptionInfo.selectPlan")}</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </Select>
            </Field>

            {plans
              .find((p) => p.id === subscriptionForm.planId)
              ?.name?.toLowerCase() !== "free" && (
              <Field label={t("subscriptionInfo.billingCycle")}>
                <Select
                  value={subscriptionForm.billingCycle}
                  onChange={(e) =>
                    setSubscriptionForm((prev) => ({
                      ...prev,
                      billingCycle: e.target.value,
                    }))
                  }
                >
                  <option value="monthly">{t("monthly")}</option>
                  <option value="yearly">{t("yearly")}</option>
                </Select>
              </Field>
            )}

            <Field label={t("subscriptionInfo.startDate")}>
              <Input
                type="date"
                value={subscriptionForm.startDate}
                onChange={(e) =>
                  setSubscriptionForm((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </Field>

            <Field
              label={t("subscriptionInfo.endDateOptional")}
              hint={t("subscriptionInfo.endDateHint")}
            >
              <Input
                type="date"
                value={subscriptionForm.endDate}
                onChange={(e) =>
                  setSubscriptionForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </Field>
          </form>
        )}
      </Modal>

      {/* Apply Free Limits Confirmation */}
      {applyFreeConfirmOpen && (
        <ConfirmDialog
          open={true}
          onClose={() => !applyFreeLoading && setApplyFreeConfirmOpen(false)}
          onConfirm={handleApplyFreeLimits}
          title={t("subscriptionInfo.applyFreeConfirmTitle")}
          description={t("subscriptionInfo.applyFreeConfirmMessage")}
          confirmLabel={t("subscriptionInfo.applyFreeRestrictions")}
          cancelLabel={t("lists.cancel")}
          loading={applyFreeLoading}
          tone="brand"
          icon={<FiAlertTriangle />}
        />
      )}

      <Modal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title={tAccount("changePassword")}
        closeLabel={tCommon("close")}
        dismissible={!passwordSubmitting}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPasswordModalOpen(false)}
              disabled={passwordSubmitting}
            >
              {t("lists.cancel")}
            </Button>
            <Button
              type="submit"
              form="admin-set-password-form"
              loading={passwordSubmitting}
            >
              {passwordSubmitting
                ? tAccount("savingPassword")
                : tAccount("savePassword")}
            </Button>
          </>
        }
      >
        <form
          id="admin-set-password-form"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSetPassword();
          }}
        >
          <Field
            label={tAccount("newPassword")}
            hint={tAccount("passwordHint")}
            required
          >
            <Input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              dir="ltr"
              autoComplete="new-password"
            />
          </Field>
          <Field label={tAccount("confirmPassword")} required>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              dir="ltr"
              autoComplete="new-password"
            />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        onConfirm={handleSuspendUser}
        title={tAccount("suspendConfirmTitle")}
        description={tAccount("suspendConfirmMessage")}
        confirmLabel={
          suspendSubmitting ? t("lists.updating") : tAccount("suspend")
        }
        cancelLabel={t("lists.cancel")}
        loading={suspendSubmitting}
        tone="danger"
        icon={<FaBan />}
      >
        <Field label={tAccount("suspendReason")}>
          <Textarea
            rows={3}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder={tAccount("suspendReasonPlaceholder")}
          />
        </Field>
      </ConfirmDialog>

      <ConfirmDialog
        open={reactivateConfirmOpen}
        onClose={() => !accountActionLoading && setReactivateConfirmOpen(false)}
        onConfirm={handleReactivateUser}
        title={tAccount("reactivateConfirmTitle")}
        description={tAccount("reactivateConfirmMessage")}
        confirmLabel={tAccount("reactivate")}
        cancelLabel={t("lists.cancel")}
        loading={accountActionLoading}
        tone="brand"
        icon={<FiAlertTriangle />}
      />

      <Modal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title={tCustomer("profile.edit")}
        closeLabel={tCommon("close")}
        dismissible={!profileSubmitting}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditProfileOpen(false)}
            >
              {t("lists.cancel")}
            </Button>
            <Button
              type="submit"
              form="admin-edit-profile-form"
              loading={profileSubmitting}
            >
              {tCustomer("profile.save")}
            </Button>
          </>
        }
      >
        <form
          id="admin-edit-profile-form"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveProfile();
          }}
        >
          <Field label={t("basicInfo.name")}>
            <Input
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder={t("basicInfo.name")}
            />
          </Field>
          <Field label={t("basicInfo.restaurantName")}>
            <Input
              value={profileForm.restaurantName}
              onChange={(e) =>
                setProfileForm((f) => ({
                  ...f,
                  restaurantName: e.target.value,
                }))
              }
              placeholder={t("basicInfo.restaurantName")}
            />
          </Field>
          <Field label={t("basicInfo.email")}>
            <Input
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder={t("basicInfo.email")}
              dir="ltr"
            />
          </Field>
          <Field label={t("basicInfo.phoneNumber")}>
            <Input
              value={profileForm.phoneNumber}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
              placeholder={t("basicInfo.phoneNumber")}
              dir="ltr"
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        title={
          user.isBlocked ? tCustomer("block.unblock") : tCustomer("block.block")
        }
        closeLabel={tCommon("close")}
        dismissible={!blockSubmitting}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setBlockModalOpen(false)}
            >
              {t("lists.cancel")}
            </Button>
            <Button onClick={handleToggleBlock} loading={blockSubmitting}>
              {tCustomer("profile.save")}
            </Button>
          </>
        }
      >
        {user.isBlocked ? (
          <p className="text-sm leading-relaxed text-fg-muted">
            {tCustomer("block.unblock")}
          </p>
        ) : (
          <Field label={tCustomer("block.reasonLabel")}>
            <Textarea
              rows={3}
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder={tCustomer("block.reasonPlaceholder")}
            />
          </Field>
        )}
      </Modal>

      <ConfirmDialog
        open={softDeleteConfirmOpen}
        onClose={() => !softDeleteLoading && setSoftDeleteConfirmOpen(false)}
        onConfirm={handleSoftDelete}
        title={tCustomer("softDelete.title")}
        description={tCustomer("softDelete.message")}
        confirmLabel={tCustomer("softDelete.action")}
        cancelLabel={t("lists.cancel")}
        loading={softDeleteLoading}
        tone="brand"
        icon={<FiAlertTriangle />}
      />

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={tCustomer("orders.orderDetails")}
        closeLabel={tCommon("close")}
        size="sm"
        footer={
          <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
            {t("lists.cancel")}
          </Button>
        }
      >
        <dl className="flex flex-col gap-2 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">{tCustomer("orders.plan")}</dt>
            <dd className="font-semibold text-fg">{selectedOrder?.planName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">{tCustomer("orders.status")}</dt>
            <dd className="font-semibold capitalize text-fg">
              {selectedOrder?.status}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">{tCustomer("orders.amount")}</dt>
            <dd className="font-semibold tabular-nums text-fg">
              {selectedOrder?.amount}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-fg-muted">{tCustomer("orders.date")}</dt>
            <dd className="text-fg">
              {formatDate(selectedOrder?.createdAt ?? null)}
            </dd>
          </div>
        </dl>
      </Modal>
    </PageShell>
  );
}
