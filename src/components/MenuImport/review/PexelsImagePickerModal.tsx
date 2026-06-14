"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import LoadImage from "@/components/ImageLoad";
import type { PexelsPhoto, PexelsSearchResponse } from "@/types/pexels";
import {
  IoCloseOutline,
  IoCloudUploadOutline,
  IoSearchOutline,
} from "react-icons/io5";

const PEXELS_THUMB_WIDTH = 160;
const PEXELS_THUMB_HEIGHT = 160;
const SEARCH_DEBOUNCE_MS = 700;
const MIN_SEARCH_QUERY_LENGTH = 2;

interface PexelsImagePickerModalProps {
  open: boolean;
  defaultQuery: string;
  isUploading: boolean;
  onClose: () => void;
  onUploadFromDevice: () => void;
  onSelectPhoto: (photo: PexelsPhoto) => Promise<void>;
  overlayClassName?: string;
}

export default function PexelsImagePickerModal({
  open,
  defaultQuery,
  isUploading,
  onClose,
  onUploadFromDevice,
  onSelectPhoto,
  overlayClassName,
}: PexelsImagePickerModalProps) {
  const t = useTranslations("MenuImport");
  const [query, setQuery] = useState(defaultQuery);
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  const runSearch = useCallback(async (searchQuery: string, signal?: AbortSignal) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
      setPhotos([]);
      setSearchCompleted(false);
      return;
    }

    setIsSearching(true);
    setSearchCompleted(false);
    try {
      const params = new URLSearchParams({ query: trimmed, per_page: "15" });
      const response = await fetch(`/api/pexels/search?${params.toString()}`, {
        signal,
      });
      const data = (await response.json()) as PexelsSearchResponse & {
        error?: string;
      };

      if (!response.ok) {
        toast.error(
          data.error === "pexels_not_configured"
            ? t("pexelsNotConfigured")
            : t("pexelsSearchError"),
        );
        setPhotos([]);
        setSearchCompleted(true);
        return;
      }

      setPhotos(data.photos ?? []);
      setSearchCompleted(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(t("pexelsSearchError"));
      setPhotos([]);
      setSearchCompleted(true);
    } finally {
      setIsSearching(false);
    }
  }, [t]);

  useEffect(() => {
    if (!open) {
      setPhotos([]);
      setQuery("");
      setSearchCompleted(false);
      return;
    }
    setQuery(defaultQuery);
    setSearchCompleted(false);
  }, [open, defaultQuery]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (!trimmed || trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
      setPhotos([]);
      setIsSearching(false);
      setSearchCompleted(false);
      return;
    }

    setSearchCompleted(false);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void runSearch(trimmed, controller.signal);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, runSearch]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isUploading && selectingId === null) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, isUploading, selectingId, onClose]);

  if (!open) return null;

  const handleSelect = async (photo: PexelsPhoto) => {
    if (isUploading || selectingId !== null) return;

    setSelectingId(photo.id);
    try {
      await onSelectPhoto(photo);
      onClose();
    } catch {
      toast.error(t("imageUploadError"));
    } finally {
      setSelectingId(null);
    }
  };

  const trimmedQuery = query.trim();
  const isQueryReady = trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH;
  const showSearchLoading = isSearching || (isQueryReady && !searchCompleted);
  const showNoResults = searchCompleted && photos.length === 0 && isQueryReady;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 sm:items-center sm:p-4 ${overlayClassName ?? ""}`}
      onClick={(event) => {
        if (
          event.target === event.currentTarget &&
          !isUploading &&
          selectingId === null
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-full max-h-[min(92dvh,720px)] flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:max-w-2xl sm:rounded-2xl animate-[fadeIn_0.2s_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t("pexelsSearchTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("pexelsSearchHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading || selectingId !== null}
            className="shrink-0 p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        <div className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-6">
          <div className="relative">
            <IoSearchOutline className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("pexelsSearchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-4 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              autoFocus
            />
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 max-h-[min(calc(92dvh-12rem),560px)]">
          {showSearchLoading ? (
            <div className="flex min-h-[220px] items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {t("pexelsSearching")}
            </div>
          ) : showNoResults ? (
            <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              {t("pexelsNoResults")}
            </div>
          ) : photos.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              {t("pexelsSearchPlaceholder")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => {
                const isSelecting = selectingId === photo.id;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    disabled={isUploading || selectingId !== null}
                    onClick={() => void handleSelect(photo)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <LoadImage
                      src={photo.src.medium}
                      alt={photo.alt || photo.photographer}
                      width={PEXELS_THUMB_WIDTH}
                      height={PEXELS_THUMB_HEIGHT}
                      cover
                      disableLazy
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      wrapperClassName="!block h-full w-full"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-2 py-2 text-start">
                      <span className="line-clamp-1 text-[10px] font-medium text-white">
                        {photo.photographer}
                      </span>
                    </div>
                    {isSelecting && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 px-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="mt-1 text-center text-[9px] font-medium text-white">
                          {t("pexelsSelectingImage")}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {t("pexelsAttribution")}
          </a>
          <button
            type="button"
            onClick={onUploadFromDevice}
            disabled={isUploading || selectingId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <IoCloudUploadOutline className="text-lg" />
            {t("uploadFromDevice")}
          </button>
        </div>
      </div>
    </div>
  );
}
