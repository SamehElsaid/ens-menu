"use client";

import { useEffect, useRef, useState } from "react";
import type { ImportDraft } from "@/types/menuImport";
import { runWithConcurrency } from "@/lib/menuImport/runWithConcurrency";
import {
  fetchFirstPexelsImageUrl,
  shouldAutoFetchImportItemImage,
} from "@/lib/menuImport/pexelsImportImage";

interface UseAutoFetchImportItemImagesOptions {
  draft: ImportDraft;
  duplicatesLoading: boolean;
  enabled?: boolean;
  onItemImage: (
    categoryId: string,
    itemId: string,
    imageUrl: string,
  ) => void;
}

export function useAutoFetchImportItemImages({
  draft,
  duplicatesLoading,
  enabled = true,
  onItemImage,
}: UseAutoFetchImportItemImagesOptions) {
  const onItemImageRef = useRef(onItemImage);
  onItemImageRef.current = onItemImage;

  const [autoFetchingItemIds, setAutoFetchingItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  const sessionKey = `${draft.menuId}:${draft.createdAt}`;

  useEffect(() => {
    if (!enabled || duplicatesLoading) return;

    const pending = draft.categories.flatMap((category) =>
      category.items
        .filter((item) => shouldAutoFetchImportItemImage(item))
        .map((item) => ({ categoryId: category.id, item })),
    );

    if (pending.length === 0) return;

    let active = true;

    const markFetching = (itemId: string, fetching: boolean) => {
      if (!active) return;
      setAutoFetchingItemIds((current) => {
        const next = new Set(current);
        if (fetching) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
    };

    void runWithConcurrency(
      pending.map(({ categoryId, item }) => async () => {
        markFetching(item.id, true);
        try {
          const imageUrl = await fetchFirstPexelsImageUrl(item);
          if (imageUrl && active) {
            onItemImageRef.current(categoryId, item.id, imageUrl);
          }
        } catch {
          // Row-level fallback may retry when the category is expanded.
        } finally {
          markFetching(item.id, false);
        }
      }),
      4,
    );

    return () => {
      active = false;
    };
  }, [sessionKey, duplicatesLoading, enabled]);

  return { autoFetchingItemIds };
}
