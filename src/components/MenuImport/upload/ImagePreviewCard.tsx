"use client";

import { useTranslations } from "next-intl";
import { IoCloseOutline, IoImageOutline } from "react-icons/io5";

interface ImagePreviewCardProps {
  file: File;
  previewUrl: string;
  onReplace: () => void;
  onRemove: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImagePreviewCard({
  file,
  previewUrl,
  onReplace,
  onRemove,
}: ImagePreviewCardProps) {
  const t = useTranslations("MenuImport");

  return (
    <div className="max-w-md mx-auto">
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={file.name}
          className="w-full max-h-72 object-contain bg-slate-100 dark:bg-slate-900"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 end-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label={t("removeImage")}
        >
          <IoCloseOutline className="text-lg" />
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 mt-3 px-1">
        <div className="flex items-center gap-2 min-w-0 text-sm text-slate-600 dark:text-slate-400">
          <IoImageOutline className="shrink-0" />
          <span className="truncate">{file.name}</span>
          <span className="text-slate-400 shrink-0">({formatFileSize(file.size)})</span>
        </div>
        <button
          type="button"
          onClick={onReplace}
          className="text-sm font-medium text-primary hover:underline shrink-0"
        >
          {t("replaceImage")}
        </button>
      </div>
    </div>
  );
}
