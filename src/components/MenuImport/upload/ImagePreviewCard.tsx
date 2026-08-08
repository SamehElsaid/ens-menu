"use client";

import { useTranslations } from "next-intl";
import { IoCloseOutline, IoImageOutline } from "react-icons/io5";
import { Button } from "@/components/ui";

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
    <div className="mx-auto max-w-md">
      <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={file.name}
          className="max-h-72 w-full bg-surface-2 object-contain"
        />
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          onClick={onRemove}
          aria-label={t("removeImage")}
          className="absolute end-3 top-3 shadow-sm"
        >
          <IoCloseOutline className="text-lg" />
        </Button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-fg-muted">
          <IoImageOutline className="shrink-0" aria-hidden />
          <span className="truncate">{file.name}</span>
          <span className="shrink-0 text-fg-subtle">
            ({formatFileSize(file.size)})
          </span>
        </div>
        <Button variant="link" size="sm" onClick={onReplace}>
          {t("replaceImage")}
        </Button>
      </div>
    </div>
  );
}
