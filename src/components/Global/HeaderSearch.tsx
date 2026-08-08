"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import LinkTo from "@/components/Global/LinkTo";

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
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setHasSearched(false);
  }, []);

  const open = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

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

  const getSubtitle = (item: SearchResult) =>
    isRTL ? item.titleEn : item.titleAr;

  const toSlug = (title: string, id: number): string => {
    const base = title
      .toLowerCase()
      .replace(/[\u0600-\u06FF\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return base ? `${base}-${id}` : `${id}`;
  };

  const popup =
    isOpen && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-20 px-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className="w-full max-w-xl bg-raised rounded-lg shadow-2xl overflow-hidden animate-[fadeInDown_0.2s_ease-out]">
              {/* Search input row */}
              <div
                className={`flex items-center gap-3 px-4 py-3 border-b border-line`}
              >
                <IoSearchOutline
                  className="shrink-0 text-purple-500"
                  size={20}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("placeholder")}
                  className="flex-1 bg-transparent text-sm text-fg placeholder-slate-400 focus:outline-none"
                />
                <button
                  onClick={close}
                  aria-label={t("close")}
                  className="shrink-0 p-1 rounded-full text-fg-subtle hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <IoCloseOutline size={20} />
                </button>
              </div>

              {/* Results body */}
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-fg-muted">
                  <FaSpinner className="animate-spin" />
                  <span>{t("loading")}</span>
                </div>
              ) : hasSearched && results.length === 0 ? (
                <p className="py-10 text-center text-sm text-fg-muted">
                  {t("noResults")}
                </p>
              ) : results.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto py-2">
                  {results.map((item) => (
                    <li key={item.id}>
                      <LinkTo
                        href={`knowledge-base/${toSlug(item.titleEn, item.id)}`}
                        onClick={close}
                        className={`flex items-start gap-3 px-5 py-3 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors`}
                      >
                        <IoSearchOutline
                          className="mt-0.5 shrink-0 text-purple-400"
                          size={16}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-fg line-clamp-1">
                            {getTitle(item)}
                          </p>
                        </div>
                      </LinkTo>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        onClick={open}
        aria-label={t("label")}
        className="p-2 rounded-full text-fg-muted hover:bg-purple-50 dark:hover:bg-purple-500/20 transition-colors"
      >
        <IoSearchOutline size={20} />
      </button>

      {popup}
    </>
  );
}
