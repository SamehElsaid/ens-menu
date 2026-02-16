"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { FaTimesCircle, FaTimes } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import { axiosGet, axiosPatch, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";

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
}

export default function UserDetailsPage() {
    const locale = useLocale();
    const t = useTranslations("adminUsers.userDetails");
    const router = useRouter();
    const params = useParams();
    const userId = typeof params.userId === "string" ? params.userId : (params.userId as string[])?.[0] ?? "";
    const isRTL = locale === "ar";

    const [userData, setUserData] = useState<UserDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmingMenu, setConfirmingMenu] = useState<Menu | null>(null);
    const [updatingMenuId, setUpdatingMenuId] = useState<number | null>(null);
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

    const fetchUserDetails = useCallback(async () => {
        try {
            setLoading(true);
            const result = await axiosGet<UserDetailsResponse>(
                `/admin/users/${userId}`,
                locale
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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
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
            const result = await axiosGet<{ plans: Plan[] }>("/admin/plans/subscription", locale);
            if (result.status && result.data?.plans?.length) {
                setPlans(result.data.plans);
                const freePlan = result.data.plans.find((p) => p.name?.toLowerCase() === "free");
                const proPlan = result.data.plans.find((p) => p.name?.toLowerCase() === "pro");
                const currentPlanName = userData?.user?.planName?.toLowerCase();
                const defaultPlan = currentPlanName === "pro" && proPlan ? proPlan : freePlan || result.data.plans[0];
                const today = new Date().toISOString().slice(0, 10);
                setSubscriptionForm({
                    planId: defaultPlan?.id ?? result.data.plans[0].id,
                    billingCycle: defaultPlan?.name?.toLowerCase() === "free" ? "free" : "yearly",
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
        const isFree = plans.find((p) => p.id === subscriptionForm.planId)?.name?.toLowerCase() === "free";
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
            const result = await axiosPatch<typeof payload, { message: string; subscription: unknown }>(
                `/admin/users/${userId}/subscription`,
                locale,
                payload
            );
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
            const result = await axiosPost<Record<string, never>, { message: string }>(
                `/admin/users/${userId}/apply-free-limits`,
                locale,
                {}
            );
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

    const handleToggleMenuStatus = async (menu: Menu) => {
        if (!userData) return;

        try {
            setUpdatingMenuId(menu.id);
            const newStatus = !menu.isActive;
            const result = await axiosPatch<{ isActive: boolean }, Menu>(
                `/menus/${menu.id}/status`,
                locale,
                { isActive: newStatus }
            );

            if (result.status && result.data) {
                // Update the menu in the local state
                setUserData({
                    ...userData,
                    menus: userData.menus.map((m) =>
                        m.id === menu.id ? { ...m, isActive: newStatus } : m
                    ),
                });
                toast.success(
                    newStatus 
                        ? t("lists.activateSuccess") 
                        : t("lists.deactivateSuccess")
                );
                setConfirmingMenu(null);
            } else {
                toast.error(t("lists.updateError"));
            }
        } catch (error) {
            console.error("Error updating menu status:", error);
            toast.error(t("lists.updateError"));
        } finally {
            setUpdatingMenuId(null);
        }
    };

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
    const activeSubscription = userData.subscriptions?.find(sub => sub.status === "active") || userData.subscriptions?.[0];
    const subscription = activeSubscription || {
        billingCycle: user.billingCycle,
        startDate: user.startDate,
        endDate: user.endDate,
        planName: user.planName,
        status: user.subscriptionStatus,
    };

    return (
        <div className="space-y-6 pb-8">
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

            {/* Subscription Information Card */}
            <CardDashBoard>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                    {t("subscriptionInfo.title")}
                </h2>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? "text-right" : "text-left"}`}>
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
                <div className={`flex items-center gap-3 mt-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <button
                        type="button"
                        onClick={openSubscriptionModal}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        {t("subscriptionInfo.changeSubscription")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setApplyFreeConfirmOpen(true)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        {t("subscriptionInfo.applyFreeRestrictions")}
                    </button>
                </div>
            </CardDashBoard>

            {/* Change Subscription Modal */}
            {subscriptionModalOpen && (
                <div
                    className="fixed m-0 p-4 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    style={{ top: 0, left: 0, right: 0, bottom: 0, width: "100vw", minHeight: "100dvh" }}
                >
                    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${isRTL ? "text-right" : "text-left"}`}>
                        <div className="p-6">
                            <div className={`flex items-center justify-between mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                    {t("subscriptionInfo.changeSubscription")}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => !subscriptionSubmitting && setSubscriptionModalOpen(false)}
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
                                                    billingCycle: plan?.name?.toLowerCase() === "free" ? "free" : prev.billingCycle === "free" ? "yearly" : prev.billingCycle,
                                                }));
                                            }}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary"
                                            required
                                        >
                                            <option value="">{t("subscriptionInfo.selectPlan")}</option>
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {plans.find((p) => p.id === subscriptionForm.planId)?.name?.toLowerCase() !== "free" && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                {t("subscriptionInfo.billingCycle")}
                                            </label>
                                            <select
                                                value={subscriptionForm.billingCycle}
                                                onChange={(e) =>
                                                    setSubscriptionForm((prev) => ({ ...prev, billingCycle: e.target.value }))
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
                                                setSubscriptionForm((prev) => ({ ...prev, startDate: e.target.value }))
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
                                                setSubscriptionForm((prev) => ({ ...prev, endDate: e.target.value }))
                                            }
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary"
                                        />
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {t("subscriptionInfo.endDateHint")}
                                        </p>
                                    </div>
                                    <div className={`flex gap-3 pt-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                                        <button
                                            type="button"
                                            onClick={() => !subscriptionSubmitting && setSubscriptionModalOpen(false)}
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
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? "text-right" : "text-left"}`}>
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
                            {t("basicInfo.plan")}
                        </p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.planName?.toLowerCase() === "free" || !user.planName
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}>
                            {user.planName || t("free")}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            {t("basicInfo.emailStatus")}
                        </p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${!user.isSuspended
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                            {!user.isSuspended ? t("status.active") : t("status.suspended")}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                            {t("basicInfo.phoneNumber")}
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {user.phoneNumber || "-"}
                        </p>
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

            {/* Lists Section */}
            <CardDashBoard>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                    {t("lists.title")} ({menus.length})
                </h2>
                {menus.length > 0 ? (
                    <div className="space-y-4">
                        {menus.map((menu) => (
                            <div

                                key={menu.id}
                                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                                <div className={`flex items-start justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                            {isRTL ? (menu.nameAr || menu.name) : (menu.nameEn || menu.name)}
                                        </h3>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3 ${menu.isActive
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                                            }`}>
                                            {menu.isActive ? t("status.active") : t("status.suspended")}
                                        </span>
                                        <div className={`flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 ${isRTL ? "flex-row-reverse" : ""}`}>
                                            <span>
                                                {t("lists.link")}: {menu.slug}
                                            </span>
                                            <span>
                                                {t("lists.products")}: {menu.itemsCount || menu.activeItemsCount || 0}
                                            </span>
                                            <span>
                                                {t("lists.date")}: {formatDate(menu.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                                    <a 
                                        href={`https://${menu.slug}${process.env.NEXT_PUBLIC_MENU_URL}`} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                    >
                                        {t("lists.view")}
                                    </a>
                                    <button 
                                        onClick={() => setConfirmingMenu(menu)}
                                        disabled={updatingMenuId === menu.id}
                                        className={`px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px] ${
                                            menu.isActive
                                                ? "bg-red-600 hover:bg-red-700 disabled:hover:bg-red-600"
                                                : "bg-green-600 hover:bg-green-700 disabled:hover:bg-green-600"
                                        }`}
                                    >
                                        {updatingMenuId === menu.id ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>{t("lists.updating")}</span>
                                            </>
                                        ) : (
                                            menu.isActive ? t("lists.stop") : t("lists.activate")
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500 dark:text-slate-400">
                            {t("lists.noMenus")}
                        </p>
                    </div>
                )}
            </CardDashBoard>

            {/* Confirmation Modal */}
            {confirmingMenu && (() => {
                const menuName = isRTL
                    ? (confirmingMenu.nameAr || confirmingMenu.name || "")
                    : (confirmingMenu.nameEn || confirmingMenu.name || "");
                const isUpdating = updatingMenuId === confirmingMenu.id;
                return (
                    <ConfirmationModal
                        isOpen={true}
                        onClose={() => !isUpdating && setConfirmingMenu(null)}
                        onConfirm={() => handleToggleMenuStatus(confirmingMenu)}
                        title={confirmingMenu.isActive ? t("lists.confirmStopTitle") : t("lists.confirmActivateTitle")}
                        message={
                            confirmingMenu.isActive
                                ? t("lists.confirmStopMessage", { menuName })
                                : t("lists.confirmActivateMessage", { menuName })
                        }
                        confirmText={confirmingMenu.isActive ? t("lists.stop") : t("lists.activate")}
                        cancelText={t("lists.cancel")}
                        isLoading={isUpdating}
                        loadingText={t("lists.updating")}
                    />
                );
            })()}
        </div>
    );
}
