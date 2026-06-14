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
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t("uploadTitle")}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {t("uploadDescription")}
        </p>
      </div>

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
          className={`relative flex flex-col items-center justify-center gap-4 p-10 sm:p-14 rounded-2xl border-2 border-dashed transition-all ${
            isPreparing
              ? "border-primary/50 bg-primary/5 cursor-wait"
              : `cursor-pointer ${
                  isDragOver
                    ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 hover:bg-primary/5"
                }`
          }`}
        >
          {isPreparing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-slate-900/70">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t("preparingImage")}
              </p>
            </div>
          )}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <IoCloudUploadOutline className="text-3xl text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {t("dropzoneTitle")}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("dropzoneHint")}
            </p>
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

      <ul className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-sm text-slate-500 dark:text-slate-400">
        {[t("tip1"), t("tip2"), t("tip3")].map((tip) => (
          <li
            key={tip}
            className="flex items-start gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
          >
            <span className="text-primary shrink-0">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          disabled={!file || isProcessing || isPreparing}
          onClick={onAnalyze}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {t("startAnalysis")}
        </button>
        {showSkip && onSkip && (
          <button
            type="button"
            disabled={isProcessing || isPreparing}
            onClick={onSkip}
            className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-300 hover:text-primary font-medium transition-colors disabled:opacity-50"
          >
            {t("skipOnboarding")}
          </button>
        )}
      </div>
    </div>
  );
}
