"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { IoMegaphoneOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  Badge,
  Button,
  Card,
  Field,
  LoadingBlock,
  PageHeader,
  PageShell,
  SectionHeader,
  Skeleton,
  Switch,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

interface PromoTextLocalized {
  ar: string;
  en: string;
}

interface PromoResponse {
  text: string;
  boolean: boolean;
}

function parsePromoText(raw: string): PromoTextLocalized {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Record<string, unknown>).ar === "string" &&
      typeof (parsed as Record<string, unknown>).en === "string"
    ) {
      return parsed as PromoTextLocalized;
    }
  } catch {
    // raw string fallback — treat as Arabic
  }
  return { ar: raw, en: "" };
}

export default function AdminPromoPage() {
  const locale = useLocale();
  const t = useTranslations("adminPromo");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const isRTL = locale === "ar";

  const [saving, setSaving] = useState(false);
  const [textAr, setTextAr] = useState("");
  const [textEn, setTextEn] = useState("");
  const [promoEnabled, setPromoEnabled] = useState(false);
  const { runApiAction } = useApiAction();

  const requestPromo = useCallback(
    () => axiosGet<PromoResponse>("/promo", locale),
    [locale],
  );
  const promoQuery = useApiQuery({
    request: requestPromo,
    errorToast: t("fetchError"),
    onSuccess: (data) => {
      const localized = parsePromoText(data.text ?? "");
      setTextAr(localized.ar);
      setTextEn(localized.en);
      setPromoEnabled(data.boolean ?? false);
    },
  });
  const loading = promoQuery.loading;

  const handleSave = async () => {
    if (!textAr.trim() && !textEn.trim()) {
      toast.error(t("textRequired"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        text: JSON.stringify({
          ar: textAr.trim(),
          en: textEn.trim(),
        }),
        boolean: promoEnabled,
      };
      await runApiAction(
        () => axiosPost<typeof payload, PromoResponse>("/promo", locale, payload),
        {
          successToast: t("saveSuccess"),
          errorToast: t("saveError"),
        },
      );
    } finally {
      setSaving(false);
    }
  };

  const previewText = (isRTL ? textAr : textEn) || (isRTL ? textEn : textAr);

  return (
    <PageShell
      kind="form"
      header={
        <>
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

          {/* This was two metric cards restating the form's own two fields —
              "status" and "current text" — as if they were measurements. A
              banner editor's useful non-form content is the banner, so the
              cards are replaced by the thing itself. */}
          <section aria-label={t("previewTitle")} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="ui-label text-fg-muted">{t("previewTitle")}</p>
              <Badge tone={promoEnabled ? "success" : "neutral"} dot>
                {promoEnabled ? t("statusActive") : t("statusInactive")}
              </Badge>
            </div>
            {loading ? (
              <Skeleton className="h-12" rounded="lg" />
            ) : (
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3.5 py-3",
                  promoEnabled
                    ? "border-brand-line bg-brand-soft"
                    : "border-line bg-surface-2",
                )}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <IoMegaphoneOutline
                  className="size-4.5 shrink-0 text-brand"
                  aria-hidden
                />
                <p className="min-w-0 text-[13px] font-medium text-fg">
                  {previewText || (
                    <span className="font-normal text-fg-subtle">
                      {t("previewEmpty")}
                    </span>
                  )}
                </p>
              </div>
            )}
            {!loading && previewText && !promoEnabled ? (
              <p className="text-xs text-fg-subtle">{t("previewHiddenNote")}</p>
            ) : null}
          </section>
        </>
      }
      footerSticky
      footer={
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={loading}
            startIcon={<FaSave />}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      }
    >
      <Card padded="lg">
        {loading ? (
          <LoadingBlock label={t("formTitle")} />
        ) : (
          <div className="space-y-6">
            <SectionHeader title={t("formTitle")} ruled />

            <Field
              label={
                <span className="inline-flex items-center gap-2">
                  <Badge tone="neutral" size="sm">
                    AR
                  </Badge>
                  {t("textLabelAr")}
                </span>
              }
            >
              <Textarea
                id="promo-text-ar"
                value={textAr}
                onChange={(e) => setTextAr(e.target.value)}
                rows={3}
                dir="rtl"
                placeholder={t("textPlaceholderAr")}
              />
            </Field>

            <Field
              label={
                <span className="inline-flex items-center gap-2">
                  <Badge tone="neutral" size="sm">
                    EN
                  </Badge>
                  {t("textLabelEn")}
                </span>
              }
            >
              <Textarea
                id="promo-text-en"
                value={textEn}
                onChange={(e) => setTextEn(e.target.value)}
                rows={3}
                dir="ltr"
                placeholder={t("textPlaceholderEn")}
              />
            </Field>

            <div className="rounded-lg border border-line bg-surface-2/50 p-4">
              <Switch
                id="promo-toggle"
                align="between"
                checked={promoEnabled}
                onChange={(e) => setPromoEnabled(e.target.checked)}
                label={t("enableLabel")}
                hint={t("enableDescription")}
              />
            </div>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
