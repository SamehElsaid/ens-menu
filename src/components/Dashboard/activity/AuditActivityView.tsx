"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IoSearchOutline, IoTimeOutline } from "react-icons/io5";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { useMenuActivityLog } from "@/hooks/useMenuActivityLog";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import AuditActivityTimeline from "./AuditActivityTimeline";

const PAGE_SIZE = 20;

export default function AuditActivityView() {
  const t = useTranslations("menuActivityLog");
  const locale = useLocale();
  const params = useParams();

  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isRTL = locale === "ar";
  const userData = useAppSelector((s) => s.auth.data);
  const includeProSources = Boolean(userData) && !isFreePlanUser(userData);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 200);
    return () => clearTimeout(id);
  }, [searchInput]);

  const searchBaseline = useRef<string | null>(null);
  useEffect(() => {
    if (searchBaseline.current === null) {
      searchBaseline.current = debouncedSearch;
      return;
    }
    if (searchBaseline.current !== debouncedSearch) {
      searchBaseline.current = debouncedSearch;
      setPage(1);
    }
  }, [debouncedSearch]);

  const { entries, loading, totalPages } = useMenuActivityLog(menuId, {
    page,
    limit: PAGE_SIZE,
    q: debouncedSearch || undefined,
    includeProSources,
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <header
        id="onboarding-history-header"
        className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-br from-slate-50 via-white to-violet-50/40 p-6 shadow-sm dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/20 md:p-8"
      >
        <div className="relative flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-slate-700 to-slate-900 text-white shadow-lg dark:from-slate-600 dark:to-slate-800">
            <IoTimeOutline className="text-2xl" aria-hidden />
          </div>
          <div>
            <PageTitleWithHelp>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                {t("title")}
              </h1>
            </PageTitleWithHelp>
            <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div id="onboarding-history-search" className="relative mt-6">
          <label htmlFor="audit-search" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <IoSearchOutline
            className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${isRTL ? "end-3" : "start-3"}`}
            aria-hidden
          />
          <input
            id="audit-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/25 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${isRTL ? "pe-11 ps-4" : "ps-11 pe-4"}`}
            autoComplete="off"
          />
        </div>
      </header>

      <div id="onboarding-history-table">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-600 dark:bg-slate-800/50">
            <IoTimeOutline className="mx-auto mb-3 text-4xl text-slate-400" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {debouncedSearch ? t("noSearchResults") : t("empty")}
            </p>
            {!debouncedSearch && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t("emptyHint")}
              </p>
            )}
          </div>
        ) : (
          <AuditActivityTimeline entries={entries} />
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("prev")}
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t("pageInfo", { page, totalPages })}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
