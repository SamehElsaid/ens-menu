"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { IoArrowBack, IoMegaphoneOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  Badge,
  Button,
  Field,
  LoadingBlock,
  PageHeader,
  SectionHeader,
  Skeleton,
  Switch,
  Textarea,
} from "@/components/ui";

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
  const router = useRouter();
  const isRTL = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [textAr, setTextAr] = useState("");
  const [textEn, setTextEn] = useState("");
  const [promoEnabled, setPromoEnabled] = useState(false);

  const fetchPromo = useCallback(async () => {
    try {
      setLoading(true);
      const result = await axiosGet<PromoResponse>("/promo", locale);
      if (result.status && result.data) {
        const localized = parsePromoText(result.data.text ?? "");
        setTextAr(localized.ar);
        setTextEn(localized.en);
        setPromoEnabled(result.data.boolean ?? false);
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
    fetchPromo();
  }, [fetchPromo]);

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
      const result = await axiosPost<typeof payload, PromoResponse>(
        "/promo",
        locale,
        payload,
      );
      if (result.status) {
        toast.success(t("saveSuccess"));
      } else {
        toast.error(t("saveError"));
      }
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CardDashBoard hover>
          <div className="flex items-center gap-4">
            <div
              className={`flex size-14 items-center justify-center rounded-lg ${
                promoEnabled
                  ? "bg-success-soft text-success-fg"
                  : "bg-surface-2 text-fg-subtle"
              }`}
            >
              <IoMegaphoneOutline className="text-2xl" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium text-fg-muted">
                {t("statusLabel")}
              </p>
              <Badge tone={promoEnabled ? "success" : "neutral"} size="md">
                {promoEnabled ? t("statusActive") : t("statusInactive")}
              </Badge>
            </div>
          </div>
        </CardDashBoard>

        <CardDashBoard hover>
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info-fg">
              <IoMegaphoneOutline className="text-2xl" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium text-fg-muted">
                {t("currentText")}
              </p>
              {loading ? (
                <Skeleton className="h-4 w-3/4" />
              ) : (
                <p
                  className="whitespace-pre-wrap text-sm font-semibold text-fg"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {(isRTL ? textAr : textEn) || "—"}
                </p>
              )}
            </div>
          </div>
        </CardDashBoard>
      </div>

      <CardDashBoard>
        {loading ? (
          <LoadingBlock label={t("formTitle")} />
        ) : (
          <div className="space-y-6">
            <SectionHeader title={t("formTitle")} />

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

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                loading={saving}
                startIcon={<FaSave />}
              >
                {saving ? t("saving") : t("save")}
              </Button>
            </div>
          </div>
        )}
      </CardDashBoard>
    </div>
  );
}
