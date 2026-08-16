"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiExternalLink, FiSave } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import CustomInput from "@/components/Custom/CustomInput";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  PageColumns,
  PageShell,
  SectionHeader,
  SegmentedControl,
  Switch,
} from "@/components/ui";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { axiosPut } from "@/shared/axiosCall";
import { SET_ACTIVE_MENU_CACHE } from "@/store/authSlice/menuDataSlice";
import { toast } from "react-toastify";
import type { Menu } from "@/types/Menu";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { menuDashboardPath } from "@/lib/menuDashboardPath";
import {
  DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_AR,
  DEFAULT_GOOGLE_REVIEWS_BUTTON_TEXT_EN,
  GOOGLE_REVIEWS_POSITIONS,
  isValidGoogleReviewsUrl,
  normalizeGoogleReviewsPosition,
  normalizeGoogleReviewsUrl,
  type GoogleReviewsPosition,
} from "@/lib/googleReviewsUrl";
import { useApiAction } from "@/hooks/useApiAction";

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

/**
 * A settings row that is a switch.
 *
 * The state word stays beside the control rather than being implied by the
 * track colour, because "on"/"off" is the fact the reader wants and a 36px
 * track is a small thing to read a boolean from.
 */
function ToggleRow({
  label,
  hint,
  onLabel,
  offLabel,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  onLabel: string;
  offLabel: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] leading-5 font-medium text-fg">
          {label}
        </span>
        {hint ? (
          <span className="text-xs leading-relaxed text-fg-muted">{hint}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-2.5">
        <span className="ui-label text-fg-subtle">
          {checked ? onLabel : offLabel}
        </span>
        <Switch checked={checked} onChange={onChange} aria-label={label} />
      </span>
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
  const { runApiAction } = useApiAction();

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
      await runApiAction(
        () =>
          axiosPut<typeof payload, Menu>(
            `/menus/${menu.id}`,
            locale,
            payload,
          ),
        {
          successToast: t("savedSuccess"),
          errorToast: ({ error }) => error || t("url.invalid"),
          onSuccess: () =>
            dispatch(SET_ACTIVE_MENU_CACHE({ ...menu, ...payload } as Menu)),
        },
      );
    } finally {
      setSaving(false);
    }
  };

  const urlIsValid = isValidGoogleReviewsUrl(form.url.trim());

  return (
    <PageShell
      kind="detail"
      header={
        <PageTitleWithHelp
          eyebrow={t("badge")}
          title={t("title")}
          description={t("description")}
          breadcrumbs={[
            {
              label: t("breadcrumbs.settings"),
              href: menuDashboardPath(menu, "settings"),
            },
            { label: t("title") },
          ]}
          breadcrumbsLabel={t("title")}
          meta={
            <Badge tone={form.enabled ? "accent" : "neutral"} dot size="md">
              {form.enabled ? t("enabledOn") : t("enabledOff")}
            </Badge>
          }
        />
      }
      footerSticky
      footer={
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            loading={saving}
            startIcon={<FiSave aria-hidden />}
          >
            {t("buttons.save")}
          </Button>
        </div>
      }
    >
      {/* The preview is a rail rather than the last block on the page: the whole
          point of these five fields is the button they produce, so it stays in
          view while they are edited. */}
      <PageColumns
        side={
          <Card padded="lg">
            <SectionHeader eyebrow={t("badge")} title={t("previewLabel")} />
            {/* Bone well, because this is a stand-in for the customer's menu
                page rather than part of the dashboard chrome. */}
            <div className="mt-4 flex items-center justify-center rounded-lg border border-line bg-surface-2 px-4 py-8">
              <span
                className="inline-flex max-w-full items-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-medium text-on-brand"
                dir={isRTL ? "rtl" : "ltr"}
              >
                {form.showIcon ? (
                  <FcGoogle className="size-4 shrink-0" aria-hidden />
                ) : null}
                <span className="truncate">{previewText}</span>
              </span>
            </div>
            <dl className="mt-4 border-t border-line">
              <div className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                <dt className="ui-label text-fg-muted">
                  {t("position.title")}
                </dt>
                <dd className="text-[13px] text-fg">
                  {t(`position.${form.position}`)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-line py-2">
                <dt className="ui-label text-fg-muted">{t("openInNewTab")}</dt>
                <dd className="text-[13px] text-fg">
                  {form.openInNewTab
                    ? t("openInNewTabOn")
                    : t("openInNewTabOff")}
                </dd>
              </div>
            </dl>
          </Card>
        }
      >
        <Card padded="lg">
          <SectionHeader
            ruled
            eyebrow={t("badge")}
            title={t("url.title")}
            description={t("url.hint")}
            actions={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!urlIsValid}
                onClick={() => openUrl(form.url)}
                startIcon={<FiExternalLink aria-hidden />}
              >
                {t("url.preview")}
              </Button>
            }
          />

          <Field className="mt-4" label={t("url.label")}>
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
          </Field>

          {!form.enabled && form.url.trim() ? (
            <Alert tone="warning" className="mt-3">
              {t("enabledOffWarning")}
            </Alert>
          ) : null}
        </Card>

        <Card padded="lg">
          <SectionHeader
            ruled
            eyebrow={t("position.title")}
            title={t("buttonText.title")}
          />

          <div className="mt-4 flex flex-col gap-4">
            <Field label={t("position.title")}>
              <SegmentedControl
                label={t("position.title")}
                value={form.position}
                onChange={(position) =>
                  setForm((prev) => ({ ...prev, position }))
                }
                options={GOOGLE_REVIEWS_POSITIONS.map((position) => ({
                  value: position,
                  label: t(`position.${position}`),
                }))}
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t("buttonText.ar")}>
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
              </Field>
              <Field label={t("buttonText.en")}>
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
              </Field>
            </div>
          </div>
        </Card>

        <Card padded="lg">
          <SectionHeader ruled eyebrow={t("badge")} title={t("showIcon")} />
          <div className="mt-1">
            <ToggleRow
              label={t("enabled")}
              onLabel={t("enabledOn")}
              offLabel={t("enabledOff")}
              checked={form.enabled}
              onChange={() =>
                setForm((prev) => ({ ...prev, enabled: !prev.enabled }))
              }
            />
            <ToggleRow
              label={t("showIcon")}
              onLabel={t("showIconOn")}
              offLabel={t("showIconOff")}
              checked={form.showIcon}
              onChange={() =>
                setForm((prev) => ({ ...prev, showIcon: !prev.showIcon }))
              }
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
            />
          </div>
        </Card>
      </PageColumns>
    </PageShell>
  );
}
