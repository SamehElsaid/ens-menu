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
import { Button, SectionHeader, focusRing } from "@/components/ui";

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
    if (
      !_checkFileType(selected, [...MENU_IMPORT_ACCEPTED_TYPES])
    ) {
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

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title={t("uploadTitle")}
        description={t("uploadDescription")}
        className="mx-auto max-w-lg text-center sm:justify-center"
      />

      {!file || !previewUrl ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-10 transition-colors duration-150 sm:p-14",
            focusRing,
            isPreparing
              ? "cursor-wait border-brand-line bg-brand-soft/50"
              : isDragOver
                ? "cursor-pointer border-brand bg-brand-soft"
                : "cursor-pointer border-line-strong bg-surface-2 hover:border-brand-line hover:bg-brand-soft/40",
          )}
        >
          {isPreparing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/80">
              <p className="text-sm font-medium text-fg">
                {t("preparingImage")}
              </p>
            </div>
          )}
          <span className="flex size-14 items-center justify-center rounded-xl bg-brand-soft text-2xl text-brand-soft-fg">
            <IoCloudUploadOutline aria-hidden />
          </span>
          <div className="text-center">
            <p className="font-semibold text-fg">{t("dropzoneTitle")}</p>
            <p className="mt-1 text-[13px] text-fg-muted">{t("dropzoneHint")}</p>
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

      <ul className="mx-auto grid max-w-2xl gap-3 text-[13px] text-fg-muted sm:grid-cols-3">
        {[t("tip1"), t("tip2"), t("tip3")].map((tip) => (
          <li
            key={tip}
            className="flex items-start gap-2 rounded-xl border border-line bg-surface p-3"
          >
            <span className="shrink-0 text-brand" aria-hidden>
              •
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col-reverse items-center justify-center gap-3 pt-2 sm:flex-row">
        {showSkip && onSkip && (
          <Button
            variant="ghost"
            disabled={isProcessing || isPreparing}
            onClick={onSkip}
          >
            {t("skipOnboarding")}
          </Button>
        )}
        <Button
          size="lg"
          disabled={!file || isProcessing || isPreparing}
          onClick={onAnalyze}
        >
          {t("startAnalysis")}
        </Button>
      </div>
    </div>
  );
}
