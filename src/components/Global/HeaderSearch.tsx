"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IoSearchOutline,
  IoChevronForward,
  IoCloseOutline,
} from "react-icons/io5";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import LinkTo from "@/components/Global/LinkTo";
import { Button, Modal, Spinner } from "@/components/ui";

interface SearchResult {
  id: number;
  titleAr: string;
  titleEn: string;
}

interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Knowledge-base search from the public header.
 *
 * Trigger styling matches the site header icon buttons; the overlay stays on
 * the shared `Modal` primitive for focus trap, Escape, and scroll lock.
 */
export default function HeaderSearch() {
  const locale = useLocale();
  const t = useTranslations("headerSearch");
  const isRTL = locale === "ar";

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setHasSearched(false);
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 100);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchResults = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      setLoading(true);
      setHasSearched(true);
      try {
        const result = await axiosGet<SearchResponse>(
          "/searchInformation",
          locale,
          undefined,
          { page: 1, limit: 6, search: q.trim() },
        );
        setResults(
          result.status && result.data ? (result.data.data ?? []) : [],
        );
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [locale],
  );

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [fetchResults, debouncedQuery]);

  const getTitle = (item: SearchResult) =>
    isRTL && item.titleAr ? item.titleAr : item.titleEn;

  const toSlug = (title: string, id: number): string => {
    const base = title
      .toLowerCase()
      .replace(/[\u0600-\u06FF\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return base ? `${base}-${id}` : `${id}`;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("label")}
        className={
          "flex size-10 items-center justify-center rounded-site-control text-site-fg " +
          "transition-colors duration-(--dur-settle) hover:bg-site-tint hover:text-site-ink " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-brand/35"
        }
      >
        <IoSearchOutline className="size-[18px]" aria-hidden />
      </button>

      <Modal
        open={isOpen}
        onClose={close}
        size="md"
        bare
        showClose={false}
        closeLabel={t("close")}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-3 py-2.5">
          <IoSearchOutline
            className="size-4 shrink-0 text-fg-subtle"
            aria-hidden
          />
          <input
            data-autofocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("label")}
            className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={close}
            aria-label={t("close")}
          >
            <IoCloseOutline className="size-4.5" aria-hidden />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-fg-muted">
            <Spinner size="sm" />
            <span>{t("loading")}</span>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-fg-muted">
            {t("noResults")}
          </p>
        ) : results.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto">
            {results.map((item) => (
              <li key={item.id} className="border-b border-line last:border-b-0">
                <LinkTo
                  href={`knowledge-base/${toSlug(item.titleEn, item.id)}`}
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-2.5 row-settle hover:bg-surface-2"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-fg">
                    {getTitle(item)}
                  </span>
                  <IoChevronForward
                    className="size-3.5 shrink-0 text-fg-subtle rtl:rotate-180"
                    aria-hidden
                  />
                </LinkTo>
              </li>
            ))}
          </ul>
        ) : null}
      </Modal>
    </>
  );
}
