"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import LoadImage from "@/components/ImageLoad";
import type { PexelsPhoto, PexelsSearchResponse } from "@/types/pexels";
import { IoCloudUploadOutline, IoSearchOutline } from "react-icons/io5";
import { cn } from "@/lib/cn";
import {
  Button,
  Input,
  LoadingBlock,
  Modal,
  NoResultsState,
  Spinner,
  focusRing,
} from "@/components/ui";

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
  /** Legacy hook for stacking contexts; the Modal primitive owns the overlay. */
  overlayClassName?: string;
}

export default function PexelsImagePickerModal({
  open,
  defaultQuery,
  isUploading,
  onClose,
  onUploadFromDevice,
  onSelectPhoto,
}: PexelsImagePickerModalProps) {
  const t = useTranslations("MenuImport");
  const tCommon = useTranslations("common");
  const [query, setQuery] = useState(defaultQuery);
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  const runSearch = useCallback(
    async (searchQuery: string, signal?: AbortSignal) => {
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
        const response = await fetch(
          `/api/pexels/search?${params.toString()}`,
          {
            signal,
          },
        );
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
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        toast.error(t("pexelsSearchError"));
        setPhotos([]);
        setSearchCompleted(true);
      } finally {
        setIsSearching(false);
      }
    },
    [t],
  );

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

  if (!open) return null;

  // Dismissal stays blocked while an upload or a selection is in flight.
  const canDismiss = !isUploading && selectingId === null;
  const handleClose = () => {
    if (canDismiss) onClose();
  };

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
    <Modal
      open
      onClose={handleClose}
      dismissible={canDismiss}
      title={t("pexelsSearchTitle")}
      description={t("pexelsSearchHint")}
      closeLabel={tCommon("close")}
      size="xl"
      footer={
        <div className="flex w-full flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "rounded text-center text-xs text-fg-subtle transition-colors hover:text-fg sm:text-start",
              focusRing,
            )}
          >
            {t("pexelsAttribution")}
          </a>
          <Button
            variant="secondary"
            onClick={onUploadFromDevice}
            disabled={!canDismiss}
            startIcon={<IoCloudUploadOutline className="text-lg" />}
          >
            {t("uploadFromDevice")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("pexelsSearchPlaceholder")}
          aria-label={t("pexelsSearchTitle")}
          startIcon={<IoSearchOutline className="size-4" />}
          data-autofocus
        />

        {showSearchLoading ? (
          <LoadingBlock
            label={t("pexelsSearching")}
            className="min-h-[220px]"
          />
        ) : showNoResults ? (
          <NoResultsState title={t("pexelsNoResults")} />
        ) : photos.length === 0 ? (
          <p className="flex min-h-[220px] items-center justify-center text-center text-[13px] text-fg-muted">
            {t("pexelsSearchPlaceholder")}
          </p>
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
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-2",
                    "transition-colors duration-150 hover:border-brand",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    focusRing,
                  )}
                >
                  <LoadImage
                    src={photo.src.medium}
                    alt={photo.alt || photo.photographer}
                    width={PEXELS_THUMB_WIDTH}
                    height={PEXELS_THUMB_HEIGHT}
                    cover
                    disableLazy
                    className="h-full w-full object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
                    wrapperClassName="!block h-full w-full"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-2 py-2 text-start">
                    <span className="line-clamp-1 text-[10px] font-medium text-white">
                      {photo.photographer}
                    </span>
                  </span>
                  {isSelecting && (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 px-2">
                      <Spinner size="md" className="text-white" />
                      <span className="text-center text-[9px] font-medium text-white">
                        {t("pexelsSelectingImage")}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
