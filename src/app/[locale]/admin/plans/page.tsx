"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { ColDef } from "ag-grid-community";
import { IoArrowBack, IoCreateOutline } from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import PlanCapabilitiesFields from "@/components/Admin/PlanCapabilitiesFields";
import {
  Button,
  LoadingBlock,
  Modal,
  PageHeader,
  SectionHeader,
  buttonClasses,
} from "@/components/ui";
import { axiosGet, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  DEFAULT_CUSTOM_CAPABILITIES,
  DEFAULT_FREE_CAPABILITIES,
  DEFAULT_PRO_CAPABILITIES,
  normalizePlanCapabilities,
  type PlanCapabilities,
} from "@/types/PlanCapabilities";

export interface Plan {
  id: number;
  name: string;
  priceMonthly?: number;
  priceYearly: number;
  extraMenuPrice?: number | null;
  maxMenus: number;
  maxProductsPerMenu: number;
  allowCustomDomain?: boolean;
  hasAds: boolean;
  isActive: boolean;
  activeSubscriptions?: number;
  capabilities?: PlanCapabilities;
}

interface PlansResponse {
  plans: Plan[];
}

interface CustomDisplayResponse {
  capabilities: PlanCapabilities;
}

const defaultForm: Record<string, string | number | boolean> = {
  name: "",
  priceMonthly: 0,
  priceYearly: 0,
  extraMenuPrice: 0,
  maxMenus: 0,
  maxProducts: 0,
  hasAds: false,
  isActive: true,
  allowFullDesignControl: false,
};

function isProPlanName(name: string): boolean {
  return String(name).trim().toLowerCase() === "pro";
}

function isFreePlanName(name: string): boolean {
  return String(name).trim().toLowerCase() === "free";
}

