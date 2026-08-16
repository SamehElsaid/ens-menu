"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  Fieldset,
  Input,
  LoadingBlock,
  PageColumns,
  PageHeader,
  PageShell,
  SectionHeader,
  Textarea,
} from "@/components/ui";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

interface AppVersionData {
  latestVersion: string;
  forceUpdate: boolean;
  downloadUrl: string;
  releaseNotes_ar: string | null;
  releaseNotes_en: string | null;
  updatedAt?: string;
}

interface AppVersionGetResponse {
  version?: AppVersionData;
}

interface AppVersionCreateResponse {
  version?: AppVersionData;
  message?: string;
}

interface AppVersionPayload {
  latestVersion: string;
  forceUpdate: boolean;
  downloadUrl: string;
  releaseNotes_ar: string;
  releaseNotes_en: string;
}

const emptyForm = {
  latestVersion: "",
  forceUpdate: false,
  downloadUrl: "",
  releaseNotesAr: "",
  releaseNotesEn: "",
};

export default function AppVersionPage() {
  const locale = useLocale();
  const t = useTranslations("adminAppVersion");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");

  const [saving, setSaving] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<AppVersionData | null>(
    null,
  );

  const [latestVersion, setLatestVersion] = useState(emptyForm.latestVersion);
  const [forceUpdate, setForceUpdate] = useState(emptyForm.forceUpdate);
  const [downloadUrl, setDownloadUrl] = useState(emptyForm.downloadUrl);
  const [releaseNotesAr, setReleaseNotesAr] = useState(
    emptyForm.releaseNotesAr,
  );
  const [releaseNotesEn, setReleaseNotesEn] = useState(
    emptyForm.releaseNotesEn,
  );
  const { runApiAction } = useApiAction();

  const resetForm = () => {
    setLatestVersion(emptyForm.latestVersion);
    setForceUpdate(emptyForm.forceUpdate);
    setDownloadUrl(emptyForm.downloadUrl);
    setReleaseNotesAr(emptyForm.releaseNotesAr);
    setReleaseNotesEn(emptyForm.releaseNotesEn);
  };

  const requestLatestVersion = useCallback(
    () =>
      axiosGet<AppVersionGetResponse>(
        "/public/app-version",
        locale,
        undefined,
        undefined,
        true,
      ),
    [locale],
  );
  const versionQuery = useApiQuery({
    request: requestLatestVersion,
    errorToast: t("loadError"),
    onSuccess: (data) => setCurrentVersion(data.version ?? null),
  });
  const loading = versionQuery.loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!latestVersion.trim()) {
      toast.error(t("versionRequired"));
      return;
    }

    if (!downloadUrl.trim()) {
      toast.error(t("downloadUrlRequired"));
      return;
    }

    setSaving(true);
    try {
      const payload: AppVersionPayload = {
        latestVersion: latestVersion.trim(),
        forceUpdate,
        downloadUrl: downloadUrl.trim(),
        releaseNotes_ar: releaseNotesAr.trim(),
        releaseNotes_en: releaseNotesEn.trim(),
      };

      await runApiAction(
        () =>
          axiosPost<AppVersionPayload, AppVersionCreateResponse>(
            "/admin/app-version",
            locale,
            payload,
          ),
        {
          successToast: t("saveSuccess"),
          errorToast: t("saveError"),
          onSuccess: () => {
            resetForm();
            void versionQuery.refetch();
          },
        },
      );
    } finally {
      setSaving(false);
    }
  };

  /* Publishing a release means writing a version number that has to be higher
     than the one already out, so the shipped release sits beside the form as
     reference rather than above it as a block to scroll past. */
  const currentReleaseCard = (
    <Card padded="lg">
      <SectionHeader title={t("currentVersion")} className="mb-4" ruled />
      {loading ? (
        <LoadingBlock label={tCommon("loading")} className="py-10" />
      ) : currentVersion ? (
        /* Stacked rather than a two-column spec sheet: at side-column width a
           fixed label gutter left the download URL four characters to wrap in. */
        <dl className="flex flex-col divide-y divide-line">
          <div className="flex flex-col gap-0.5 pb-2.5">
            <dt className="ui-label">{t("fields.version")}</dt>
            <dd className="ui-figure text-base text-fg" dir="ltr">
              {currentVersion.latestVersion}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2.5">
            <dt className="ui-label">{t("fields.forceUpdate")}</dt>
            <dd>
              <Badge
                tone={currentVersion.forceUpdate ? "warning" : "neutral"}
                dot
              >
                {currentVersion.forceUpdate ? t("yes") : t("no")}
              </Badge>
            </dd>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 py-2.5">
            <dt className="ui-label">{t("fields.downloadUrl")}</dt>
            <dd className="min-w-0">
              <a
                href={currentVersion.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-[12px] text-brand hover:underline"
                dir="ltr"
              >
                {currentVersion.downloadUrl}
              </a>
            </dd>
          </div>
          {currentVersion.releaseNotes_ar && (
            <div className="flex min-w-0 flex-col gap-0.5 py-2.5">
              <dt className="ui-label">{t("fields.releaseNotesAr")}</dt>
              <dd
                className="min-w-0 text-[13px] leading-relaxed text-fg"
                dir="rtl"
              >
                {currentVersion.releaseNotes_ar}
              </dd>
            </div>
          )}
          {currentVersion.releaseNotes_en && (
            <div className="flex min-w-0 flex-col gap-0.5 py-2.5">
              <dt className="ui-label">{t("fields.releaseNotesEn")}</dt>
              <dd
                className="min-w-0 text-[13px] leading-relaxed text-fg"
                dir="ltr"
              >
                {currentVersion.releaseNotes_en}
              </dd>
            </div>
          )}
          {currentVersion.updatedAt && (
            <div className="flex flex-col gap-0.5 pt-2.5">
              <dt className="ui-label">{t("lastUpdated")}</dt>
              <dd className="ui-figure text-[12px] text-fg-muted">
                {new Date(currentVersion.updatedAt).toLocaleString(
                  locale === "ar" ? "ar-EG" : "en-US",
                )}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <EmptyState title={t("noVersion")} size="sm" />
      )}
    </Card>
  );

  return (
    <PageShell
      kind="detail"
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
    >
      <PageColumns side={currentReleaseCard}>
        <Card padded="lg">
          <SectionHeader title={t("addNew")} className="mb-4" ruled />
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Fieldset legend={t("groupRelease")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={t("fields.version")} required>
                  <Input
                    type="text"
                    required
                    placeholder="1.0.2"
                    value={latestVersion}
                    onChange={(e) => setLatestVersion(e.target.value)}
                    dir="ltr"
                  />
                </Field>
                <Field label={t("fields.downloadUrl")} required>
                  <Input
                    type="url"
                    required
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    dir="ltr"
                  />
                </Field>
              </div>
              <Checkbox
                id="forceUpdate"
                label={t("fields.forceUpdate")}
                hint={t("forceUpdateHint")}
                checked={forceUpdate}
                onChange={(e) => setForceUpdate(e.target.checked)}
              />
            </Fieldset>

            <Fieldset legend={t("groupNotes")}>
              <Field label={t("fields.releaseNotesEn")}>
                <Textarea
                  rows={4}
                  value={releaseNotesEn}
                  onChange={(e) => setReleaseNotesEn(e.target.value)}
                  dir="ltr"
                />
              </Field>
              <Field label={t("fields.releaseNotesAr")}>
                <Textarea
                  rows={4}
                  value={releaseNotesAr}
                  onChange={(e) => setReleaseNotesAr(e.target.value)}
                  dir="rtl"
                />
              </Field>
            </Fieldset>

            <div className="flex justify-end border-t border-line pt-4">
              <Button
                type="submit"
                loading={saving}
                className="w-full sm:w-auto"
              >
                {t("add")}
              </Button>
            </div>
          </form>
        </Card>
      </PageColumns>
    </PageShell>
  );
}
