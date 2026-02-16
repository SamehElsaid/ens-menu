"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { FaTimesCircle } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import { axiosGet, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";

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

    useEffect(() => {
        const fetchUserDetails = async () => {
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
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId, locale, t]);

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
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                        {t("subscriptionInfo.changeSubscription")}
                    </button>
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors">
                        {t("subscriptionInfo.applyFreeRestrictions")}
                    </button>
                </div>
            </CardDashBoard>

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
