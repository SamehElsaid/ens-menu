"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { IoArrowBack, IoAddOutline, IoMegaphoneOutline } from "react-icons/io5";
import { FaSpinner, FaEye, FaTrash, FaEdit, FaBan } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosDelete, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import LoadImage from "@/components/ImageLoad";

interface Advertisement {
    id: number;
    title?: string;
    titleAr?: string;
    content?: string;
    contentAr?: string;
    imageUrl?: string;
    linkUrl?: string;
    isActive?: boolean;
    clickCount?: number;
    impressionCount?: number;
    displayOrder?: number;
    position?: string;
    startDate?: string | null;
    endDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface AdsResponse {
    ads: Advertisement[];
    statistics: {
        total: number;
        totalActive: number;
        totalClicks: number;
    };
}

export default function AdminAdvertisementsPage() {
    const locale = useLocale();
    const t = useTranslations("adminAds");
    const router = useRouter();
    const isRTL = locale === "ar";

    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        totalActive: 0,
        totalClicks: 0,
    });
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        ad: Advertisement | null;
    }>({ isOpen: false, ad: null });
    const [deactivateModal, setDeactivateModal] = useState<{
        isOpen: boolean;
        ad: Advertisement | null;
    }>({ isOpen: false, ad: null });
    const [loadingAdId, setLoadingAdId] = useState<number | null>(null);

    const fetchAds = useCallback(async () => {
        try {
            setLoading(true);
            const result = await axiosGet<AdsResponse>("/admin/ads", locale);

            if (result.status && result.data) {
                setAds(result.data.ads || []);
                setStats(result.data.statistics || {
                    total: 0,
                    totalActive: 0,
                    totalClicks: 0,
                });
            } else {
                toast.error(t("error"));
            }
        } catch (err) {
            console.error("Error fetching ads:", err);
            toast.error(t("error"));
        } finally {
            setLoading(false);
        }
    }, [locale, t]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    const handleDelete = useCallback(async () => {
        if (!deleteModal.ad) return;

        const adId = deleteModal.ad.id;
        setLoadingAdId(adId);
        try {
            const result = await axiosDelete<{ message?: string }>(
                `/admin/ads/${adId}`,
                locale
            );

            if (result.status) {
                toast.success(t("deleteSuccess"));
                setDeleteModal({ isOpen: false, ad: null });
                fetchAds();
            } else {
                toast.error(t("deleteError"));
            }
        } catch (err) {
            console.error("Error deleting ad:", err);
            toast.error(t("deleteError"));
        } finally {
            setLoadingAdId(null);
        }
    }, [deleteModal.ad, locale, t, fetchAds]);

    const handleDeactivate = useCallback(async () => {
        if (!deactivateModal.ad) return;

        const adId = deactivateModal.ad.id;
        setLoadingAdId(adId);
        try {
            const payload = { isActive: false };
            const result = await axiosPatch<typeof payload, Advertisement>(
                `/admin/ads/${adId}`,
                locale,
                payload
            );

            if (result.status && result.data) {
                toast.success(t("deactivateSuccess"));
                setDeactivateModal({ isOpen: false, ad: null });
                fetchAds();
            } else {
                toast.error(t("deactivateError"));
            }
        } catch (err) {
            console.error("Error deactivating ad:", err);
            toast.error(t("deactivateError"));
        } finally {
            setLoadingAdId(null);
        }
    }, [deactivateModal.ad, locale, t, fetchAds]);

    const handleActivate = useCallback(async (adId: number) => {
        setLoadingAdId(adId);
        try {
            const payload = { isActive: true };
            const result = await axiosPatch<typeof payload, Advertisement>(
                `/admin/ads/${adId}`,
                locale,
                payload
            );

            if (result.status && result.data) {
                toast.success(t("activateSuccess"));
                fetchAds();
            } else {
                toast.error(t("activateError"));
            }
        } catch (err) {
            console.error("Error activating ad:", err);
            toast.error(t("activateError"));
        } finally {
            setLoadingAdId(null);
        }
    }, [locale, t, fetchAds]);

    const getTitle = (ad: Advertisement) => {
        return isRTL && ad.titleAr ? ad.titleAr : ad.title || "";
    };

    const getContent = (ad: Advertisement) => {
        return isRTL && ad.contentAr ? ad.contentAr : ad.content || "";
    };

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CardDashBoard borderColor="border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <IoMegaphoneOutline className="text-blue-600 dark:text-blue-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                {t("totalAds")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>

                <CardDashBoard borderColor="border-green-200 dark:border-green-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                            <FaEye className="text-green-600 dark:text-green-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                {t("activeAds")}
                            </p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {stats.totalActive}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>

                <CardDashBoard borderColor="border-purple-200 dark:border-purple-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                            <FaEye className="text-purple-600 dark:text-purple-400 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                {t("totalClicks")}
                            </p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {stats.totalClicks}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>
            </div>

            {/* Add New Advertisement Button */}
            <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
                <button
                    onClick={() => router.push("/admin/users/advertisements/new")}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                >
                    <IoAddOutline className="text-lg" />
                    <span>{t("addNewAd")}</span>
                </button>
            </div>

            {/* Advertisements List */}
            {loading ? (
                <CardDashBoard>
                    <div className="flex items-center justify-center py-12">
                        <FaSpinner className="animate-spin text-2xl text-slate-400" />
                    </div>
                </CardDashBoard>
            ) : ads.length === 0 ? (
                <CardDashBoard>
                    <div className="text-center py-12">
                        <p className="text-slate-500 dark:text-slate-400">
                            {t("noAds")}
                        </p>
                    </div>
                </CardDashBoard>
            ) : (
                <div className="space-y-4">
                    {ads.map((ad) => {
                        const isLoading = loadingAdId === ad.id;
                        const isActive = ad.isActive ?? false;

                        return (
                            <CardDashBoard key={ad.id}>
                                <div className={`flex gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                                    {/* Image */}
                                    <div className="shrink-0">
                                        <div className="w-32 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            {ad.imageUrl ? (
                                                <LoadImage
                                                    src={ad.imageUrl}
                                                    alt={getTitle(ad)}
                                                    className="w-full h-full object-cover"
                                                    width={128}
                                                    height={128}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <IoMegaphoneOutline className="text-4xl" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Status Badge */}
                                        <div className={`mb-2 ${isRTL ? "text-left" : "text-right"}`}>
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    isActive
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                                                }`}
                                            >
                                                {isActive ? t("status.active") : t("status.inactive")}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                            {getTitle(ad)}
                                        </h3>

                                        {/* Description */}
                                        <div className="text-slate-600 dark:text-slate-400 mb-3 space-y-1">
                                            {getContent(ad)
                                                .split("\n")
                                                .filter((line) => line.trim())
                                                .map((line, idx) => (
                                                    <p key={idx}>{line}</p>
                                                ))}
                                        </div>

                                        {/* Metrics */}
                                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                            {t("metrics", {
                                                clicks: ad.clickCount || 0,
                                                views: ad.impressionCount || 0,
                                            })}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className={`flex items-center gap-2 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                                            <button
                                                onClick={() => router.push(`/admin/users/advertisements/${ad.id}`)}
                                                disabled={isLoading}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <FaEdit className="text-xs" />
                                                {t("actions.edit")}
                                            </button>

                                            {isActive ? (
                                                <button
                                                    onClick={() => setDeactivateModal({ isOpen: true, ad })}
                                                    disabled={isLoading}
                                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <FaBan className="text-xs" />
                                                    {t("actions.deactivate")}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivate(ad.id)}
                                                    disabled={isLoading}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    {isLoading ? (
                                                        <FaSpinner className="animate-spin text-xs" />
                                                    ) : (
                                                        <>
                                                            <FaEye className="text-xs" />
                                                            {t("actions.activate")}
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, ad })}
                                                disabled={isLoading}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <FaTrash className="text-xs" />
                                                {t("actions.delete")}
                                            </button>

                                            {ad.linkUrl && (
                                                <button
                                                    onClick={() => window.open(ad.linkUrl, "_blank")}
                                                    disabled={isLoading}
                                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <FaEye className="text-xs" />
                                                    {t("actions.viewLink")}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardDashBoard>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, ad: null })}
                onConfirm={handleDelete}
                title={t("deleteConfirmTitle")}
                message={t("deleteConfirm", { title: deleteModal.ad ? getTitle(deleteModal.ad) : "" })}
                confirmText={t("actions.delete")}
                cancelText={t("actions.cancel")}
                isLoading={loadingAdId === deleteModal.ad?.id}
                loadingText={t("deleting")}
            />

            {/* Deactivate Confirmation Modal */}
            <ConfirmationModal
                isOpen={deactivateModal.isOpen}
                onClose={() => setDeactivateModal({ isOpen: false, ad: null })}
                onConfirm={handleDeactivate}
                title={t("deactivateConfirmTitle")}
                message={t("deactivateConfirm", { title: deactivateModal.ad ? getTitle(deactivateModal.ad) : "" })}
                confirmText={t("actions.deactivate")}
                cancelText={t("actions.cancel")}
                isLoading={loadingAdId === deactivateModal.ad?.id}
                loadingText={t("deactivating")}
            />
        </div>
    );
}
