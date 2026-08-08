"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  IoArrowBackOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoStar,
  IoStatsChartOutline,
} from "react-icons/io5";
import { axiosGet } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import LinkTo from "@/components/Global/LinkTo";
import { Button } from "@/components/ui";
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

  const clearFilter = () => {
    setSearchInput("");
    setQuery("");
    setPage(1);
  };

  const hasActiveFilter = Boolean(query || searchInput.trim());

  return (
    <>
      <div className="mb-5 min-w-0 md:mb-6">
        <LinkTo
          href={`/dashboard/${menuId}`}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-fg-subtle transition-colors hover:text-primary dark:hover:text-primary"
        >
          <IoArrowBackOutline className="text-sm rtl:rotate-180" aria-hidden />
          {t("backToOverview")}
        </LinkTo>

        <PageTitleWithHelp title={t("title")} description={t("subtitle")} />
      </div>

      <div className="mb-5 rounded-lg border border-line/90 bg-white p-4 shadow-sm md:mb-6 md:p-5">
        <form
          onSubmit={submitSearch}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div
            className="min-w-0 flex-1 sm:min-w-[220px]"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <label className="mb-2 block text-sm font-semibold text-fg-muted">
              {t("search")}
            </label>
            <div className="relative">
              <IoSearchOutline
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-lg text-fg-subtle"
                aria-hidden
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-11 w-full rounded-lg border border-line bg-slate-50 pe-3 ps-10 text-sm text-fg outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:focus:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              type="submit"
              fullWidth
              className="sm:w-auto"
              startIcon={<IoSearchOutline className="size-4" />}
            >
              {t("search")}
            </Button>
            {hasActiveFilter ? (
              <Button
                type="button"
                variant="secondary"
                onClick={clearFilter}
                fullWidth
                className="sm:w-auto"
                startIcon={<IoRefreshOutline className="size-4" />}
              >
                {t("clearFilter")}
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      {!loading && summary.total > 0 ? (
        <section className="mb-5 rounded-lg border border-line bg-white p-4 shadow-sm md:mb-6 md:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg md:text-base">
            <IoStatsChartOutline className="text-amber-500" aria-hidden />
            {t("metricsTitle")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:max-w-lg">
            <div className="rounded-lg border border-sky-200/80 bg-sky-50/90 px-4 py-3 dark:border-sky-800/50 dark:bg-sky-950/30">
              <p className="text-[10px] font-medium text-fg-subtle md:text-xs dark:text-fg-subtle">
                {t("totalLabel")}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-fg">
                {summary.total}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30">
              <p className="text-[10px] font-medium text-fg-subtle md:text-xs dark:text-fg-subtle">
                {t("averageLabel")}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-2xl font-bold tabular-nums text-fg">
                  {summary.average.toFixed(1)}
                </p>
                <IoStar className="text-amber-400" aria-hidden />
              </div>
              <div className="mt-1.5">
                <RatingStars stars={summary.average} precise />
              </div>
            </div>
          </div>
        </section>
      ) : null}

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
