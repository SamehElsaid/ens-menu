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

/**
 * The chosen photo, as a ruled plate.
 *
 * The remove control used to float over the image on a drop shadow, which is
 * the one thing a resting surface in this direction may not do — and it put a
 * destructive action on top of the content it destroys. Both actions now sit in
 * a hairline strip under the image with the file's own ticket line, so the
 * plate reads as image plus caption plus actions rather than a card with a
 * button stuck to it.
 */
export default function ImagePreviewCard({
  file,
  previewUrl,
  onReplace,
  onRemove,
}: ImagePreviewCardProps) {
  const t = useTranslations("MenuImport");

  return (
    <figure className="overflow-hidden rounded-lg border border-line">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt={file.name}
        className="max-h-72 w-full bg-surface-2 object-contain"
      />

      <figcaption className="flex items-center gap-2 border-t border-line bg-surface-2/40 px-2 py-1.5 sm:px-2.5">
        <IoImageOutline className="shrink-0 text-fg-subtle" aria-hidden />
        <span
          className="min-w-0 flex-1 truncate font-mono text-[11px] text-fg-muted"
          title={file.name}
        >
          {file.name}
        </span>
        <span className="ui-figure shrink-0 text-[11px] text-fg-muted">
          {formatFileSize(file.size)}
        </span>
        <Button variant="secondary" size="sm" onClick={onReplace}>
          {t("replaceImage")}
        </Button>
        <Button
          variant="dangerGhost"
          size="sm"
          iconOnly
          onClick={onRemove}
          aria-label={t("removeImage")}
          title={t("removeImage")}
        >
          <IoCloseOutline className="text-lg" />
        </Button>
      </figcaption>
    </figure>
  );
}
