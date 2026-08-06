"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiExternalLink, FiSave } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import CustomBtn from "@/components/Custom/CustomBtn";
import CustomInput from "@/components/Custom/CustomInput";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { axiosPatch } from "@/shared/axiosCall";
import { SET_ACTIVE_USER } from "@/store/authSlice/menuDataSlice";
import { toast } from "react-toastify";
import type { Menu } from "@/types/Menu";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import {
  DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_AR,
  DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_EN,
  GOOGLE_REVIEWS_POSITIONS,
  isValidGoogleReviewsUrl,
  normalizeGoogleReviewsPosition,
  normalizeGoogleReviewsUrl,
  type GoogleReviewsPosition,
} from "@/lib/googleReviewsUrl";

type FormState = {
  enabled: boolean;
  url: string;
  position: GoogleReviewsPosition;
  buttonTextAr: string;
  buttonTextEn: string;
  showIcon: boolean;
  openInNewTab: boolean;
};

const INITIAL: FormState = {
  enabled: true,
  url: "",
  position: "bottom",
  buttonTextAr: DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_AR,
  buttonTextEn: DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_EN,
  showIcon: true,
  openInNewTab: true,
};

function ToggleRow({
  label,
  onLabel,
  offLabel,
  checked,
  onChange,
  isRTL,
}: {
  label: string;
  onLabel: string;
  offLabel: string;
  checked: boolean;
  onChange: () => void;
  isRTL: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {checked ? onLabel : offLabel}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={onChange}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 ${
            checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-600"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
              checked
                ? isRTL
                  ? "-translate-x-5"
                  : "translate-x-5"
                : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function GoogleReviewsSettingsPage() {
  const t = useTranslations("settingsGoogleReviewsPage");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const dispatch = useAppDispatch();
  const { menu } = useAppSelector((state) => state.menuData);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!menu) return;
    setForm({
      enabled: menu.googleReviewsEnabled === true,
      url:
        typeof menu.googleReviewsUrl === "string" ? menu.googleReviewsUrl : "",
      position: normalizeGoogleReviewsPosition(menu.googleReviewsPosition),
      buttonTextAr:
        typeof menu.googleReviewsButtonTextAr === "string" &&
        menu.googleReviewsButtonTextAr.trim()
          ? menu.googleReviewsButtonTextAr
          : DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_AR,
      buttonTextEn:
        typeof menu.googleReviewsButtonTextEn === "string" &&
        menu.googleReviewsButtonTextEn.trim()
          ? menu.googleReviewsButtonTextEn
          : DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_EN,
      showIcon: menu.googleReviewsShowIcon !== false,
      openInNewTab: menu.googleReviewsOpenInNewTab !== false,
    });
  }, [menu]);

  const previewText = useMemo(() => {
    return isRTL
      ? form.buttonTextAr.trim() || DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_AR
      : form.buttonTextEn.trim() || DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_EN;
  }, [form.buttonTextAr, form.buttonTextEn, isRTL]);

  const openUrl = (url: string) => {
    const normalized = normalizeGoogleReviewsUrl(url);
    if (!isValidGoogleReviewsUrl(normalized)) {
      toast.error(t("url.invalid"));
      return;
    }
    window.open(normalized, "_blank", "noopener,noreferrer");
  };

  const handleSave = async () => {
    if (!menu?.id) {
      toast.error(t("noMenuSelected"));
      return;
    }

    const trimmedUrl = form.url.trim();
    if (form.enabled) {
      if (!trimmedUrl) {
        toast.error(t("url.required"));
        return;
      }
      if (!isValidGoogleReviewsUrl(trimmedUrl)) {
        toast.error(t("url.invalid"));
        return;
      }
    } else if (trimmedUrl && !isValidGoogleReviewsUrl(trimmedUrl)) {
      toast.error(t("url.invalid"));
      return;
    }

    const payload = {
      googleReviewsEnabled: form.enabled,
      googleReviewsUrl: trimmedUrl
        ? normalizeGoogleReviewsUrl(trimmedUrl)
        : null,
      googleReviewsPosition: form.position,
      googleReviewsButtonTextAr:
        form.buttonTextAr.trim() || DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_AR,
      googleReviewsButtonTextEn:
        form.buttonTextEn.trim() || DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_EN,
      googleReviewsShowIcon: form.showIcon,
      googleReviewsOpenInNewTab: form.openInNewTab,
    };

    setSaving(true);
    try {
      const result = await axiosPatch<typeof payload, Menu>(
        `/menus/${menu.id}`,
        locale,
        payload,
      );
      if (result.status) {
        dispatch(SET_ACTIVE_USER({ ...menu, ...payload } as Menu));
        toast.success(t("savedSuccess"));
      } else {
        const errData = result.data as {
          error?: string;
          errorAr?: string;
          errorEn?: string;
        };
        toast.error(
          (isRTL ? errData?.errorAr : errData?.errorEn) ||
            errData?.error ||
            t("url.invalid"),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)]">
      <header
        className={isRTL ? "text-right space-y-1" : "text-left space-y-1 mb-8"}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold">
          <FcGoogle className="text-sm" />
          <span>{t("badge")}</span>
        </div>
        <PageTitleWithHelp className="my-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("title")}
          </h1>
        </PageTitleWithHelp>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          {t("description")}
        </p>
      </header>

      <div className="space-y-6">
        <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6">
          <ToggleRow
            label={t("enabled")}
            onLabel={t("enabledOn")}
            offLabel={t("enabledOff")}
            checked={form.enabled}
            onChange={() =>
              setForm((prev) => ({ ...prev, enabled: !prev.enabled }))
            }
            isRTL={isRTL}
          />

          <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                <FcGoogle className="text-xl" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {t("url.title")}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t("url.hint")}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("url.label")}
              </label>
              <CustomInput
                type="url"
                value={form.url}
                onChange={(e) => {
                  const nextUrl = (e as React.ChangeEvent<HTMLInputElement>)
                    .target.value;
                  setForm((prev) => {
                    const trimmed = nextUrl.trim();
                    const shouldAutoEnable =
                      Boolean(trimmed) && isValidGoogleReviewsUrl(trimmed);
                    return {
                      ...prev,
                      url: nextUrl,
                      // Auto-enable when a valid Google link is entered so the
                      // public CTA actually appears after save.
                      enabled: shouldAutoEnable ? true : prev.enabled,
                    };
                  });
                }}
                onBlur={() => {
                  const trimmed = form.url.trim();
                  if (!trimmed) return;
                  const normalized = normalizeGoogleReviewsUrl(trimmed);
                  setForm((prev) => ({
                    ...prev,
                    url: normalized,
                    enabled: isValidGoogleReviewsUrl(normalized)
                      ? true
                      : prev.enabled,
                  }));
                }}
                placeholder={t("url.placeholder")}
              />
            </div>

            {!form.enabled && form.url.trim() ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-100">
                {t("enabledOffWarning")}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openUrl(form.url)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                <FiExternalLink />
                {t("url.preview")}
              </button>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("position.title")}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {GOOGLE_REVIEWS_POSITIONS.map((position) => (
                <label
                  key={position}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    form.position === position
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="googleReviewsPosition"
                    value={position}
                    checked={form.position === position}
                    onChange={() => setForm((prev) => ({ ...prev, position }))}
                    className="accent-(--color-primary,#0f766e)"
                  />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {t(`position.${position}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("buttonText.title")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("buttonText.ar")}
                </label>
                <CustomInput
                  type="text"
                  value={form.buttonTextAr}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      buttonTextAr: (e as React.ChangeEvent<HTMLInputElement>)
                        .target.value,
                    }))
                  }
                  placeholder={t("buttonText.arPlaceholder")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("buttonText.en")}
                </label>
                <CustomInput
                  type="text"
                  value={form.buttonTextEn}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      buttonTextEn: (e as React.ChangeEvent<HTMLInputElement>)
                        .target.value,
                    }))
                  }
                  placeholder={t("buttonText.enPlaceholder")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-700">
            <ToggleRow
              label={t("showIcon")}
              onLabel={t("showIconOn")}
              offLabel={t("showIconOff")}
              checked={form.showIcon}
              onChange={() =>
                setForm((prev) => ({ ...prev, showIcon: !prev.showIcon }))
              }
              isRTL={isRTL}
            />
            <ToggleRow
              label={t("openInNewTab")}
              onLabel={t("openInNewTabOn")}
              offLabel={t("openInNewTabOff")}
              checked={form.openInNewTab}
              onChange={() =>
                setForm((prev) => ({
                  ...prev,
                  openInNewTab: !prev.openInNewTab,
                }))
              }
              isRTL={isRTL}
            />
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("previewLabel")}
            </h2>
            <div
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {form.showIcon ? (
                <>
                  <span aria-hidden>⭐</span>
                  <FcGoogle className="shrink-0 text-lg" />
                </>
              ) : null}
              <span className="truncate">{previewText}</span>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <CustomBtn
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            loading={saving}
            className="w-auto! inline-flex items-center gap-2"
          >
            <FiSave className="text-lg" />
            {t("buttons.save")}
          </CustomBtn>
        </div>
      </div>
    </div>
  );
}
