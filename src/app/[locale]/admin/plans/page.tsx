"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useCallback, useMemo } from "react";
import { IoCreateOutline } from "react-icons/io5";
import PlanCapabilitiesFields from "@/components/Admin/PlanCapabilitiesFields";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  DataTable,
  EmptyState,
  Field,
  Fieldset,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  PageShell,
  SectionHeader,
  type DataColumn,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";
import { axiosGet, axiosPut } from "@/shared/axiosCall";
import {
  DEFAULT_CUSTOM_CAPABILITIES,
  DEFAULT_FREE_CAPABILITIES,
  DEFAULT_PRO_CAPABILITIES,
  normalizePlanCapabilities,
  type PlanCapabilities,
} from "@/types/PlanCapabilities";
import type { AdminPlan } from "@/types/Plan";
import { formatEgpAmount } from "@/lib/formatNumber";
import { planEndpoints } from "@/api/endpoints/plans";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";

interface PlansResponse {
  plans: AdminPlan[];
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

export default function PlansPage() {
  const locale = useLocale();
  const t = useTranslations("adminPlans");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const tableLabels = useDataTableLabels();

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    plan: AdminPlan | null;
  }>({
    isOpen: false,
    plan: null,
  });
  const [form, setForm] =
    useState<Record<string, string | number | boolean>>(defaultForm);
  const [caps, setCaps] = useState<PlanCapabilities>(DEFAULT_FREE_CAPABILITIES);

  const [customCaps, setCustomCaps] = useState<PlanCapabilities>(
    DEFAULT_CUSTOM_CAPABILITIES,
  );
  const requestPlans = useCallback(
    () => axiosGet<PlansResponse>(planEndpoints.admin.list(), locale),
    [locale],
  );
  const plansQuery = useApiQuery({
    request: requestPlans,
    errorToast: t("error"),
  });
  const plans = plansQuery.data?.plans ?? [];
  const loading = plansQuery.loading;
  const fetchPlans = plansQuery.refetch;

  const requestCustomDisplay = useCallback(
    () =>
      axiosGet<CustomDisplayResponse>(
        planEndpoints.admin.customDisplay(),
        locale,
      ),
    [locale],
  );
  const customDisplayQuery = useApiQuery({
    request: requestCustomDisplay,
    errorToast: t("customDisplay.error"),
    onSuccess: (data) =>
      setCustomCaps(
        normalizePlanCapabilities(
          data.capabilities,
          DEFAULT_CUSTOM_CAPABILITIES,
        ),
      ),
  });
  const customLoading = customDisplayQuery.loading;
  const fetchCustomDisplay = customDisplayQuery.refetch;

  const requestPlanUpdate = useCallback(
    ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      axiosPut<Record<string, unknown>, { message?: string }>(
        planEndpoints.admin.detail(id),
        locale,
        payload,
      ),
    [locale],
  );
  const planUpdate = useApiMutation({ request: requestPlanUpdate });
  const saving = planUpdate.loading;

  const requestCustomUpdate = useCallback(
    (capabilities: PlanCapabilities) =>
      axiosPut<
        { capabilities: PlanCapabilities },
        { message?: string }
      >(planEndpoints.admin.customDisplay(), locale, { capabilities }),
    [locale],
  );
  const customUpdate = useApiMutation({ request: requestCustomUpdate });
  const customSaving = customUpdate.loading;

  const openEdit = useCallback((plan: AdminPlan) => {
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

    await planUpdate.mutate(
      { id: editModal.plan.id, payload },
      {
        successToast: t("updateSuccess"),
        errorToast: t("updateError"),
        onSuccess: () => {
          closeEdit();
          void fetchPlans();
        },
      },
    );
  }, [editModal.plan, form, caps, planUpdate, t, closeEdit, fetchPlans]);

  const handleSaveCustom = useCallback(async () => {
    await customUpdate.mutate(customCaps, {
      successToast: t("customDisplay.saveSuccess"),
      errorToast: t("customDisplay.saveError"),
      onSuccess: () => void fetchCustomDisplay(),
    });
  }, [customCaps, customUpdate, t, fetchCustomDisplay]);

  const columns = useMemo<DataColumn<AdminPlan>[]>(
    () => [
      {
        id: "name",
        header: t("columns.name"),
        primary: true,
        cell: (plan) => (
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-fg">{plan.name}</span>
            <Badge tone={plan.isActive ? "success" : "neutral"} dot>
              {plan.isActive ? t("active") : t("inactive")}
            </Badge>
          </span>
        ),
      },
      {
        id: "priceMonthly",
        header: t("columns.priceMonthly"),
        numeric: true,
        align: "end",
        cell: (plan) => (
          <span className="ui-figure text-[12px]" lang="en">
            {formatEgpAmount(plan.priceMonthly)}
          </span>
        ),
      },
      {
        id: "priceYearly",
        header: t("columns.priceYearly"),
        numeric: true,
        align: "end",
        cell: (plan) => (
          <span className="ui-figure text-[12px]" lang="en">
            {formatEgpAmount(plan.priceYearly)}
          </span>
        ),
      },
      {
        id: "extraMenuPrice",
        header: t("columns.extraMenuPrice"),
        numeric: true,
        align: "end",
        hideOnMobile: true,
        cell: (plan) => (
          <span className="ui-figure text-[12px]" lang="en">
            {isProPlanName(plan.name)
              ? formatEgpAmount(plan.extraMenuPrice)
              : "—"}
          </span>
        ),
      },
      {
        id: "maxMenus",
        header: t("columns.maxMenus"),
        numeric: true,
        align: "end",
        cell: (plan) => (
          <span className="ui-figure text-[12px]" lang="en">
            {plan.maxMenus}
          </span>
        ),
      },
      {
        id: "maxProducts",
        header: t("columns.maxProducts"),
        numeric: true,
        align: "end",
        cell: (plan) => (
          <span className="ui-figure text-[12px]" lang="en">
            {plan.maxProductsPerMenu === -1
              ? "∞"
              : (plan.maxProductsPerMenu ?? "—")}
          </span>
        ),
      },
      {
        id: "hasAds",
        header: t("columns.hasAds"),
        hideOnMobile: true,
        cell: (plan) => (
          <span className="text-fg-muted">
            {plan.hasAds ? t("yes") : t("no")}
          </span>
        ),
      },
      {
        id: "allowCustomDomain",
        header: t("columns.allowFullDesignControl"),
        hideOnMobile: true,
        cell: (plan) => (
          <span className="text-fg-muted">
            {plan.allowCustomDomain ? t("yes") : t("no")}
          </span>
        ),
      },
      {
        id: "activeSubscriptions",
        header: t("columns.activeSubscriptions"),
        numeric: true,
        align: "end",
        cell: (plan) => (
          <span className="ui-figure text-[12px]" lang="en">
            {plan.activeSubscriptions ?? 0}
          </span>
        ),
      },
    ],
    [t],
  );

