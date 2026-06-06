"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "@/i18n/navigation";
import {
  IoArrowBack,
  IoTicketOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoShuffleOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoCopyOutline,
  IoCloseOutline,
  IoTimeOutline,
  IoPricetagOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoBanOutline,
} from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPatch,
} from "@/shared/axiosCall";
import { toast } from "react-toastify";
import type {
  CreateVoucherPayload,
  DiscountType,
  DurationUnit,
  UpdateVoucherPayload,
  Voucher,
  VoucherRedemption,
  VoucherType,
  VoucherBillingCycle,
} from "@/types/Voucher";

type VouchersListResponse = { vouchers: Voucher[] };
type VoucherResponse = { voucher: Voucher };
type RedemptionsResponse = { redemptions: VoucherRedemption[] };

type TypeFilter = "all" | VoucherType;
type StatusFilter = "all" | "active" | "inactive";

const EMPTY_FORM: CreateVoucherPayload = {
  code: "",
  type: "discount",
  discountType: "percentage",
  discountValue: 10,
  billingCycle: "monthly",
  durationUnit: "months",
  durationValue: 1,
  maxUses: 1,
  isActive: true,
  validFrom: null,
  validUntil: null,
  description: "",
};

const RANDOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRandomVoucherCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(
    bytes,
    (b) => RANDOM_CODE_CHARS[b % RANDOM_CODE_CHARS.length],
  ).join("");
}

function isVoucherExpired(v: Voucher): boolean {
  if (!v.validUntil) return false;
  return new Date(v.validUntil) < new Date();
}

function usagePercent(v: Voucher): number {
  if (v.maxUses <= 0) return 0;
  return Math.min(100, Math.round((v.usedCount / v.maxUses) * 100));
}

