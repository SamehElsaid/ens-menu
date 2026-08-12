"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IoTicketOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCreateOutline,
  IoShuffleOutline,
  IoRefreshOutline,
  IoCopyOutline,
  IoTimeOutline,
  IoPricetagOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoBanOutline,
} from "react-icons/io5";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Badge,
  Button,
  Checkbox,
  ChoiceCard,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  NoResultsState,
  PageHeader,
  PageShell,
  SearchInput,
  SegmentedControl,
  Select,
  Sheet,
  StatCard,
  StatGrid,
  Toolbar,
  type DataColumn,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";
import { cn } from "@/lib/cn";
import { intlDateLocale } from "@/lib/formatDateTime";
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

export default function AdminVouchersPage() {
  const locale = useLocale();
  const numberLocale = intlDateLocale(locale);
  const t = useTranslations("adminVouchers");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const tableLabels = useDataTableLabels();

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

  const columns: DataColumn<Voucher>[] = [
    {
      id: "code",
      header: t("colCode"),
      primary: true,
      cell: (v) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-sm font-bold tracking-wide text-fg"
              dir="ltr"
            >
              {v.code}
            </span>
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              onClick={() => void copyCode(v.code)}
              title={t("copyCode")}
              aria-label={t("copyCode")}
            >
              <IoCopyOutline />
            </Button>
          </div>
          {v.description ? (
            <p className="mt-0.5 max-w-[180px] truncate text-xs text-fg-muted">
              {v.description}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "type",
      header: t("colType"),
      cell: (v) => (
        <div className="flex flex-col items-start gap-1">
          <Badge
            tone={v.type === "discount" ? "brand" : "info"}
            icon={
              v.type === "discount" ? <IoPricetagOutline /> : <IoTimeOutline />
            }
          >
            {v.type === "discount" ? t("typeDiscount") : t("typeDuration")}
          </Badge>
          {v.type === "discount" ? (
            <span className="text-xs text-fg-muted">
              {formatBillingCycle(v.billingCycle)}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "value",
      header: t("colValue"),
      cell: (v) => (
        <span className="font-medium text-fg">{formatVoucherValue(v)}</span>
      ),
    },
    {
      id: "usage",
      header: t("colUsage"),
      cell: (v) => {
        const exhausted = v.usedCount >= v.maxUses;
        const pct = usagePercent(v);
        return (
          <div className="min-w-[120px]">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-medium tabular-nums" dir="ltr">
                {v.usedCount}/{v.maxUses}
              </span>
              <span className="text-fg-muted">
                {exhausted
                  ? t("exhausted")
                  : t("usageRemaining", {
                      remaining: v.maxUses - v.usedCount,
                    })}
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3"
              dir="ltr"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  exhausted || pct >= 80 ? "bg-warning" : "bg-brand",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: "status",
      header: t("colStatus"),
      cell: (v) => {
        const expired = isVoucherExpired(v);
        return (
          <div className="flex flex-col items-start gap-1">
            <Badge tone={v.isActive && !expired ? "success" : "neutral"} dot>
              {v.isActive && !expired ? t("active") : t("inactive")}
            </Badge>
            {expired ? (
              <span className="text-[10px] font-medium text-danger">
                {t("expired")}
              </span>
            ) : null}
            {v.validUntil && !expired ? (
              <span className="text-[10px] text-fg-muted">
                {t("expiresOn", {
                  date: new Date(v.validUntil).toLocaleDateString(locale),
                })}
              </span>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <PageShell
      kind="table"
      header={
        <>
          <PageHeader
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={[
              { label: tAdmin("title"), href: "/admin" },
              { label: t("title") },
            ]}
            breadcrumbsLabel={tCommon("breadcrumb")}
            actions={
              <>
                <Button
                  variant="secondary"
                  startIcon={
                    <IoRefreshOutline
                      className={loading ? "animate-spin" : ""}
                    />
                  }
                  onClick={() => void fetchVouchers()}
                  disabled={loading}
                >
                  {t("refresh")}
                </Button>
                <Button startIcon={<IoAddOutline />} onClick={openCreate}>
                  {t("create")}
                </Button>
              </>
            }
          />

          {/* The strip holds its place while the request is in flight: four
              cards appearing after load pushed the whole table down under a
              reader who had already started on it. It only disappears once we
              know there are no vouchers at all, where four zeroes say
              nothing. */}
          {loading || vouchers.length > 0 ? (
            <StatGrid columns={4}>
              <StatCard
                label={t("statsTotal")}
                loading={loading}
                value={stats.total.toLocaleString(numberLocale)}
                icon={<IoTicketOutline />}
              />
              <StatCard
                label={t("statsActive")}
                loading={loading}
                value={stats.active.toLocaleString(numberLocale)}
                icon={<IoCheckmarkCircleOutline />}
              />
              <StatCard
                label={t("statsRedemptions")}
                loading={loading}
                value={stats.redemptions.toLocaleString(numberLocale)}
                icon={<IoPeopleOutline />}
              />
              <StatCard
                label={t("statsExhausted")}
                loading={loading}
                value={stats.exhausted.toLocaleString(numberLocale)}
                icon={<IoBanOutline />}
              />
            </StatGrid>
          ) : null}
        </>
      }
      toolbar={
        <Toolbar
          search={
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("searchPlaceholder")}
              label={t("searchPlaceholder")}
              clearLabel={tCommon("clearSearch")}
              debounceMs={0}
            />
          }
          filters={
            <>
              <SegmentedControl<TypeFilter>
                options={[
                  { value: "all", label: t("filterAll") },
                  { value: "discount", label: t("typeDiscount") },
                  { value: "duration", label: t("typeDuration") },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                label={t("filterType")}
                size="sm"
              />
              <SegmentedControl<StatusFilter>
                options={[
                  { value: "all", label: t("filterAll") },
                  { value: "active", label: t("active") },
                  { value: "inactive", label: t("inactive") },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                label={t("filterStatus")}
                size="sm"
              />
            </>
          }
        />
      }
    >
      <DataTable<Voucher>
        columns={columns}
        rows={filteredVouchers}
        getRowKey={(v) => String(v.id)}
        caption={t("title")}
        loading={loading}
        tableId="admin-vouchers"
        stickyHeader
        densityControl
        labels={tableLabels}
        empty={
          vouchers.length === 0 ? (
            <EmptyState
              icon={<IoTicketOutline />}
              title={t("emptyTitle")}
              description={t("emptyCta")}
              action={
                <Button startIcon={<IoAddOutline />} onClick={openCreate}>
                  {t("create")}
                </Button>
              }
            />
          ) : (
            <NoResultsState
              title={t("empty")}
              description={t("searchPlaceholder")}
            />
          )
        }
        rowActions={(v) => (
          <div className="flex flex-wrap items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void loadRedemptions(v)}
            >
              {t("viewUsage")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconOnly
              onClick={() => openEdit(v)}
              aria-label={t("edit")}
            >
              <IoCreateOutline />
            </Button>
            <Button
              variant="dangerGhost"
              size="sm"
              iconOnly
              onClick={() => setDeleteModal({ isOpen: true, voucher: v })}
              aria-label={t("delete")}
            >
              <IoTrashOutline />
            </Button>
          </div>
        )}
      />

      {/* Redemptions used to be a full-width card under the table that was
          empty until a row was picked — a permanent hole in the page whose only
          content was an instruction to click something. It is a detail of one
          voucher, so it now opens beside the row it belongs to. */}
      <Sheet
        open={Boolean(selectedVoucher)}
        onClose={() => setSelectedVoucher(null)}
        title={t("usageTitle")}
        description={
          selectedVoucher
            ? t("redemptionsCount", { count: redemptions.length })
            : undefined
        }
        side="end"
        closeLabel={tCommon("close")}
      >
        {redemptionsLoading ? (
          <LoadingBlock label={tCommon("loading")} />
        ) : selectedVoucher ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-brand-line bg-brand-soft px-3.5 py-3">
              <p className="ui-label text-fg-muted">{t("colCode")}</p>
              <p
                className="mt-0.5 font-mono text-lg font-bold text-brand"
                dir="ltr"
              >
                {selectedVoucher.code}
              </p>
            </div>
            {redemptions.length === 0 ? (
              <EmptyState
                icon={<IoPeopleOutline />}
                title={t("noUsage")}
                size="sm"
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {redemptions.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg border border-line px-3 py-2.5"
                  >
                    <p className="text-[13px] font-medium text-fg">
                      {r.userName || r.userEmail || `#${r.userId}`}
                    </p>
                    {r.userEmail && r.userName && (
                      <p className="text-xs text-fg-muted">{r.userEmail}</p>
                    )}
                    <p className="mt-1 text-xs text-fg-subtle">
                      {new Date(r.redeemedAt).toLocaleString(locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </Sheet>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId != null ? t("editTitle") : t("createTitle")}
        icon={<IoTicketOutline />}
        closeLabel={tCommon("close")}
        dismissible={!saving}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              {t("cancel")}
            </Button>
            <Button onClick={() => void handleSave()} loading={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <fieldset className="min-w-0">
            <legend className="mb-2 text-[13px] font-medium text-fg">
              {t("fieldType")}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["discount", "duration"] as const).map((type) => (
                <ChoiceCard
                  key={type}
                  name="admin-voucher-type"
                  value={type}
                  checked={form.type === type}
                  onChange={() => setForm((f) => ({ ...f, type }))}
                  icon={
                    type === "discount" ? (
                      <IoPricetagOutline />
                    ) : (
                      <IoTimeOutline />
                    )
                  }
                  label={
                    type === "discount" ? t("typeDiscount") : t("typeDuration")
                  }
                />
              ))}
            </div>
          </fieldset>

          <Field label={t("fieldCode")}>
            <div className="flex w-full gap-2">
              <Input
                className="flex-1 font-mono tracking-wider"
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
              <Button
                variant="secondary"
                iconOnly
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    code: generateRandomVoucherCode(),
                  }))
                }
                title={t("generateRandomCode")}
                aria-label={t("generateRandomCode")}
              >
                <IoShuffleOutline />
              </Button>
            </div>
          </Field>

          {form.type === "discount" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("fieldDiscountType")}>
                  <Select
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
                  </Select>
                </Field>
                <Field label={t("fieldDiscountValue")}>
                  <Input
                    type="number"
                    min={1}
                    value={form.discountValue ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discountValue: Number(e.target.value),
                      }))
                    }
                  />
                </Field>
              </div>
              <Field
                label={t("fieldBillingCycle")}
                hint={t("billingCycleHint")}
              >
                <SegmentedControl<VoucherBillingCycle>
                  options={[
                    { value: "monthly", label: t("billingMonthly") },
                    { value: "yearly", label: t("billingYearly") },
                    { value: "both", label: t("billingBoth") },
                  ]}
                  value={form.billingCycle ?? "both"}
                  onChange={(cycle) =>
                    setForm((f) => ({ ...f, billingCycle: cycle }))
                  }
                  label={t("fieldBillingCycle")}
                />
              </Field>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("fieldDurationUnit")}>
                <Select
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
                </Select>
              </Field>
              <Field label={t("fieldDurationValue")}>
                <Input
                  type="number"
                  min={1}
                  value={form.durationValue ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      durationValue: Number(e.target.value),
                    }))
                  }
                />
              </Field>
            </div>
          )}

          <Field label={t("fieldMaxUses")} hint={t("maxUsesHint")}>
            <Input
              type="number"
              min={1}
              value={form.maxUses}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxUses: Number(e.target.value) }))
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("fieldValidFrom")}>
              <Input
                type="date"
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
            </Field>
            <Field label={t("fieldValidUntil")}>
              <Input
                type="date"
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
            </Field>
          </div>

          <Field label={t("fieldDescription")}>
            <Input
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>

          <Checkbox
            label={t("fieldActive")}
            checked={form.isActive !== false}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, voucher: null })}
        onConfirm={() => void handleDelete()}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirm", {
          code: deleteModal.voucher?.code ?? "",
        })}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        loading={deletingId === deleteModal.voucher?.id}
        tone="danger"
        icon={<FiAlertTriangle />}
      />
    </PageShell>
  );
}