  const editingPro = editModal.plan != null && isProPlanName(String(form.name));

  /**
   * The plan matrix is the page. It stays one ruled table so two plans can be
   * compared across a row instead of across two cards.
   */
  return (
    <PageShell
      kind="table"
      header={
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={[
            { label: tAdmin("title"), href: "/admin" },
            { label: t("title") },
          ]}
          breadcrumbsLabel={tCommon("breadcrumb")}
        />
      }
      aside={
        /* The custom-plan copy is a different job from setting plan prices, so
           it sits in the page's secondary region rather than as a third peer
           block competing with the matrix for first read. */
        <Card>
          <div className="flex flex-col gap-4">
            <SectionHeader
              title={t("customDisplay.title")}
              description={t("customDisplay.subtitle")}
              ruled
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
                <div className="flex justify-end border-t border-line pt-4">
                  <Button onClick={handleSaveCustom} loading={customSaving}>
                    {t("customDisplay.save")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      }
    >
      <DataTable<AdminPlan>
        columns={columns}
        rows={plans}
        getRowKey={(plan) => String(plan.id)}
        caption={t("title")}
        loading={loading}
        skeletonRows={3}
        tableId="admin-plans"
        stickyHeader
        columnControl
        labels={tableLabels}
        empty={<EmptyState title={t("error")} size="sm" />}
        rowActions={(plan) => (
          <Button
            variant="subtle"
            size="sm"
            startIcon={<IoCreateOutline />}
            onClick={() => openEdit(plan)}
          >
            {t("edit")}
          </Button>
        )}
      />

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
        {/* Grouped rather than a single column of eleven controls: identity,
            then money, then limits, then what the plan unlocks. */}
        <div className="flex flex-col gap-5">
          <Field label={t("editModal.name")}>
            <Input
              type="text"
              value={String(form.name)}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              dir={locale === "ar" ? "rtl" : "ltr"}
            />
          </Field>

          <Fieldset legend={t("editModal.groupPricing")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("editModal.priceMonthly")}>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={Number(form.priceMonthly)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priceMonthly: e.target.value ? Number(e.target.value) : 0,
                    }))
                  }
                />
              </Field>
              <Field label={t("editModal.priceYearly")}>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={Number(form.priceYearly)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priceYearly: e.target.value ? Number(e.target.value) : 0,
                    }))
                  }
                />
              </Field>
            </div>

            {editingPro && (
              <Field
                label={t("editModal.extraMenuPrice")}
                hint={t("editModal.extraMenuPriceHint")}
              >
                <Input
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
                />
              </Field>
            )}
          </Fieldset>

          <Fieldset legend={t("editModal.groupLimits")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("editModal.maxMenus")}>
                <Input
                  type="number"
                  min={0}
                  value={Number(form.maxMenus)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxMenus: e.target.value ? Number(e.target.value) : 0,
                    }))
                  }
                />
              </Field>
              <Field
                label={t("editModal.maxProducts")}
                hint={t("editModal.maxProductsHint")}
              >
                <Input
                  type="number"
                  min={-1}
                  value={Number(form.maxProducts)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxProducts: e.target.value ? Number(e.target.value) : 0,
                    }))
                  }
                />
              </Field>
            </div>
          </Fieldset>

          <Fieldset legend={t("editModal.groupFlags")}>
            <Checkbox
              id="hasAds"
              label={t("editModal.hasAds")}
              checked={Boolean(form.hasAds)}
              onChange={(e) =>
                setForm((f) => ({ ...f, hasAds: e.target.checked }))
              }
            />
            <Checkbox
              id="isActive"
              label={t("editModal.isActive")}
              checked={Boolean(form.isActive)}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
            />
            <Checkbox
              id="allowFullDesignControl"
              label={t("editModal.allowFullDesignControl")}
              checked={Boolean(form.allowFullDesignControl)}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  allowFullDesignControl: e.target.checked,
                }))
              }
            />
          </Fieldset>

          <Fieldset legend={t("editModal.groupCapabilities")}>
            <PlanCapabilitiesFields
              idPrefix="plan"
              value={caps}
              onChange={setCaps}
              t={t}
            />
          </Fieldset>
        </div>
      </Modal>
    </PageShell>
  );
}
