"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { FaTimesCircle, FaTimes } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import { axiosGet, axiosPatch, axiosPost } from "@/shared/axiosCall";
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
  accountStatus?: AccountStatus;
  planName: string;
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
  const router = useRouter();
  const params = useParams();
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
        setUserData(result.data);
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

  const getAccountStatusClass = (status?: AccountStatus) => {
    switch (status) {
      case "deleted":
        return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
      case "blocked":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{t("error")}</p>
        </div>
      </div>
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

  const textDir = isRTL ? "rtl" : "ltr";
  return (
    <div className="space-y-6 pb-8 text-slate-800 dark:text-slate-100" dir={textDir}>
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div
            className={`flex items-center gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
          >
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
          <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
        </div>
      </div>

      {/* Subscription Information Card */}
      <CardDashBoard>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          {t("subscriptionInfo.title")}
        </h2>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? "text-right" : "text-left"}`}
        >
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("subscriptionInfo.currentPlan")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {subscription.planName || t("free")}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("subscriptionInfo.paymentType")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {getBillingCycleLabel(subscription.billingCycle)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("subscriptionInfo.startDate")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatDate(subscription.startDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("subscriptionInfo.endDate")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatDate(subscription.endDate)}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-3 mt-6 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <button
            type="button"
            onClick={openSubscriptionModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {t("subscriptionInfo.changeSubscription")}
          </button>
        </div>
      </CardDashBoard>

      {userAnalytics && (
      <CardDashBoard>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          {t("analytics.title")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {t("analytics.menusCount")}
            </p>
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {userAnalytics.menusCount}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {t("analytics.activeMenus")}
            </p>
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {userAnalytics.activeMenus}
            </p>
          </div>
          <div className="rounded-xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/10 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {t("analytics.totalItems")}
            </p>
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {userAnalytics.totalItems}
            </p>
          </div>
          <div className="rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {t("analytics.activeItems")}
            </p>
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {userAnalytics.activeItems}
            </p>
          </div>
          <div className="rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-600 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {t("analytics.daysSinceLogin")}
            </p>
            <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {userAnalytics.daysSinceLogin ?? t("analytics.neverLoggedIn")}
            </p>
          </div>
          {userAnalytics.daysUntilExpiry !== null &&
            userAnalytics.daysUntilExpiry <= 7 && (
              <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 col-span-2">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                  {t("analytics.expiringSoon")}
                </p>
                <p className="text-lg font-bold text-red-700 dark:text-red-300">
                  {t("analytics.daysUntilExpiry", {
                    days: userAnalytics.daysUntilExpiry,
                  })}
                </p>
              </div>
            )}
        </div>
      </CardDashBoard>
      )}

      {user && (
        <CardDashBoard>
          <UserFollowUpTimeline
            userId={user.id}
            userName={user.name}
            phoneNumber={user.phoneNumber}
          />
        </CardDashBoard>
      )}

      {/* Change Subscription Modal */}
      {subscriptionModalOpen && (
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
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className="p-6">
              <div
                className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {t("subscriptionInfo.changeSubscription")}
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    !subscriptionSubmitting && setSubscriptionModalOpen(false)
                  }
                  disabled={subscriptionSubmitting}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              {plansLoading ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                  {t("loading")}
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChangeSubscription();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("subscriptionInfo.plan")}
                    </label>
                    <select
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
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="">
                        {t("subscriptionInfo.selectPlan")}
                      </option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {plans
                    .find((p) => p.id === subscriptionForm.planId)
                    ?.name?.toLowerCase() !== "free" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("subscriptionInfo.billingCycle")}
                      </label>
                      <select
                        value={subscriptionForm.billingCycle}
                        onChange={(e) =>
                          setSubscriptionForm((prev) => ({
                            ...prev,
                            billingCycle: e.target.value,
                          }))
                        }
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="monthly">{t("monthly")}</option>
                        <option value="yearly">{t("yearly")}</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("subscriptionInfo.startDate")}
                    </label>
                    <input
                      type="date"
                      value={subscriptionForm.startDate}
                      onChange={(e) =>
                        setSubscriptionForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("subscriptionInfo.endDateOptional")}
                    </label>
                    <input
                      type="date"
                      value={subscriptionForm.endDate}
                      onChange={(e) =>
                        setSubscriptionForm((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("subscriptionInfo.endDateHint")}
                    </p>
                  </div>
                  <div
                    className={`flex gap-3 pt-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        !subscriptionSubmitting &&
                        setSubscriptionModalOpen(false)
                      }
                      disabled={subscriptionSubmitting}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                    >
                      {t("lists.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={subscriptionSubmitting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {subscriptionSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t("subscriptionInfo.saving")}
                        </>
                      ) : (
                        t("subscriptionInfo.save")
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Free Limits Confirmation */}
      {applyFreeConfirmOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => !applyFreeLoading && setApplyFreeConfirmOpen(false)}
          onConfirm={handleApplyFreeLimits}
          title={t("subscriptionInfo.applyFreeConfirmTitle")}
          message={t("subscriptionInfo.applyFreeConfirmMessage")}
          confirmText={t("subscriptionInfo.applyFreeRestrictions")}
          cancelText={t("lists.cancel")}
          isLoading={applyFreeLoading}
          loadingText={t("subscriptionInfo.applyFreeLoading")}
        />
      )}

      {/* Basic Information Card */}
      <CardDashBoard>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          {t("basicInfo.title")}
        </h2>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? "text-right" : "text-left"}`}
        >
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("basicInfo.name")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {user.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("basicInfo.restaurantName")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {user.restaurantName?.trim() || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("basicInfo.plan")}
            </p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                user.planName?.toLowerCase() === "free" || !user.planName
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
            >
              {user.planName || t("free")}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("basicInfo.emailStatus")}
            </p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}
            >
              {t("unverified")}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("basicInfo.email")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {user.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("basicInfo.status")}
            </p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getAccountStatusClass(user.accountStatus)}`}
            >
              {getAccountStatusLabel(user.accountStatus)}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {tCustomer("lastActivity")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatDate(user.lastLoginAt ?? user.updatedAt ?? null)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("basicInfo.phoneNumber")}
            </p>
            {user.phoneNumber ? (
              <PhoneDisplay
                value={user.phoneNumber}
                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
              />
            ) : (
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                -
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("basicInfo.registrationDate")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatDate(user.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {t("basicInfo.lastLogin")}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatDate(user.lastLoginAt)}
            </p>
          </div>
        </div>
      </CardDashBoard>

      {/* Account management */}
      <CardDashBoard>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {tAccount("title")}
        </h2>
        {user.isSuspended && user.suspendedReason && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {tAccount("suspendedReasonLabel")}: {user.suspendedReason}
          </p>
        )}
        {user.isBlocked && user.blockedReason && (
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
            {tCustomer("block.reasonLabel")}: {user.blockedReason}
          </p>
        )}
        <div
          className={`flex flex-wrap gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <button
            type="button"
            onClick={openEditProfile}
            className="px-4 py-2.5 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            {tCustomer("profile.edit")}
          </button>
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            {tAccount("changePassword")}
          </button>
          <button
            type="button"
            onClick={handleSendResetLink}
            disabled={resetLinkLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {resetLinkLoading ? tCustomer("resetLink.sending") : tCustomer("resetLink.send")}
          </button>
          {user.isSuspended ? (
            <button
              type="button"
              onClick={() => setReactivateConfirmOpen(true)}
              disabled={accountActionLoading}
              className="px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {tAccount("reactivate")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSuspendModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              {tAccount("suspend")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setBlockModalOpen(true)}
            className={`px-4 py-2.5 rounded-xl text-white font-semibold transition-colors ${
              user.isBlocked
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {user.isBlocked ? tCustomer("block.unblock") : tCustomer("block.block")}
          </button>
          {user.deletedAt ? (
            <button
              type="button"
              onClick={handleRestoreUser}
              disabled={accountActionLoading}
              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {tCustomer("restore.action")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSoftDeleteConfirmOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-500 text-white font-semibold hover:bg-slate-600 transition-colors"
            >
              {tCustomer("softDelete.action")}
            </button>
          )}
        </div>
      </CardDashBoard>

      {passwordModalOpen && (
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
            <div
              className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {tAccount("changePassword")}
              </h3>
              <button
                type="button"
                onClick={() =>
                  !passwordSubmitting && setPasswordModalOpen(false)
                }
                disabled={passwordSubmitting}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSetPassword();
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {tAccount("newPassword")}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
                  dir="ltr"
                  autoComplete="new-password"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {tAccount("passwordHint")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {tAccount("confirmPassword")}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
                  dir="ltr"
                  autoComplete="new-password"
                />
              </div>
              <div
                className={`flex gap-3 pt-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    !passwordSubmitting && setPasswordModalOpen(false)
                  }
                  disabled={passwordSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-medium disabled:opacity-50"
                >
                  {t("lists.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
                >
                  {passwordSubmitting
                    ? tAccount("savingPassword")
                    : tAccount("savePassword")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {suspendModalOpen && (
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
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {tAccount("suspendConfirmMessage")}
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
            />
            <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button
                type="button"
                onClick={() =>
                  !suspendSubmitting && setSuspendModalOpen(false)
                }
                disabled={suspendSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-medium disabled:opacity-50"
              >
                {t("lists.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSuspendUser}
                disabled={suspendSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50"
              >
                {suspendSubmitting ? t("lists.updating") : tAccount("suspend")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={reactivateConfirmOpen}
        onClose={() => !accountActionLoading && setReactivateConfirmOpen(false)}
        onConfirm={handleReactivateUser}
        title={tAccount("reactivateConfirmTitle")}
        message={tAccount("reactivateConfirmMessage")}
        confirmText={tAccount("reactivate")}
        cancelText={t("lists.cancel")}
        isLoading={accountActionLoading}
        loadingText={t("lists.updating")}
      />

      {/* Statistics Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {t("statistics.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardDashBoard borderColor="border-purple-200 dark:border-purple-500/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-400 mb-2">
                {user.planName || t("free")}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("statistics.subscriptionType")}
              </p>
            </div>
          </CardDashBoard>
          <CardDashBoard borderColor="border-green-200 dark:border-green-500/20">
            <div className="text-center">
              <FaTimesCircle className="text-3xl text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("statistics.emailVerification")}
              </p>
            </div>
          </CardDashBoard>
          <CardDashBoard borderColor="border-blue-200 dark:border-blue-500/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-2">
                {menus.length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("statistics.numberOfLists")}
              </p>
            </div>
          </CardDashBoard>
        </div>
      </div>

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

      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-3">
            <h3 className="text-xl font-bold">{tCustomer("profile.edit")}</h3>
            <input
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder={t("basicInfo.name")}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <input
              value={profileForm.restaurantName}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, restaurantName: e.target.value }))
              }
              placeholder={t("basicInfo.restaurantName")}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <input
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder={t("basicInfo.email")}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              dir="ltr"
            />
            <input
              value={profileForm.phoneNumber}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
              placeholder={t("basicInfo.phoneNumber")}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              dir="ltr"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={profileSubmitting}
                className="flex-1 py-2 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
              >
                {tCustomer("profile.save")}
              </button>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200"
              >
                {t("lists.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">
              {user.isBlocked ? tCustomer("block.unblock") : tCustomer("block.block")}
            </h3>
            {!user.isBlocked && (
              <textarea
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder={tCustomer("block.reasonPlaceholder")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-4"
              />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleToggleBlock}
                disabled={blockSubmitting}
                className="flex-1 py-2 rounded-xl bg-orange-600 text-white font-semibold disabled:opacity-50"
              >
                {tCustomer("profile.save")}
              </button>
              <button
                type="button"
                onClick={() => setBlockModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200"
              >
                {t("lists.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={softDeleteConfirmOpen}
        onClose={() => !softDeleteLoading && setSoftDeleteConfirmOpen(false)}
        onConfirm={handleSoftDelete}
        title={tCustomer("softDelete.title")}
        message={tCustomer("softDelete.message")}
        confirmText={tCustomer("softDelete.action")}
        cancelText={t("lists.cancel")}
        isLoading={softDeleteLoading}
        loadingText={t("lists.updating")}
      />

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {tCustomer("orders.orderDetails")}
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">{tCustomer("orders.plan")}</dt>
                <dd className="font-semibold">{selectedOrder.planName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">{tCustomer("orders.status")}</dt>
                <dd className="font-semibold capitalize">{selectedOrder.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">{tCustomer("orders.amount")}</dt>
                <dd className="font-semibold">{selectedOrder.amount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">{tCustomer("orders.date")}</dt>
                <dd>{formatDate(selectedOrder.createdAt)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full py-2 rounded-xl border border-slate-200"
            >
              {t("lists.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
