"use client";

import { useTranslations } from "next-intl";
import type { ImportError } from "@/types/menuImport";
import { IoAlertCircleOutline, IoRefreshOutline } from "react-icons/io5";

interface ImportErrorPanelProps {
  error: ImportError;
  onRetry: () => void;
  onChangeImage: () => void;
}

export default function ImportErrorPanel({
  error,
  onRetry,
  onChangeImage,
}: ImportErrorPanelProps) {
  const t = useTranslations("MenuImport");

  const messageKey = (
    error.message === "n8n_webhook_inactive"
      ? "error_n8n_webhook_inactive"
      : error.message === "save_failed"
        ? "error_save_failed"
        : `error_${error.code}`
  ) as
    | "error_network"
    | "error_timeout"
    | "error_invalid_response"
    | "error_empty_result"
    | "error_validation"
    | "error_n8n_webhook_inactive"
    | "error_save_failed";

  return (
    <div className="max-w-lg mx-auto text-center py-10 space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <IoAlertCircleOutline className="text-3xl text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t("errorTitle")}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {t(messageKey)}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all"
        >
          <IoRefreshOutline className="text-lg" />
          {t("retryAnalysis")}
        </button>
        <button
          type="button"
          onClick={onChangeImage}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          {t("changeImage")}
        </button>
      </div>
    </div>
  );
}
