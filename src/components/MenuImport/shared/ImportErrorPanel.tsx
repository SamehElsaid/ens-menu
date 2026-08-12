"use client";

import { useTranslations } from "next-intl";
import type { ImportError } from "@/types/menuImport";
import { IoAlertCircleOutline, IoRefreshOutline } from "react-icons/io5";
import { Button, Card } from "@/components/ui";

interface ImportErrorPanelProps {
  error: ImportError;
  onRetry: () => void;
  onChangeImage: () => void;
}

/**
 * The analysis failed.
 *
 * A centred dashed placeholder with a button under it read as an empty state —
 * as though nothing had happened yet. This is an elevated panel instead: the
 * problem is named in a danger-toned header and the two ways out sit in a
 * divided action row, with retry as the primary action because it is the one
 * that works most of the time.
 */
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
    <Card padded="none" className="overflow-hidden" role="alert">
      <div className="flex items-start gap-2.5 border-b border-danger-line bg-danger-soft px-3 py-3 sm:px-4">
        <span
          className="mt-px flex size-7 shrink-0 items-center justify-center rounded-sm bg-danger/10 text-base text-danger"
          aria-hidden
        >
          <IoAlertCircleOutline />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-[-0.02em] text-danger-fg">
            {t("errorTitle")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-danger-fg/85">
            {t(messageKey)}
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 px-3 py-3 sm:flex-row sm:justify-end sm:px-4">
        <Button
          variant="secondary"
          onClick={onChangeImage}
          fullWidth
          className="sm:w-auto"
        >
          {t("changeImage")}
        </Button>
        <Button
          onClick={onRetry}
          startIcon={<IoRefreshOutline className="text-base" />}
          fullWidth
          className="sm:w-auto"
        >
          {t("retryAnalysis")}
        </Button>
      </div>
    </Card>
  );
}
