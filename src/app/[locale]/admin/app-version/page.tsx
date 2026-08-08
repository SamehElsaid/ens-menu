"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { IoArrowBack } from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { Button, EmptyState, LoadingBlock, PageHeader } from "@/components/ui";

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
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  const resetForm = () => {
    setLatestVersion(emptyForm.latestVersion);
    setForceUpdate(emptyForm.forceUpdate);
    setDownloadUrl(emptyForm.downloadUrl);
    setReleaseNotesAr(emptyForm.releaseNotesAr);
    setReleaseNotesEn(emptyForm.releaseNotesEn);
  };

  const fetchLatestVersion = useCallback(async () => {
    try {
      setLoading(true);
      const result = await axiosGet<AppVersionGetResponse>(
        "/public/app-version",
        locale,
        undefined,
        undefined,
        true,
      );

      if (result.status && result.data?.version) {
        setCurrentVersion(result.data.version);
      } else if (result.status) {
        setCurrentVersion(null);
      } else {
        toast.error(t("loadError"));
      }
    } catch (err) {
      console.error("Error fetching app version:", err);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    fetchLatestVersion();
  }, [fetchLatestVersion]);

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

      const result = await axiosPost<
        AppVersionPayload,
        AppVersionCreateResponse
      >("/admin/app-version", locale, payload);

      if (result.status) {
        toast.success(t("saveSuccess"));
        resetForm();
        await fetchLatestVersion();
      } else {
        toast.error(t("saveError"));
      }
    } catch (err) {
      console.error("Error creating app version:", err);
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

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
        <h2 className="mb-4 text-lg font-semibold text-fg">
          {t("currentVersion")}
        </h2>
        {loading ? (
          <LoadingBlock label={tCommon("loading")} className="py-10" />
        ) : currentVersion ? (
          <dl className="grid max-w-2xl gap-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <dt className="text-fg-muted">{t("fields.version")}:</dt>
              <dd className="font-semibold text-fg" dir="ltr">
                {currentVersion.latestVersion}
              </dd>
            </div>
            <div className="flex flex-wrap gap-2">
              <dt className="text-fg-muted">{t("fields.forceUpdate")}:</dt>
              <dd className="text-fg">
                {currentVersion.forceUpdate ? t("yes") : t("no")}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-fg-muted">{t("fields.downloadUrl")}:</dt>
              <dd>
                <a
                  href={currentVersion.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-brand hover:underline"
                  dir="ltr"
                >
                  {currentVersion.downloadUrl}
                </a>
              </dd>
            </div>
            {currentVersion.releaseNotes_ar && (
              <div className="flex flex-col gap-1">
                <dt className="text-fg-muted">{t("fields.releaseNotesAr")}:</dt>
                <dd className="text-fg" dir="rtl">
                  {currentVersion.releaseNotes_ar}
                </dd>
              </div>
            )}
            {currentVersion.releaseNotes_en && (
              <div className="flex flex-col gap-1">
                <dt className="text-fg-muted">{t("fields.releaseNotesEn")}:</dt>
                <dd className="text-fg" dir="ltr">
                  {currentVersion.releaseNotes_en}
                </dd>
              </div>
            )}
            {currentVersion.updatedAt && (
              <p className="pt-2 text-xs text-fg-muted">
                {t("lastUpdated")}:{" "}
                {new Date(currentVersion.updatedAt).toLocaleString(
                  locale === "ar" ? "ar-EG" : "en-US",
                )}
              </p>
            )}
          </dl>
        ) : (
          <EmptyState title={t("noVersion")} size="sm" />
        )}
      </CardDashBoard>

      <CardDashBoard>
        <h2 className="mb-4 text-lg font-semibold text-fg">{t("addNew")}</h2>
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-fg-muted">
              {t("fields.version")}
            </label>
            <input
              type="text"
              required
              placeholder="1.0.2"
              value={latestVersion}
              onChange={(e) => setLatestVersion(e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-fg"
              dir="ltr"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="forceUpdate"
              checked={forceUpdate}
              onChange={(e) => setForceUpdate(e.target.checked)}
              className="size-4 rounded border-line-strong text-brand focus:ring-brand"
            />
            <label
              htmlFor="forceUpdate"
              className="text-sm font-medium text-fg-muted"
            >
              {t("fields.forceUpdate")}
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-fg-muted">
              {t("fields.downloadUrl")}
            </label>
            <input
              type="url"
              required
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-fg"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-fg-muted">
              {t("fields.releaseNotesAr")}
            </label>
            <textarea
              rows={3}
              value={releaseNotesAr}
              onChange={(e) => setReleaseNotesAr(e.target.value)}
              className="w-full resize-y rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-fg"
              dir="rtl"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-fg-muted">
              {t("fields.releaseNotesEn")}
            </label>
            <textarea
              rows={3}
              value={releaseNotesEn}
              onChange={(e) => setReleaseNotesEn(e.target.value)}
              className="w-full resize-y rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-fg"
              dir="ltr"
            />
          </div>

          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            {t("add")}
          </Button>
        </form>
      </CardDashBoard>
    </div>
  );
}
