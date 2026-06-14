"use client";

import { useState } from "react";
import { IoCameraOutline } from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";

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
        className="dashboard-item-thumb dashboard-item-thumb--empty group flex size-18 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-primary/30 bg-linear-to-br from-primary/[0.07] to-slate-50 transition-all active:scale-[0.96] dark:from-primary/10 dark:to-slate-800/80"
      >
        <IoCameraOutline className="text-xl text-primary" aria-hidden />
        <span className="text-[10px] font-semibold leading-none text-primary">
          {uploadLabel}
        </span>
      </button>
    );
  }

  return (
    <div className="dashboard-item-thumb relative size-18 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700">
      {!loaded && (
        <div className="dashboard-mobile-shimmer absolute inset-0 bg-slate-200 dark:bg-slate-700" />
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
        className="absolute inset-0 flex items-end justify-end p-1"
      >
        <span className="flex size-7 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition-transform active:scale-95">
          <IoCameraOutline className="text-sm" aria-hidden />
        </span>
      </button>
    </div>
  );
}
