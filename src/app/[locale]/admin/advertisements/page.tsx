"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { IoArrowBack, IoAddOutline, IoMegaphoneOutline, IoLinkOutline } from "react-icons/io5";
import { FaSpinner, FaEye, FaTrash, FaEdit, FaBan, FaMousePointer, FaChartLine } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosDelete, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import LoadImage from "@/components/ImageLoad";
import AddAdvertisementModal from "@/components/Dashboard/AddAdvertisementModal";
import type { Advertisement as BaseAdvertisement } from "@/types/Menu";

interface Advertisement extends BaseAdvertisement {
    id: number;
    clickCount?: number;
    impressionCount?: number;
    displayOrder?: number;
    position?: string;
    startDate?: string | null;
    endDate?: string | null;
    [key: string]: unknown;
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
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

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

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    return (
        <div className="space-y-6 pb-10 ">
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
                <CardDashBoard borderColor="border-blue-200 dark:border-blue-500/20" hover={true}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-500/20 dark:to-blue-600/10 flex items-center justify-center shadow-sm">
                            <IoMegaphoneOutline className="text-blue-600 dark:text-blue-400 text-2xl" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                                {t("totalAds")}
                            </p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-all duration-300">
                                {loading ? (
                                    <span className="inline-block w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    stats.total.toLocaleString()
                                )}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>

                <CardDashBoard borderColor="border-green-200 dark:border-green-500/20" hover={true}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-green-50 to-green-100 dark:from-green-500/20 dark:to-green-600/10 flex items-center justify-center shadow-sm">
                            <FaChartLine className="text-green-600 dark:text-green-400 text-xl" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                                {t("activeAds")}
                            </p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 transition-all duration-300">
                                {loading ? (
                                    <span className="inline-block w-8 h-8 border-2 border-green-300 dark:border-green-600 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    stats.totalActive.toLocaleString()
                                )}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>

                <CardDashBoard borderColor="border-purple-200 dark:border-purple-500/20" hover={true}>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-500/20 dark:to-purple-600/10 flex items-center justify-center shadow-sm">
                            <FaMousePointer className="text-purple-600 dark:text-purple-400 text-xl" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                                {t("totalClicks")}
                            </p>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-all duration-300">
                                {loading ? (
                                    <span className="inline-block w-8 h-8 border-2 border-purple-300 dark:border-purple-600 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    stats.totalClicks.toLocaleString()
                                )}
                            </p>
                        </div>
                    </div>
                </CardDashBoard>
            </div>

            {/* Add New Advertisement Button */}
            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    {!loading && (
                        <span>
                            {ads.length} {ads.length === 1 ? t("advertisement") : t("advertisements")}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => {
                        setEditingAd(null);
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <IoAddOutline className="text-lg" />
                    <span>{t("addNewAd")}</span>
                </button>
            </div>

            {/* Advertisements List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <CardDashBoard key={i}>
                            <div className={`flex gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                                <div className="shrink-0">
                                    <div className="w-32 h-32 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map((j) => (
                                            <div key={j} className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardDashBoard>
                    ))}
                </div>
            ) : ads.length === 0 ? (
                <CardDashBoard>
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                            <IoMegaphoneOutline className="text-5xl text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            {t("noAdsTitle")}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                            {t("noAdsDescription")}
                        </p>
                        <button
                            onClick={() => {
                                setEditingAd(null);
                                setShowAddModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <IoAddOutline className="text-lg" />
                            <span>{t("addNewAd")}</span>
                        </button>
                    </div>
                </CardDashBoard>
            ) : (
                <div className="space-y-4">
                    {ads.map((ad) => {
                        const isLoading = loadingAdId === ad.id;
                        const isActive = ad.isActive ?? false;

                        return (
                            <CardDashBoard key={ad.id} hover={true} className="transition-all duration-200 hover:shadow-lg">
                                <div className={`flex gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                                    {/* Image */}
                                    <div className="shrink-0">
                                        <div className="relative w-36 h-36 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden group cursor-pointer shadow-md">
                                            {ad.imageUrl ? (
                                                <>
                                                    <LoadImage
                                                        src={ad.imageUrl}
                                                        alt={getTitle(ad)}
                                                        className="w-36 h-36 object-cover transition-transform duration-300 group-hover:scale-110"
                                                        width={144}
                                                        height={144}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <IoMegaphoneOutline className="text-5xl" />
                                                </div>
                                            )}
                                            {/* Status Badge Overlay */}
                                            <div className={`absolute top-2 ${isRTL ? "left-2" : "right-2"}`}>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${
                                                        isActive
                                                            ? "bg-green-500/90 text-white"
                                                            : "bg-slate-500/90 text-white"
                                                    }`}
                                                >
                                                    {isActive ? t("status.active") : t("status.inactive")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Title and Date */}
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">
                                                    {getTitle(ad)}
                                                </h3>
                                                {ad.createdAt && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        {t("createdAt")}: {formatDate(ad.createdAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {getContent(ad) && (
                                            <div className="text-slate-600 dark:text-slate-400 mb-4 space-y-1 line-clamp-2">
                                                {getContent(ad)
                                                    .split("\n")
                                                    .filter((line) => line.trim())
                                                    .slice(0, 2)
                                                    .map((line, idx) => (
                                                        <p key={idx} className="text-sm">{line}</p>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Metrics */}
                                        <div className="flex items-center gap-6 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                                    <FaMousePointer className="text-purple-600 dark:text-purple-400 text-sm" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t("clicks")}</p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        {(ad.clickCount || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                                    <FaEye className="text-blue-600 dark:text-blue-400 text-sm" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t("views")}</p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        {(ad.impressionCount || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className={`flex items-center gap-2 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                                            <button
                                                onClick={() => {
                                                    setEditingAd(ad);
                                                    setShowAddModal(true);
                                                }}
                                                disabled={isLoading}
                                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                            >
                                                <FaEdit className="text-xs" />
                                                {t("actions.edit")}
                                            </button>

                                            {isActive ? (
                                                <button
                                                    onClick={() => setDeactivateModal({ isOpen: true, ad })}
                                                    disabled={isLoading}
                                                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                                >
                                                    <FaBan className="text-xs" />
                                                    {t("actions.deactivate")}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivate(ad.id)}
                                                    disabled={isLoading}
                                                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
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
                                                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                            >
                                                <FaTrash className="text-xs" />
                                                {t("actions.delete")}
                                            </button>

                                            {ad.linkUrl && (
                                                <button
                                                    onClick={() => window.open(ad.linkUrl, "_blank")}
                                                    disabled={isLoading}
                                                    className="px-4 py-2.5 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                                >
                                                    <IoLinkOutline className="text-xs" />
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

            {showAddModal && (
                <AddAdvertisementModal
                    adminMode
                    ad={editingAd}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingAd(null);
                    }}
                    onRefresh={fetchAds}
                />
            )}
        </div>
    );
}