function StatCard({
  label,
  value,
  icon,
  tone,
  locale,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: string;
  locale: string;
}) {
  return (
    <CardDashBoard hover className="p-4!">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {value.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
          </p>
        </div>
      </div>
    </CardDashBoard>
  );
}

export default function AdminVouchersPage() {
  const locale = useLocale();
  const t = useTranslations("adminVouchers");
  const router = useRouter();
  const isRTL = locale === "ar";
  const textDir = isRTL ? "rtl" : "ltr";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateVoucherPayload>(EMPTY_FORM);
  const [redemptions, setRedemptions] = useState<VoucherRedemption[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    voucher: Voucher | null;
  }>({ isOpen: false, voucher: null });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosGet<VouchersListResponse>(
        "/admin/vouchers",
        locale,
      );
      if (res.status && res.data?.vouchers) {
        setVouchers(res.data.vouchers);
      } else {
        toast.error(t("fetchError"));
      }
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    void fetchVouchers();
  }, [fetchVouchers]);

  const stats = useMemo(() => {
    const active = vouchers.filter(
      (v) => v.isActive && !isVoucherExpired(v),
    ).length;
    const redemptions = vouchers.reduce((sum, v) => sum + v.usedCount, 0);
    const exhausted = vouchers.filter((v) => v.usedCount >= v.maxUses).length;
    return { total: vouchers.length, active, redemptions, exhausted };
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vouchers.filter((v) => {
      if (typeFilter !== "all" && v.type !== typeFilter) return false;
      if (statusFilter === "active" && (!v.isActive || isVoucherExpired(v))) {
        return false;
      }
      if (statusFilter === "inactive" && v.isActive && !isVoucherExpired(v)) {
        return false;
      }
      if (!q) return true;
      return (
        v.code.toLowerCase().includes(q) ||
        (v.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [vouchers, searchQuery, typeFilter, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, code: generateRandomVoucherCode() });
    setModalOpen(true);
  };

  const openEdit = (voucher: Voucher) => {
    setEditingId(voucher.id);
    setForm({
      code: voucher.code,
      type: voucher.type,
      discountType: voucher.discountType ?? "percentage",
      discountValue: voucher.discountValue ?? 10,
      billingCycle: voucher.billingCycle ?? "both",
      durationUnit: voucher.durationUnit ?? "months",
      durationValue: voucher.durationValue ?? 1,
      maxUses: voucher.maxUses,
      isActive: voucher.isActive,
      validFrom: voucher.validFrom,
      validUntil: voucher.validUntil,
      description: voucher.description ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error(t("codeRequired"));
      return;
    }
    setSaving(true);
    try {
      if (editingId != null) {
        const payload: UpdateVoucherPayload = { ...form };
        const res = await axiosPatch<UpdateVoucherPayload, VoucherResponse>(
          `/admin/vouchers/${editingId}`,
          locale,
          payload,
        );
        if (res.status) {
          toast.success(t("updateSuccess"));
          closeModal();
          await fetchVouchers();
        } else {
          toast.error(t("saveError"));
        }
      } else {
        const res = await axiosPost<CreateVoucherPayload, VoucherResponse>(
          "/admin/vouchers",
          locale,
          form,
        );
        if (res.status) {
          toast.success(t("createSuccess"));
          closeModal();
          await fetchVouchers();
        } else {
          toast.error(t("saveError"));
        }
      }
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.voucher) return;

    const id = deleteModal.voucher.id;
    setDeletingId(id);
    try {
      const res = await axiosDelete(`/admin/vouchers/${id}`, locale);
      if (res.status) {
        toast.success(t("deleteSuccess"));
        setDeleteModal({ isOpen: false, voucher: null });
        if (selectedVoucher?.id === id) setSelectedVoucher(null);
        await fetchVouchers();
      } else {
        toast.error(t("deleteError"));
      }
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const loadRedemptions = async (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setRedemptionsLoading(true);
    setRedemptions([]);
    try {
      const res = await axiosGet<RedemptionsResponse>(
        `/admin/vouchers/${voucher.id}/redemptions`,
        locale,
      );
      if (res.status && res.data?.redemptions) {
        setRedemptions(res.data.redemptions);
      }
    } catch {
      toast.error(t("fetchError"));
    } finally {
      setRedemptionsLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t("copySuccess"));
    } catch {
      toast.error(t("saveError"));
    }
  };

  const formatBillingCycle = (cycle: VoucherBillingCycle | null) => {
    if (cycle === "monthly") return t("billingMonthly");
    if (cycle === "yearly") return t("billingYearly");
    return t("billingBoth");
  };

  const formatVoucherValue = (v: Voucher) => {
    if (v.type === "discount") {
      if (v.discountType === "percentage") {
        return t("valuePercentage", { value: v.discountValue ?? 0 });
      }
      return t("valueFixed", { value: v.discountValue ?? 0 });
    }
    if (v.durationUnit === "days") {
      return t("valueDays", { count: v.durationValue ?? 0 });
    }
    return t("valueMonths", { count: v.durationValue ?? 0 });
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-start focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

  const filterBtnClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? "bg-primary text-white shadow-sm"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    }`;

  const mutedTextClass = "text-slate-500 dark:text-slate-400";
  const labelTextClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div
      className="space-y-6 pb-10 text-slate-800 dark:text-slate-100"
      dir={textDir}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <IoArrowBack className={`text-lg ${isRTL ? "rotate-180" : ""}`} />
              {t("back")}
            </button>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary/90"
          >
            <IoAddOutline className="text-lg" />
            {t("create")}
          </button>
          <button
            type="button"
            onClick={() => void fetchVouchers()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <IoRefreshOutline
              className={`text-lg ${loading ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && vouchers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("statsTotal")}
            value={stats.total}
            icon={
              <IoTicketOutline className="text-xl text-blue-600 dark:text-blue-400" />
            }
            tone="bg-blue-50 dark:bg-blue-500/15"
            locale={locale}
          />
          <StatCard
            label={t("statsActive")}
            value={stats.active}
            icon={
              <IoCheckmarkCircleOutline className="text-xl text-emerald-600 dark:text-emerald-400" />
            }
            tone="bg-emerald-50 dark:bg-emerald-500/15"
            locale={locale}
          />
          <StatCard
            label={t("statsRedemptions")}
            value={stats.redemptions}
            icon={
              <IoPeopleOutline className="text-xl text-violet-600 dark:text-violet-400" />
            }
            tone="bg-violet-50 dark:bg-violet-500/15"
            locale={locale}
          />
          <StatCard
            label={t("statsExhausted")}
            value={stats.exhausted}
            icon={
              <IoBanOutline className="text-xl text-amber-600 dark:text-amber-400" />
            }
            tone="bg-amber-50 dark:bg-amber-500/15"
            locale={locale}
          />
        </div>
      )}

      <div className="grid gap-6 ">
        {/* Main list */}
        <CardDashBoard className="overflow-hidden p-0!">
          {/* Toolbar */}
          <div className="space-y-4 border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="relative">
              <IoSearchOutline
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-lg text-slate-400 ${isRTL ? "right-3" : "left-3"}`}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                dir={textDir}
                className={`${inputClass} ${isRTL ? "pr-10 pl-4 text-start" : "pl-10 pr-4"}`}
              />
            </div>
            <div>
              <p className={`mb-2 ${labelTextClass}`}>
                {t("filterType")}
              </p>
              <div className="flex flex-wrap gap-2">
                {(["all", "discount", "duration"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTypeFilter(f)}
                    className={filterBtnClass(typeFilter === f)}
                  >
                    {f === "all"
                      ? t("filterAll")
                      : f === "discount"
                        ? t("typeDiscount")
                        : t("typeDuration")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={`mb-2 ${labelTextClass}`}>
                {t("filterStatus")}
              </p>
              <div className="flex flex-wrap gap-2">
                {(["all", "active", "inactive"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={filterBtnClass(statusFilter === f)}
                  >
                    {f === "all"
                      ? t("filterAll")
                      : f === "active"
                        ? t("active")
                        : t("inactive")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="animate-spin text-3xl text-primary" />
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <IoTicketOutline className="text-3xl text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {vouchers.length === 0 ? t("emptyTitle") : t("empty")}
              </h3>
              <p className={`mt-1 max-w-sm text-sm ${mutedTextClass}`}>
                {vouchers.length === 0 ? t("emptyCta") : t("searchPlaceholder")}
              </p>
              {vouchers.length === 0 && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <IoAddOutline />
                  {t("create")}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-700 dark:text-slate-200">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-start dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      {t("colCode")}
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      {t("colType")}
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      {t("colValue")}
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      {t("colUsage")}
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      {t("colStatus")}
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      {t("colActions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVouchers.map((v) => {
                    const expired = isVoucherExpired(v);
                    const exhausted = v.usedCount >= v.maxUses;
                    const pct = usagePercent(v);
                    const isSelected = selectedVoucher?.id === v.id;

                    return (
                      <tr
                        key={v.id}
                        className={`border-b border-slate-100 transition-colors dark:border-slate-800 ${
                          isSelected
                            ? "bg-primary/5 dark:bg-primary/10"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="px-4 py-3 text-start">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100"
                              dir="ltr"
                            >
                              {v.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => void copyCode(v.code)}
                              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                              title={t("copyCode")}
                            >
                              <IoCopyOutline className="text-base" />
                            </button>
                          </div>
                          {v.description ? (
                            <p className={`mt-0.5 max-w-[180px] truncate text-xs ${mutedTextClass}`}>
                              {v.description}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-start">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              v.type === "discount"
                                ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                                : "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
                            }`}
                          >
                            {v.type === "discount" ? (
                              <IoPricetagOutline className="h-3.5 w-3.5" />
                            ) : (
                              <IoTimeOutline className="h-3.5 w-3.5" />
                            )}
                            {v.type === "discount"
                              ? t("typeDiscount")
                              : t("typeDuration")}
                          </span>
                          {v.type === "discount" && (
                            <p className={`mt-1 text-xs ${mutedTextClass}`}>
                              {formatBillingCycle(v.billingCycle)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-start font-medium text-slate-800 dark:text-slate-200">
                          {formatVoucherValue(v)}
                        </td>
                        <td className="min-w-[120px] px-4 py-3 text-start">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span
                              className="font-medium tabular-nums"
                              dir="ltr"
                            >
                              {v.usedCount}/{v.maxUses}
                            </span>
                            <span className={mutedTextClass}>
                              {exhausted
                                ? t("exhausted")
                                : t("usageRemaining", {
                                    remaining: v.maxUses - v.usedCount,
                                  })}
                            </span>
                          </div>
                          <div
                            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                            dir="ltr"
                          >
                            <div
                              className={`h-full rounded-full transition-all ${
                                exhausted
                                  ? "bg-amber-500"
                                  : pct >= 80
                                    ? "bg-amber-400"
                                    : "bg-primary"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-start">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${
                                v.isActive && !expired
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {v.isActive && !expired
                                ? t("active")
                                : t("inactive")}
                            </span>
                            {expired && (
                              <span className="text-[10px] font-medium text-red-500 dark:text-red-400">
                                {t("expired")}
                              </span>
                            )}
                            {v.validUntil && !expired && (
                              <span className={`text-[10px] ${mutedTextClass}`}>
                                {t("expiresOn", {
                                  date: new Date(
                                    v.validUntil,
                                  ).toLocaleDateString(locale),
                                })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-start">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => void loadRedemptions(v)}
                              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              }`}
                            >
                              {t("viewUsage")}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(v)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              aria-label={t("edit")}
                            >
                              <IoCreateOutline />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModal({ isOpen: true, voucher: v })
                              }
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                              aria-label={t("delete")}
                            >
                              <IoTrashOutline />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardDashBoard>

        {/* Usage sidebar */}
        <CardDashBoard className="p-0! xl:sticky xl:top-4 xl:self-start">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              {t("usageTitle")}
            </h2>
            {selectedVoucher && (
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <IoCloseOutline className="text-lg" />
              </button>
            )}
          </div>
          {!selectedVoucher ? (
            <p className={`px-4 py-10 text-center text-sm ${mutedTextClass}`}>
              {t("viewUsage")}
            </p>
          ) : redemptionsLoading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-2xl text-primary" />
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-4 rounded-xl bg-slate-50 p-3 text-start dark:bg-slate-800/60">
                <p className={`text-xs ${mutedTextClass}`}>{t("colCode")}</p>
                <p
                  className="font-mono text-lg font-bold text-primary"
                  dir="ltr"
                >
                  {selectedVoucher.code}
                </p>
                <p className={`mt-1 text-xs ${mutedTextClass}`}>
                  {t("redemptionsCount", { count: redemptions.length })}
                </p>
              </div>
              {redemptions.length === 0 ? (
                <p className={`py-6 text-center text-sm ${mutedTextClass}`}>
                  {t("noUsage")}
                </p>
              ) : (
                <ul className="max-h-[420px] space-y-2 overflow-y-auto">
                  {redemptions.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-slate-100 px-3 py-2.5 text-start dark:border-slate-800"
                    >
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {r.userName || r.userEmail || `#${r.userId}`}
                      </p>
                      {r.userEmail && r.userName && (
                        <p className={`text-xs ${mutedTextClass}`}>{r.userEmail}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {new Date(r.redeemedAt).toLocaleString(locale)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardDashBoard>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            role="dialog"
            aria-modal="true"
            dir={textDir}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <IoTicketOutline className="text-xl" />
                </div>
                <h2 className="text-xl font-bold">
                  {editingId != null ? t("editTitle") : t("createTitle")}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type cards */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("fieldType")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["discount", "duration"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type }))}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                        form.type === type
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {type === "discount" ? (
                        <IoPricetagOutline className="text-2xl" />
                      ) : (
                        <IoTimeOutline className="text-2xl" />
                      )}
                      <span className="text-sm font-semibold">
                        {type === "discount"
                          ? t("typeDiscount")
                          : t("typeDuration")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("fieldCode")}
                </label>
                <div className="flex gap-2">
                  {isRTL ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            code: generateRandomVoucherCode(),
                          }))
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        title={t("generateRandomCode")}
                      >
                        <IoShuffleOutline className="text-lg" />
                      </button>
                      <input
                        className={`${inputClass} flex-1 font-mono tracking-wider`}
                        value={form.code}
                        dir="ltr"
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            code: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="ENS8X2K9"
                      />
                    </>
                  ) : (
                    <>
                      <input
                        className={`${inputClass} flex-1 font-mono tracking-wider`}
                        value={form.code}
                        dir="ltr"
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            code: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="ENS8X2K9"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            code: generateRandomVoucherCode(),
                          }))
                        }
                        className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        title={t("generateRandomCode")}
                      >
                        <IoShuffleOutline className="text-lg" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {form.type === "discount" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        {t("fieldDiscountType")}
                      </label>
                      <select
                        className={inputClass}
                        value={form.discountType}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            discountType: e.target.value as DiscountType,
                          }))
                        }
                      >
                        <option value="percentage">
                          {t("discountPercentage")}
                        </option>
                        <option value="fixed">{t("discountFixed")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        {t("fieldDiscountValue")}
                      </label>
                      <input
                        type="number"
                        min={1}
                        className={inputClass}
                        value={form.discountValue ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            discountValue: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      {t("fieldBillingCycle")}
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {(["monthly", "yearly", "both"] as const).map((cycle) => (
                        <button
                          key={cycle}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, billingCycle: cycle }))
                          }
                          className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                            form.billingCycle === cycle
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {cycle === "monthly"
                            ? t("billingMonthly")
                            : cycle === "yearly"
                              ? t("billingYearly")
                              : t("billingBoth")}
                        </button>
                      ))}
                    </div>
                    <p className={`mt-1 text-xs ${mutedTextClass}`}>
                      {t("billingCycleHint")}
                    </p>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      {t("fieldDurationUnit")}
                    </label>
                    <select
                      className={inputClass}
                      value={form.durationUnit}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          durationUnit: e.target.value as DurationUnit,
                        }))
                      }
                    >
                      <option value="days">{t("unitDays")}</option>
                      <option value="months">{t("unitMonths")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      {t("fieldDurationValue")}
                    </label>
                    <input
                      type="number"
                      min={1}
                      className={inputClass}
                      value={form.durationValue ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          durationValue: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("fieldMaxUses")}
                </label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))
                  }
                />
                <p className={`mt-1 text-xs ${mutedTextClass}`}>
                  {t("maxUsesHint")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t("fieldValidFrom")}
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.validFrom?.slice(0, 10) ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        validFrom: e.target.value
                          ? `${e.target.value}T00:00:00.000Z`
                          : null,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t("fieldValidUntil")}
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.validUntil?.slice(0, 10) ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        validUntil: e.target.value
                          ? `${e.target.value}T23:59:59.000Z`
                          : null,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("fieldDescription")}
                </label>
                <input
                  className={inputClass}
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive !== false}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-primary"
                />
                <span className="text-sm font-medium">{t("fieldActive")}</span>
              </label>
            </div>

            <div
              className={`mt-6 flex gap-3 ${isRTL ? "flex-row-reverse justify-start" : "justify-end"}`}
            >
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
              >
                {saving && <FaSpinner className="animate-spin" />}
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, voucher: null })}
        onConfirm={() => void handleDelete()}
        title={t("deleteConfirmTitle")}
        message={t("deleteConfirm", {
          code: deleteModal.voucher?.code ?? "",
        })}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        isLoading={deletingId === deleteModal.voucher?.id}
        loadingText={t("deleting")}
      />
    </div>
  );
}
