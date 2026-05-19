"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { IoArrowBack } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";

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
  const router = useRouter();
  const isRTL = locale === "ar";

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

      const result = await axiosPost<AppVersionPayload, AppVersionCreateResponse>(
        "/admin/app-version",
        locale,
        payload,
      );

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
      <div
        className={`flex flex-col gap-4 ${isRTL ? "text-right" : "text-left"}`}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-fit ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <IoArrowBack className="text-lg" />
          <span className="font-medium">{t("back")}</span>
        </button>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t("title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
      </div>

      <CardDashBoard>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          {t("currentVersion")}
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <FaSpinner className="animate-spin text-2xl text-primary" />
          </div>
        ) : currentVersion ? (
          <dl className="grid gap-3 text-sm max-w-2xl">
            <div className="flex flex-wrap gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("fields.version")}:
              </dt>
              <dd className="font-semibold text-slate-900 dark:text-slate-100" dir="ltr">
                {currentVersion.latestVersion}
              </dd>
            </div>
            <div className="flex flex-wrap gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("fields.forceUpdate")}:
              </dt>
              <dd className="text-slate-900 dark:text-slate-100">
                {currentVersion.forceUpdate ? t("yes") : t("no")}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("fields.downloadUrl")}:
              </dt>
              <dd>
                <a
                  href={currentVersion.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary break-all hover:underline"
                  dir="ltr"
                >
                  {currentVersion.downloadUrl}
                </a>
              </dd>
            </div>
            {currentVersion.releaseNotes_ar && (
              <div className="flex flex-col gap-1">
                <dt className="text-slate-500 dark:text-slate-400">
                  {t("fields.releaseNotesAr")}:
                </dt>
                <dd className="text-slate-800 dark:text-slate-200" dir="rtl">
                  {currentVersion.releaseNotes_ar}
                </dd>
              </div>
            )}
            {currentVersion.releaseNotes_en && (
              <div className="flex flex-col gap-1">
                <dt className="text-slate-500 dark:text-slate-400">
                  {t("fields.releaseNotesEn")}:
                </dt>
                <dd className="text-slate-800 dark:text-slate-200" dir="ltr">
                  {currentVersion.releaseNotes_en}
                </dd>
              </div>
            )}
            {currentVersion.updatedAt && (
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                {t("lastUpdated")}:{" "}
                {new Date(currentVersion.updatedAt).toLocaleString(
                  locale === "ar" ? "ar-EG" : "en-US",
                )}
              </p>
            )}
          </dl>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">{t("noVersion")}</p>
        )}
      </CardDashBoard>

      <CardDashBoard>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          {t("addNew")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("fields.version")}
            </label>
            <input
              type="text"
              required
              placeholder="1.0.2"
              value={latestVersion}
              onChange={(e) => setLatestVersion(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              dir="ltr"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="forceUpdate"
              checked={forceUpdate}
              onChange={(e) => setForceUpdate(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="forceUpdate"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("fields.forceUpdate")}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("fields.downloadUrl")}
            </label>
            <input
              type="url"
              required
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("fields.releaseNotesAr")}
            </label>
            <textarea
              rows={3}
              value={releaseNotesAr}
              onChange={(e) => setReleaseNotesAr(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-y"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t("fields.releaseNotesEn")}
            </label>
            <textarea
              rows={3}
              value={releaseNotesEn}
              onChange={(e) => setReleaseNotesEn(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-y"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                {t("saving")}
              </>
            ) : (
              t("add")
            )}
          </button>
        </form>
      </CardDashBoard>
    </div>
  );
}
