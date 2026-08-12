"use client";

import { useState } from "react";
import { IoCameraOutline } from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import { cn } from "@/lib/cn";
import { focusRing, Skeleton } from "@/components/ui";

interface ItemMobileThumbnailProps {
  src: string;
  alt: string;
  uploadLabel: string;
  onUploadClick: () => void;
}

export default function ItemMobileThumbnail({
  src,
  alt,
  uploadLabel,
  onUploadClick,
}: ItemMobileThumbnailProps) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <button
        type="button"
        onClick={onUploadClick}
        aria-label={uploadLabel}
        className={cn(
          "dashboard-item-thumb dashboard-item-thumb--empty flex size-18 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line-strong bg-surface-2 text-fg-muted",
          "transition-[color,background-color,border-color] duration-(--dur-fast) ease-(--ease-settle)",
          "hover:bg-surface-3 hover:text-fg active:bg-surface-3",
          focusRing,
        )}
      >
        <IoCameraOutline className="text-xl" aria-hidden />
        <span className="text-[10px] font-semibold leading-none">
          {uploadLabel}
        </span>
      </button>
    );
  }

  return (
    <div className="dashboard-item-thumb relative size-18 shrink-0 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-line">
      {!loaded && (
        <Skeleton className="absolute inset-0 size-full" rounded="lg" />
      )}
      <LoadImage
        src={src}
        alt={alt}
        width={144}
        height={144}
        cover
        className={`size-full object-cover ${loaded ? "opacity-100" : "opacity-0"}`}
        wrapperClassName="dashboard-item-thumb__fill"
        afterLoad={() => setLoaded(true)}
      />
      <button
        type="button"
        onClick={onUploadClick}
        aria-label={uploadLabel}
        className={cn(
          "absolute inset-0 flex items-end justify-end p-1",
          focusRing,
        )}
      >
        <span className="flex size-7 items-center justify-center rounded-lg border border-line bg-surface/85 text-fg backdrop-blur-sm">
          <IoCameraOutline className="text-sm" aria-hidden />
        </span>
      </button>
    </div>
  );
}
