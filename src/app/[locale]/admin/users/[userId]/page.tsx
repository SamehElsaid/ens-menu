"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { FaBan, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  SectionHeader,
  Select,
  StatCard,
  StatGrid,
  Textarea,
} from "@/components/ui";
import type { StatusTone } from "@/components/ui";
import { axiosGet, axiosPatch, axiosPost } from "@/shared/axiosCall";
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

interface Plan {
  id: number;
  name: string;
  priceMonthly?: number;
  priceYearly?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  country: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  restaurantName?: string | null;
  profileImage: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  isSuspended: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedReason?: string | null;
  deletedAt?: string | null;
  updatedAt?: string | null;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string | null;
  accountStatus?: AccountStatus;
  planName: string;
  maxMenus?: number;
  extraMenus?: number;
  effectiveMaxMenus?: number;
  subscriptionId?: number | null;
  subscriptionStatus: string;
  startDate: string;
  endDate: string | null;
  billingCycle: string;
  amount: number;
}

interface Subscription {
  id: number;
  billingCycle: string;
  startDate: string;
  endDate: string | null;
  status: string;
  amount: number;
  paymentStatus: string;
  paidAt: string | null;
  planName: string;
  maxMenus?: number;
  extraMenus?: number;
}

interface Menu {
  id: number;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  isActive: boolean;
  itemsCount?: number;
  activeItemsCount?: number;
  createdAt: string;
}

interface UserDetailsResponse {
  user: User;
  menus: Menu[];
  subscriptions: Subscription[];
  featuredOnHomepage?: boolean;
  featuredMenuId?: number | null;
}