function formatEgp(value: unknown): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} EGP`;
}

export default function PlansPage() {
  const locale = useLocale();
  const t = useTranslations("adminPlans");
  const router = useRouter();
  const isRTL = locale === "ar";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    plan: Plan | null;
  }>({
    isOpen: false,
    plan: null,
  });
  const [form, setForm] =
    useState<Record<string, string | number | boolean>>(defaultForm);
  const [caps, setCaps] = useState<PlanCapabilities>(DEFAULT_FREE_CAPABILITIES);
  const [saving, setSaving] = useState(false);

  const [customCaps, setCustomCaps] = useState<PlanCapabilities>(
    DEFAULT_CUSTOM_CAPABILITIES,
  );
  const [customLoading, setCustomLoading] = useState(true);
  const [customSaving, setCustomSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const result = await axiosGet<PlansResponse>("/admin/plans", locale);

      if (result.status && result.data?.plans) {
        setPlans(result.data.plans);
      } else {
        toast.error(t("error"));
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  const fetchCustomDisplay = useCallback(async () => {
    try {
      setCustomLoading(true);
      const result = await axiosGet<CustomDisplayResponse>(
        "/admin/plans/custom-display",
        locale,
      );
      if (result.status && result.data?.capabilities) {
        setCustomCaps(
          normalizePlanCapabilities(
            result.data.capabilities,
            DEFAULT_CUSTOM_CAPABILITIES,
          ),
        );
      }
    } catch (err) {
      console.error("Error fetching custom display:", err);
      toast.error(t("customDisplay.error"));
    } finally {
      setCustomLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    fetchPlans();
    fetchCustomDisplay();
  }, [fetchPlans, fetchCustomDisplay]);

  const openEdit = useCallback((plan: Plan) => {
    setEditModal({ isOpen: true, plan });
    setForm({
      name: plan.name,
      priceMonthly: Number(plan.priceMonthly ?? 0),
      priceYearly: Number(plan.priceYearly) ?? 0,
      extraMenuPrice: Number(plan.extraMenuPrice ?? 0),
      maxMenus: plan.maxMenus ?? 0,
      maxProducts: plan.maxProductsPerMenu ?? 0,
      hasAds: Boolean(plan.hasAds),
      isActive: Boolean(plan.isActive),
      allowFullDesignControl: Boolean(plan.allowCustomDomain),
    });
    const fallback = isFreePlanName(plan.name)
      ? DEFAULT_FREE_CAPABILITIES
      : DEFAULT_PRO_CAPABILITIES;
    setCaps(normalizePlanCapabilities(plan.capabilities, fallback));
  }, []);

  const closeEdit = useCallback(() => {
    setEditModal({ isOpen: false, plan: null });
    setForm(defaultForm);
    setCaps(DEFAULT_FREE_CAPABILITIES);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editModal.plan) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: String(form.name).trim(),
        priceMonthly: Number(form.priceMonthly),
        priceYearly: Number(form.priceYearly),
        maxMenus: Number(form.maxMenus),
        maxProductsPerMenu: Number(form.maxProducts),
        hasAds: Boolean(form.hasAds),
        isActive: Boolean(form.isActive),
        allowCustomDomain: Boolean(form.allowFullDesignControl),
        capabilities: caps,
      };

      if (isProPlanName(String(form.name))) {
        payload.extraMenuPrice = Number(form.extraMenuPrice);
      }

      const result = await axiosPatch<typeof payload, { message?: string }>(
        `/admin/plans/${editModal.plan.id}`,
        locale,
        payload,
      );

      if (result.status) {
        toast.success(t("updateSuccess"));
        closeEdit();
        fetchPlans();
      } else {
        toast.error(t("updateError"));
      }
    } catch (err) {
      console.error("Error updating plan:", err);
      toast.error(t("updateError"));
    } finally {
      setSaving(false);
    }
  }, [editModal.plan, form, caps, locale, t, closeEdit, fetchPlans]);

  const handleSaveCustom = useCallback(async () => {
    setCustomSaving(true);
    try {
      const result = await axiosPatch<
        { capabilities: PlanCapabilities },
        { message?: string }
      >("/admin/plans/custom-display", locale, { capabilities: customCaps });
      if (result.status) {
        toast.success(t("customDisplay.saveSuccess"));
        fetchCustomDisplay();
      } else {
        toast.error(t("customDisplay.saveError"));
      }
    } catch (err) {
      console.error("Error updating custom display:", err);
      toast.error(t("customDisplay.saveError"));
    } finally {
      setCustomSaving(false);
    }
  }, [customCaps, locale, t, fetchCustomDisplay]);

  const columnDefs = useMemo<ColDef<Plan>[]>(
    () => [
      {
        field: "name",
        headerName: t("columns.name"),
        flex: 1,
        minWidth: 100,
      },
      {
        field: "priceMonthly",
        headerName: t("columns.priceMonthly"),
        width: 130,
        valueFormatter: (params) => formatEgp(params.value),
      },
      {
        field: "priceYearly",
        headerName: t("columns.priceYearly"),
        width: 130,
        valueFormatter: (params) => formatEgp(params.value),
      },
      {
        field: "extraMenuPrice",
        headerName: t("columns.extraMenuPrice"),
        width: 140,
        valueFormatter: (params) => {
          if (!isProPlanName(String(params.data?.name ?? ""))) return "—";
          return formatEgp(params.value);
        },
      },
      {
        field: "maxMenus",
        headerName: t("columns.maxMenus"),
        width: 110,
      },
      {
        field: "maxProductsPerMenu",
        headerName: t("columns.maxProducts"),
        width: 120,
        valueFormatter: (params) =>
          params.value === -1 ? "∞" : String(params.value ?? "—"),
      },
      {
        field: "hasAds",
        headerName: t("columns.hasAds"),
        width: 100,
        cellRenderer: (params: { value: boolean }) =>
          params.value ? t("yes") : t("no"),
      },
      {
        field: "isActive",
        headerName: t("columns.isActive"),
        width: 100,
        cellRenderer: (params: { value: boolean }) =>
          params.value ? t("active") : t("inactive"),
      },
      {
        field: "allowCustomDomain",
        headerName: t("columns.allowFullDesignControl"),
        width: 140,
        cellRenderer: (params: { value: boolean }) =>
          params.value ? t("yes") : t("no"),
      },
      {
        field: "activeSubscriptions",
        headerName: t("columns.activeSubscriptions"),
        width: 130,
      },
      {
        headerName: t("columns.actions"),
        width: 100,
        cellRenderer: (params: { data: Plan }) =>
          params.data ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(params.data);
              }}
              className={buttonClasses({
                variant: "subtle",
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <IoCreateOutline className="text-base" />
              {t("edit")}
            </button>
          ) : null,
      },
    ],
    [t, openEdit],
  );

  const editingPro =
    editModal.plan != null && isProPlanName(String(form.name));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button
            variant="secondary"
            startIcon={<IoArrowBack className="rtl:rotate-180" />}
            onClick={() => router.back()}
          >
            {t("back")}
          </Button>
        }
      />

      <CardDashBoard>
        <DataTable<Plan>
          rowData={plans}
          columnDefs={columnDefs}
          loading={loading}
          locale={locale}
          showRowNumbers={true}
          pagination={false}
        />
      </CardDashBoard>

      <CardDashBoard>
        <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
          <SectionHeader
            title={t("customDisplay.title")}
            description={t("customDisplay.subtitle")}
          />
          {customLoading ? (
            <LoadingBlock label={t("customDisplay.loading")} />
          ) : (
            <>
              <PlanCapabilitiesFields
                idPrefix="custom"
                value={customCaps}
                onChange={setCustomCaps}
                t={t}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveCustom}
                  loading={customSaving}
                >
                  {t("customDisplay.save")}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardDashBoard>

      <Modal
        open={editModal.isOpen && editModal.plan != null}
        onClose={closeEdit}
        title={
          editModal.plan
            ? `${t("editModal.title")} — ${editModal.plan.name}`
            : t("editModal.title")
        }
        size="lg"
        dismissible={!saving}
        footer={
          <>
            <Button variant="secondary" onClick={closeEdit} disabled={saving}>
              {t("editModal.cancel")}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {t("editModal.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-fg-muted">
              {t("editModal.name")}
            </label>
            <input
              type="text"
              value={String(form.name)}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-fg"
              dir={locale === "ar" ? "rtl" : "ltr"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("editModal.priceMonthly")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={Number(form.priceMonthly)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priceMonthly: e.target.value
                          ? Number(e.target.value)
                          : 0,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("editModal.priceYearly")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={Number(form.priceYearly)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priceYearly: e.target.value
                          ? Number(e.target.value)
                          : 0,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {editingPro && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("editModal.extraMenuPrice")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={Number(form.extraMenuPrice)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        extraMenuPrice: e.target.value
                          ? Number(e.target.value)
                          : 0,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {t("editModal.extraMenuPriceHint")}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("editModal.maxMenus")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={Number(form.maxMenus)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxMenus: e.target.value ? Number(e.target.value) : 0,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("editModal.maxProducts")}
                </label>
                <input
                  type="number"
                  min={-1}
                  value={Number(form.maxProducts)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxProducts: e.target.value ? Number(e.target.value) : 0,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t("editModal.maxProductsHint")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasAds"
                  checked={Boolean(form.hasAds)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hasAds: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="hasAds"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t("editModal.hasAds")}
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={Boolean(form.isActive)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t("editModal.isActive")}
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowFullDesignControl"
                  checked={Boolean(form.allowFullDesignControl)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      allowFullDesignControl: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="allowFullDesignControl"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t("editModal.allowFullDesignControl")}
                </label>
              </div>

              <PlanCapabilitiesFields
                idPrefix="plan"
                value={caps}
                onChange={setCaps}
                t={t}
              />
        </div>
      </Modal>
    </div>
  );
}
