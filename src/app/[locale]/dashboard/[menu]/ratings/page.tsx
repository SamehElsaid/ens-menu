"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IoArrowBackOutline, IoSearchOutline, IoStar } from "react-icons/io5";
import { axiosGet } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import LinkTo from "@/components/Global/LinkTo";
import RatingsCardGrid from "@/components/Dashboard/ratings/RatingsCardGrid";
import RatingStars from "@/components/Dashboard/ratings/RatingStars";
import type {
  MenuRating,
  MenuRatingsResponse,
  MenuRatingsSummary,
} from "@/types/menuRating";

const PAGE_LIMIT = 12;

export default function RatingsPage() {
  const t = useTranslations("Ratings");
  const locale = useLocale();
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [ratings, setRatings] = useState<MenuRating[]>([]);
  const [summary, setSummary] = useState<MenuRatingsSummary>({
    total: 0,
    average: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const fetchRatings = useCallback(async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      const paramsObj: Record<string, unknown> = {
        page,
        limit: PAGE_LIMIT,
      };
      if (query) paramsObj.q = query;

      const result = await axiosGet<MenuRatingsResponse>(
        `/menus/${menuId}/ratings`,
        locale,
        undefined,
        paramsObj,
      );

      if (result.status && result.data?.data) {
        const payload = result.data.data;
        setRatings(payload.ratings ?? []);
        setSummary({
          total: payload.summary?.total ?? payload.pagination?.total ?? 0,
          average: payload.summary?.average ?? 0,
        });
        setTotalPages(payload.pagination?.totalPages ?? 0);
      } else {
        setRatings([]);
        setSummary({ total: 0, average: 0 });
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, page, query]);

  useEffect(() => {
    void fetchRatings();
  }, [fetchRatings]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  };

  return (
    <>
      <div className="mb-5 min-w-0 md:mb-6">
        <LinkTo
          href={`/dashboard/${menuId}`}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
        >
          <IoArrowBackOutline className="text-sm rtl:rotate-180" aria-hidden />
          {t("backToOverview")}
        </LinkTo>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <PageTitleWithHelp>
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
                {t("title")}
              </h1>
            </PageTitleWithHelp>
            <p className="mt-0.5 text-sm text-slate-500 md:mt-1 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>

          <form
            onSubmit={submitSearch}
            className="flex w-full max-w-md items-center gap-2 lg:w-auto"
          >
            <div className="relative min-w-0 flex-1">
              <IoSearchOutline
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pe-3 ps-9 text-sm text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              {t("search")}
            </button>
          </form>
        </div>

        {!loading && summary.total > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t("totalLabel")}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
                {summary.total}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t("averageLabel")}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-2xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {summary.average.toFixed(1)}
                </p>
                <IoStar className="text-amber-400" aria-hidden />
              </div>
              <div className="mt-1">
                <RatingStars stars={summary.average} />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="min-w-0 pb-6">
        <RatingsCardGrid
          ratings={ratings}
          loading={loading}
          locale={locale}
          page={page}
          totalPages={totalPages}
          isSearch={Boolean(query)}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}
