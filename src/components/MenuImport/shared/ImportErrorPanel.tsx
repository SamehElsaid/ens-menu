"use client";

import { useTranslations } from "next-intl";
import type { ImportError } from "@/types/menuImport";
import { Button, ErrorState } from "@/components/ui";

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
    <div className="mx-auto flex max-w-lg flex-col gap-4 py-6">
      <ErrorState
        title={t("errorTitle")}
        description={t(messageKey)}
        onRetry={onRetry}
        retryLabel={t("retryAnalysis")}
      />
      <div className="flex justify-center">
        <Button variant="ghost" onClick={onChangeImage}>
          {t("changeImage")}
        </Button>
      </div>
    </div>
  );
}
