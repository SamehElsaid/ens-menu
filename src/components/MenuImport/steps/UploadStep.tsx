"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { IoCloudUploadOutline } from "react-icons/io5";
import { _checkFileSize, _checkFileType } from "@/shared/_shared";
import {
  MENU_IMPORT_ACCEPTED_EXTENSIONS,
  MENU_IMPORT_ACCEPTED_TYPES,
  MENU_IMPORT_MAX_FILE_SIZE_MB,
} from "@/lib/menuImport/constants";
import ImagePreviewCard from "../upload/ImagePreviewCard";
import { cn } from "@/lib/cn";
import { Button, Card, Spinner, focusRing } from "@/components/ui";

interface UploadStepProps {
  file: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File) => void | Promise<void>;
  onClear: () => void;
  onAnalyze: () => void;
  isProcessing: boolean;
  isPreparing?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
}

/**
 * Step one, as a focused task.
 *
 * The previous version put four decorated boxes on one screen — a tinted
 * dropzone, three bordered tip cards and a centred heading — so nothing on it
 * was clearly the thing to do. This is one ruled panel: say what is wanted,
 * take the image, and close with a single ink action. The tips are a ticket
 * list at the foot rather than three cards competing with the dropzone for the
 * same attention.
 */
export default function UploadStep({
  file,
  previewUrl,
  onFileSelect,
  onClear,
  onAnalyze,
  isProcessing,
  isPreparing = false,
  showSkip = false,
  onSkip,
}: UploadStepProps) {
  const t = useTranslations("MenuImport");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateAndSet = async (selected: File) => {
    if (!_checkFileType(selected, [...MENU_IMPORT_ACCEPTED_TYPES])) {
      toast.error(t("invalidFileType"));
      return;
    }
    if (!_checkFileSize(selected, MENU_IMPORT_MAX_FILE_SIZE_MB)) {
      toast.error(t("invalidFileSize", { max: MENU_IMPORT_MAX_FILE_SIZE_MB }));
      return;
    }
    await onFileSelect(selected);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSet(selected);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (e.dataTransfer.files.length > 1) {
      toast.info(t("singleImageOnly"));
    }
    validateAndSet(dropped);
  };

  const tips = [t("tip1"), t("tip2"), t("tip3")];

  return (
    <Card padded="none" className="overflow-hidden">
      <div className="border-b border-line px-3 py-3 sm:px-4">
        <p className="ui-label mb-1">{t("stepUpload")}</p>
        <h2 className="text-sm font-semibold tracking-[-0.02em] text-fg">
          {t("uploadTitle")}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-fg-muted">
          {t("uploadDescription")}
        </p>
      </div>

      <div className="p-3 sm:p-4">
        {!file || !previewUrl ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 sm:py-14",
              "transition-[border-color,background-color] duration-(--dur-fast) ease-(--ease-settle)",
              focusRing,
              isPreparing
                ? "cursor-wait border-line-strong bg-surface-2"
                : isDragOver
                  ? "cursor-pointer border-accent bg-accent-soft"
                  : "cursor-pointer border-line-strong bg-surface-2 hover:border-fg-subtle",
            )}
          >
            {isPreparing ? (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-surface/85"
                role="status"
              >
                <Spinner size="md" className="text-fg-muted" />
                <p className="text-[13px] font-medium text-fg">
                  {t("preparingImage")}
                </p>
              </div>
            ) : null}

            <span
              className="flex size-10 items-center justify-center rounded-sm border border-line bg-surface text-xl text-fg-muted"
              aria-hidden
            >
              <IoCloudUploadOutline />
            </span>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-fg">
                {t("dropzoneTitle")}
              </p>
              <p className="mt-1 text-xs text-fg-muted">{t("dropzoneHint")}</p>
            </div>
          </div>
        ) : (
          <ImagePreviewCard
            file={file}
            previewUrl={previewUrl}
            onReplace={() => inputRef.current?.click()}
            onRemove={onClear}
          />
        )}

        <input
          ref={inputRef}
          type="file"
          accept={MENU_IMPORT_ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Guidance is a ticket list, not three cards: the tips matter before the
          photo is taken and should never look like the thing to click. */}
      <div className="border-t border-line bg-surface-2/40 px-3 py-2.5 sm:px-4">
        <p className="ui-label">{t("tipsTitle")}</p>
        <ul className="mt-1">
          {tips.map((tip, index) => (
            <li
              key={tip}
              className="flex items-baseline gap-2.5 border-b border-line py-1.5 last:border-b-0 last:pb-0"
            >
              <span className="ui-label shrink-0">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 text-xs leading-relaxed text-fg-muted">
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reversed in DOM order so the thumb lands on the ink action first. */}
      <div className="flex flex-col-reverse gap-2 border-t border-line px-3 py-3 sm:flex-row sm:justify-end sm:px-4">
        {showSkip && onSkip ? (
          <Button
            variant="ghost"
            disabled={isProcessing || isPreparing}
            onClick={onSkip}
            fullWidth
            className="sm:w-auto"
          >
            {t("skipOnboarding")}
          </Button>
        ) : null}
        <Button
          size="lg"
          disabled={!file || isProcessing || isPreparing}
          onClick={onAnalyze}
          loading={isProcessing}
          fullWidth
          className="sm:w-auto"
        >
          {t("startAnalysis")}
        </Button>
      </div>
    </Card>
  );
}
