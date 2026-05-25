"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { IoArrowBack, IoMegaphoneOutline } from "react-icons/io5";
import { FaSpinner, FaSave } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";

interface PromoTextLocalized {
  ar: string;
  en: string;
}

interface PromoData {
  text: string;
  boolean: boolean;
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

    try {
      setSaving(true);
      const localized: PromoTextLocalized = { ar: textAr.trim(), en: textEn.trim() };
      const payload: PromoData = {
        text: JSON.stringify(localized),
        boolean: promoEnabled,
      };
      const result = await axiosPost<PromoData, PromoResponse>("/promo", locale, payload);

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

  const textareaClass =
    "w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
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
          <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardDashBoard
          borderColor={
            promoEnabled
              ? "border-green-200 dark:border-green-500/20"
              : "border-slate-200 dark:border-slate-700"
          }
          hover
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm transition-colors ${promoEnabled ? "bg-green-50 dark:bg-green-500/20" : "bg-slate-100 dark:bg-slate-800"
                }`}
            >
              <IoMegaphoneOutline
                className={`text-2xl transition-colors ${promoEnabled
                    ? "text-green-600 dark:text-green-400"
                    : "text-slate-400 dark:text-slate-500"
                  }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t("statusLabel")}
              </p>
              <p
                className={`text-xl font-bold transition-colors ${promoEnabled
                    ? "text-green-600 dark:text-green-400"
                    : "text-slate-500 dark:text-slate-400"
                  }`}
              >
                {promoEnabled ? t("statusActive") : t("statusInactive")}
              </p>
            </div>
          </div>
        </CardDashBoard>

        <CardDashBoard borderColor="border-blue-200 dark:border-blue-500/20" hover>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-2xl">📝</span>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t("currentText")}
              </p>
              {loading ? (
                <p className="text-sm text-slate-400">...</p>
              ) : (
                <>
                  <p
                    className="text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-pre-wrap"
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {(isRTL ? textAr : textEn) || "—"}
                  </p>
                </>
              )}
            </div>
          </div>
        </CardDashBoard>
      </div>

      {/* Edit Form */}
      <CardDashBoard>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FaSpinner className="animate-spin text-3xl text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("formTitle")}
            </h2>

            {/* Arabic Text */}
            <div className="space-y-2">
              <label
                htmlFor="promo-text-ar"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                  AR
                </span>
                {t("textLabelAr")}
              </label>
              <textarea
                id="promo-text-ar"
                value={textAr}
                onChange={(e) => setTextAr(e.target.value)}
                rows={3}
                dir="rtl"
                placeholder={t("textPlaceholderAr")}
                className={textareaClass}
              />
            </div>

            {/* English Text */}
            <div className="space-y-2">
              <label
                htmlFor="promo-text-en"
                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                  EN
                </span>
                {t("textLabelEn")}
              </label>
              <textarea
                id="promo-text-en"
                value={textEn}
                onChange={(e) => setTextEn(e.target.value)}
                rows={3}
                dir="ltr"
                placeholder={t("textPlaceholderEn")}
                className={textareaClass}
              />
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("enableLabel")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("enableDescription")}
                </p>
              </div>
              <button
                id="promo-toggle"
                role="switch"
                aria-checked={promoEnabled}
                onClick={() => setPromoEnabled((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${promoEnabled ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-200 ${promoEnabled
                      ? isRTL ? "-translate-x-5" : "translate-x-5"
                      : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <FaSave className="text-sm" />
                )}
                <span>{saving ? t("saving") : t("save")}</span>
              </button>
            </div>
          </div>
        )}
      </CardDashBoard>
    </div>
  );
}