export default function UserDetailsPage() {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails");
  const tAccount = useTranslations("adminUsers.userDetails.accountActions");
  const tCustomer = useTranslations("adminUsers.userDetails.customerSections");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const listReturnPath = safeAdminUsersListReturnPath(searchParams.get("list"));
  const userId =
    typeof params.userId === "string"
      ? params.userId
      : ((params.userId as string[])?.[0] ?? "");
  const isRTL = locale === "ar";

  const [userData, setUserData] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
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

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const result = await axiosGet<UserDetailsResponse>(
        `/admin/users/${userId}`,
        locale,
      );

      if (result.status && result.data) {
        setUserData({
          ...result.data,
          user: {
            ...result.data.user,
            isEmailVerified: Boolean(result.data.user.isEmailVerified),
          },
        });
      } else {
        toast.error(t("error"));
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  }, [userId, locale, t]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  useEffect(() => {
    if (!userData?.user) return;
    const activeSub =
      userData.subscriptions?.find((sub) => sub.status === "active") ||
      userData.subscriptions?.[0];
    const extra =
      userData.user.extraMenus ?? activeSub?.extraMenus ?? 0;
    setExtraMenusInput(String(extra));
  }, [userData]);

  const userAnalytics = useMemo(() => {
    const u = userData?.user;
    const menuList = userData?.menus ?? [];
    if (!u) return null;

    const activeSubscription =
      userData?.subscriptions?.find((sub) => sub.status === "active") ||
      userData?.subscriptions?.[0];
    const subEnd =
      activeSubscription?.endDate ?? u.endDate ?? null;

    const activeMenus = menuList.filter((m) => m.isActive).length;
    const totalItems = menuList.reduce((sum, m) => sum + (m.itemsCount ?? 0), 0);
    const activeItems = menuList.reduce(
      (sum, m) => sum + (m.activeItemsCount ?? 0),
      0,
    );
    const daysSinceLogin = u.lastLoginAt
      ? Math.floor(
          (Date.now() - new Date(u.lastLoginAt).getTime()) / 86400000,
        )
      : null;
    const subscriptionEnd = subEnd ? new Date(subEnd) : null;
    const daysUntilExpiry =
      subscriptionEnd && subscriptionEnd > new Date()
        ? Math.ceil(
            (subscriptionEnd.getTime() - Date.now()) / 86400000,
          )
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
      const result = await axiosPatch<{ newPassword: string }, { message?: string }>(
        `/admin/users/${userId}/password`,
        locale,
        { newPassword },
      );
      if (result.status) {
        toast.success(tAccount("passwordSuccess"));
        setPasswordModalOpen(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(tAccount("passwordError"));
      }
    } catch (err) {
      console.error("Error setting user password:", err);
      toast.error(tAccount("passwordError"));
    } finally {
      setPasswordSubmitting(false);
    }
  }, [newPassword, confirmPassword, userId, locale, tAccount]);

  const handleSuspendUser = useCallback(async () => {
    setSuspendSubmitting(true);
    try {
      const payload: { isSuspended: boolean; reason?: string } = {
        isSuspended: true,
      };
      if (suspendReason.trim()) {
        payload.reason = suspendReason.trim();
      }
      const result = await axiosPatch<
        typeof payload,
        { isSuspended: boolean; message?: string }
      >(`/admin/users/${userId}/suspend`, locale, payload);
      if (result.status) {
        toast.success(tAccount("suspendSuccess"));
        setSuspendModalOpen(false);
        setSuspendReason("");
        fetchUserDetails();
      } else {
        toast.error(tAccount("suspendError"));
      }
    } catch (err) {
      console.error("Error suspending user:", err);
      toast.error(tAccount("suspendError"));
    } finally {
      setSuspendSubmitting(false);
    }
  }, [userId, locale, suspendReason, tAccount, fetchUserDetails]);

  const handleReactivateUser = useCallback(async () => {
    setAccountActionLoading(true);
    try {
      const result = await axiosPatch<
        { isSuspended: boolean },
        { isSuspended: boolean; message?: string }
      >(`/admin/users/${userId}/suspend`, locale, { isSuspended: false });
      if (result.status) {
        toast.success(tAccount("reactivateSuccess"));
        setReactivateConfirmOpen(false);
        fetchUserDetails();
      } else {
        toast.error(tAccount("reactivateError"));
      }
    } catch (err) {
      console.error("Error reactivating user:", err);
      toast.error(tAccount("reactivateError"));
    } finally {
      setAccountActionLoading(false);
    }
  }, [userId, locale, tAccount, fetchUserDetails]);

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
      const result = await axiosPatch<typeof profileForm, { success?: boolean }>(
        `/admin/users/${userId}/profile`,
        locale,
        profileForm,
      );
      if (result.status) {
        toast.success(tCustomer("profile.saveSuccess"));
        setEditProfileOpen(false);
        fetchUserDetails();
      } else {
        toast.error(tCustomer("profile.saveError"));
      }
    } catch (err) {
      console.error(err);
      toast.error(tCustomer("profile.saveError"));
    } finally {
      setProfileSubmitting(false);
    }
  }, [profileForm, userId, locale, tCustomer, fetchUserDetails]);

  const handleToggleBlock = useCallback(async () => {
    const isBlocked = !userData?.user?.isBlocked;
    setBlockSubmitting(true);
    try {
      const result = await axiosPatch<
        { isBlocked: boolean; reason?: string },
        { success?: boolean }
      >(`/admin/users/${userId}/block`, locale, {
        isBlocked,
        reason: blockReason.trim() || undefined,
      });
      if (result.status) {
        toast.success(
          isBlocked ? tCustomer("block.blockSuccess") : tCustomer("block.unblockSuccess"),
        );
        setBlockModalOpen(false);
        setBlockReason("");
        fetchUserDetails();
      } else {
        toast.error(tCustomer("block.error"));
      }
    } finally {
      setBlockSubmitting(false);
    }
  }, [userData?.user?.isBlocked, userId, locale, blockReason, tCustomer, fetchUserDetails]);

  const handleSoftDelete = useCallback(async () => {
    setSoftDeleteLoading(true);
    try {
      const result = await axiosPost<Record<string, never>, { success?: boolean }>(
        `/admin/users/${userId}/soft-delete`,
        locale,
        {},
      );
      if (result.status) {
        toast.success(tCustomer("softDelete.success"));
        setSoftDeleteConfirmOpen(false);
        fetchUserDetails();
      } else {
        toast.error(tCustomer("softDelete.error"));
      }
    } finally {
      setSoftDeleteLoading(false);
    }
  }, [userId, locale, tCustomer, fetchUserDetails]);

  const handleRestoreUser = useCallback(async () => {
    setAccountActionLoading(true);
    try {
      const result = await axiosPost<Record<string, never>, { success?: boolean }>(
        `/admin/users/${userId}/restore`,
        locale,
        {},
      );
      if (result.status) {
        toast.success(tCustomer("restore.success"));
        fetchUserDetails();
      } else {
        toast.error(tCustomer("restore.error"));
      }
    } finally {
      setAccountActionLoading(false);
    }
  }, [userId, locale, tCustomer, fetchUserDetails]);

  const handleSendResetLink = useCallback(async () => {
    setResetLinkLoading(true);
    try {
      const result = await axiosPost<{ locale: string }, { success?: boolean }>(
        `/admin/users/${userId}/send-reset-password`,
        locale,
        { locale },
      );
      if (result.status) {
        toast.success(tCustomer("resetLink.success"));
      } else {
        toast.error(tCustomer("resetLink.error"));
      }
    } finally {
      setResetLinkLoading(false);
    }
  }, [userId, locale, tCustomer]);

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
    setPlansLoading(true);
    try {
      const result = await axiosGet<{ plans: Plan[] }>(
        "/admin/plans/subscription",
        locale,
      );
      if (result.status && result.data?.plans?.length) {
        setPlans(result.data.plans);
        const freePlan = result.data.plans.find(
          (p) => p.name?.toLowerCase() === "free",
        );
        const proPlan = result.data.plans.find(
          (p) => p.name?.toLowerCase() === "pro",
        );
        const currentPlanName = userData?.user?.planName?.toLowerCase();
        const defaultPlan =
          currentPlanName === "pro" && proPlan
            ? proPlan
            : freePlan || result.data.plans[0];
        const today = new Date().toISOString().slice(0, 10);
        setSubscriptionForm({
          planId: defaultPlan?.id ?? result.data.plans[0].id,
          billingCycle:
            defaultPlan?.name?.toLowerCase() === "free" ? "free" : "yearly",
          startDate: today,
          endDate: "",
        });
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      toast.error(t("subscriptionInfo.plansLoadError"));
    } finally {
      setPlansLoading(false);
    }
  }, [locale, userData?.user?.planName]);

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
      const result = await axiosPatch<
        typeof payload,
        { message: string; subscription: unknown }
      >(`/admin/users/${userId}/subscription`, locale, payload);
      if (result.status) {
        toast.success(t("subscriptionInfo.changeSuccess"));
        setSubscriptionModalOpen(false);
        fetchUserDetails();
      } else {
        toast.error(t("subscriptionInfo.changeError"));
      }
    } catch (err) {
      console.error("Error updating subscription:", err);
      toast.error(t("subscriptionInfo.changeError"));
    } finally {
      setSubscriptionSubmitting(false);
    }
  }, [subscriptionForm, plans, userId, locale, t, fetchUserDetails]);

  const handleSaveExtraMenus = useCallback(async () => {
    const parsed = parseInt(extraMenusInput, 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      toast.error(t("subscriptionInfo.extraMenusInvalid"));
      return;
    }
    setExtraMenusSaving(true);
    try {
      const result = await axiosPatch<
        { extraMenus: number },
        { message?: string; effectiveMaxMenus?: number }
      >(`/admin/users/${userId}/extra-menus`, locale, {
        extraMenus: parsed,
      });
      if (result.status) {
        toast.success(t("subscriptionInfo.extraMenusSuccess"));
        await fetchUserDetails();
      } else {
        toast.error(t("subscriptionInfo.extraMenusError"));
      }
    } catch (err) {
      console.error("Error updating extra menus:", err);
      toast.error(t("subscriptionInfo.extraMenusError"));
    } finally {
      setExtraMenusSaving(false);
    }
  }, [extraMenusInput, userId, locale, t, fetchUserDetails]);

  const handleApplyFreeLimits = useCallback(async () => {
    setApplyFreeLoading(true);
    try {
      const result = await axiosPost<
        Record<string, never>,
        { message: string }
      >(`/admin/users/${userId}/apply-free-limits`, locale, {});
      if (result.status) {
        toast.success(t("subscriptionInfo.applyFreeSuccess"));
        setApplyFreeConfirmOpen(false);
        fetchUserDetails();
      } else {
        toast.error(t("subscriptionInfo.applyFreeError"));
      }
    } catch (err) {
      console.error("Error applying free limits:", err);
      toast.error(t("subscriptionInfo.applyFreeError"));
    } finally {
      setApplyFreeLoading(false);
    }
  }, [userId, locale, t, fetchUserDetails]);

  if (loading) {
    return <LoadingBlock label={t("loading")} className="min-h-[400px]" />;
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

  const planBaseMenus =
    user.maxMenus ?? activeSubscription?.maxMenus ?? 1;
  const currentExtraMenus =
    user.extraMenus ?? activeSubscription?.extraMenus ?? 0;
  const effectiveMenuLimit =
    user.effectiveMaxMenus ?? planBaseMenus + currentExtraMenus;
  const hasActiveSubscription =
    String(subscription.status ?? user.subscriptionStatus).toLowerCase() ===
      "active" && Boolean(user.subscriptionId ?? activeSubscription?.id);

  const textDir = isRTL ? "rtl" : "ltr";
  return (
    <div className="space-y-6 pb-8 text-fg" dir={textDir}>
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button
            variant="secondary"
            startIcon={<IoArrowBack />}
            onClick={() => router.push(listReturnPath)}
          >
            {t("back")}
          </Button>
        }
      />

      <Card padded="lg" className="space-y-6">
        <SectionHeader
          title={t("subscriptionInfo.title")}
          actions={
            <Button onClick={openSubscriptionModal}>
              {t("subscriptionInfo.changeSubscription")}
            </Button>
          }
        />
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
                className="w-full max-w-[160px]"
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

      {userAnalytics && (
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
              value={
                userAnalytics.daysSinceLogin ?? t("analytics.neverLoggedIn")
              }
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
      )}

      {user && (
        <Card padded="lg">
          <UserFollowUpTimeline
            userId={user.id}
            userName={user.name}
            phoneNumber={user.phoneNumber}
          />
        </Card>
      )}

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

      <Card padded="lg" className="space-y-6">
        <SectionHeader title={t("basicInfo.title")} />
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {t("basicInfo.name")}
            </dt>
            <dd className="text-[15px] font-semibold text-fg">{user.name}</dd>
          </div>
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {t("basicInfo.restaurantName")}
            </dt>
            <dd className="text-[15px] font-semibold text-fg">
              {user.restaurantName?.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {t("basicInfo.plan")}
            </dt>
            <dd>
              <Badge
                tone={
                  user.planName?.toLowerCase() === "free" || !user.planName
                    ? "brand"
                    : "info"
                }
              >
                {user.planName || t("free")}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {t("basicInfo.emailStatus")}
            </dt>
            <dd>
              <Badge tone="warning">{t("unverified")}</Badge>
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {t("basicInfo.email")}
            </dt>
            <dd className="text-[15px] font-semibold text-fg">{user.email}</dd>
          </div>
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {t("basicInfo.status")}
            </dt>
            <dd>
              <Badge tone={getAccountStatusTone(user.accountStatus)} dot>
                {getAccountStatusLabel(user.accountStatus)}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {tCustomer("lastActivity")}
            </dt>
            <dd className="text-[15px] font-semibold text-fg">
              {formatDate(user.lastLoginAt ?? user.updatedAt ?? null)}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {t("basicInfo.phoneNumber")}
            </dt>
            <dd className="text-[15px] font-semibold text-fg">
              {user.phoneNumber ? (
                <PhoneDisplay value={user.phoneNumber} />
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {t("basicInfo.registrationDate")}
            </dt>
            <dd className="text-[15px] font-semibold text-fg">
              {formatDate(user.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-[13px] text-fg-muted">
              {t("basicInfo.lastLogin")}
            </dt>
            <dd className="text-[15px] font-semibold text-fg">
              {formatDate(user.lastLoginAt)}
            </dd>
          </div>
        </dl>
      </Card>

      <Card padded="lg" className="space-y-4">
        <SectionHeader title={tAccount("title")} />
        {user.isSuspended && user.suspendedReason && (
          <p className="text-[13px] text-danger">
            {tAccount("suspendedReasonLabel")}: {user.suspendedReason}
          </p>
        )}
        {user.isBlocked && user.blockedReason && (
          <p className="text-[13px] text-warning">
            {tCustomer("block.reasonLabel")}: {user.blockedReason}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openEditProfile}>
            {tCustomer("profile.edit")}
          </Button>
          <Button onClick={() => setPasswordModalOpen(true)}>
            {tAccount("changePassword")}
          </Button>
          <Button
            variant="secondary"
            onClick={handleSendResetLink}
            loading={resetLinkLoading}
          >
            {resetLinkLoading
              ? tCustomer("resetLink.sending")
              : tCustomer("resetLink.send")}
          </Button>
          {user.isSuspended ? (
            <Button
              onClick={() => setReactivateConfirmOpen(true)}
              disabled={accountActionLoading}
            >
              {tAccount("reactivate")}
            </Button>
          ) : (
            <Button variant="danger" onClick={() => setSuspendModalOpen(true)}>
              {tAccount("suspend")}
            </Button>
          )}
          <Button variant="secondary" onClick={() => setBlockModalOpen(true)}>
            {user.isBlocked
              ? tCustomer("block.unblock")
              : tCustomer("block.block")}
          </Button>
          {user.deletedAt ? (
            <Button
              variant="secondary"
              onClick={handleRestoreUser}
              disabled={accountActionLoading}
            >
              {tCustomer("restore.action")}
            </Button>
          ) : (
            <Button
              variant="dangerGhost"
              onClick={() => setSoftDeleteConfirmOpen(true)}
            >
              {tCustomer("softDelete.action")}
            </Button>
          )}
        </div>
      </Card>

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

      <section className="space-y-4">
        <SectionHeader title={t("statistics.title")} />
        <StatGrid columns={3}>
          <StatCard
            label={t("statistics.subscriptionType")}
            value={user.planName || t("free")}
          />
          <StatCard
            label={t("statistics.emailVerification")}
            value={user.isEmailVerified ? t("verified") : t("unverified")}
            icon={
              user.isEmailVerified ? (
                <FaCheckCircle className="text-success" />
              ) : (
                <FaTimesCircle className="text-danger" />
              )
            }
          />
          <StatCard
            label={t("statistics.numberOfLists")}
            value={menus.length}
          />
        </StatGrid>
      </section>

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
      <CustomerOrdersSection
        userId={Number(userId)}
        onSelectOrder={setSelectedOrder}
      />
      <CustomerAddressesSection userId={Number(userId)} />
      <CustomerNotesSection userId={Number(userId)} />
      <CustomerVouchersSection userId={Number(userId)} />
      <CustomerActivitySection userId={Number(userId)} />
      <CustomerSupportSection userId={Number(userId)} />

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
                setProfileForm((f) => ({ ...f, restaurantName: e.target.value }))
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
            <Button variant="secondary" onClick={() => setBlockModalOpen(false)}>
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
    </div>
  );
}
