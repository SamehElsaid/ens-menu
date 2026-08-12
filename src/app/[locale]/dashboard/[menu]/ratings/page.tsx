"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IoRefreshOutline } from "react-icons/io5";
import { axiosGet } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import {
  Badge,
  Button,
  PageShell,
  SearchInput,
  StatCard,
  StatGrid,
  Toolbar,
} from "@/components/ui";
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

  const runSearch = (value: string) => {
    setSearchInput(value);
    setPage(1);
    setQuery(value.trim());
  };

  const hasActiveFilter = Boolean(query);

  return (
    <PageShell
      kind="detail"
      header={
        <>
          <PageTitleWithHelp
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={[
              { label: t("backToOverview"), href: `/dashboard/${menuId}` },
              { label: t("title") },
            ]}
            breadcrumbsLabel={t("title")}
            meta={
              !loading && summary.total > 0 ? (
                <Badge tone="accent" size="md">
                  <span lang="en">{summary.average.toFixed(1)}</span> ★
                </Badge>
              ) : null
            }
            actions={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void fetchRatings()}
                startIcon={<IoRefreshOutline aria-hidden />}
              >
                {t("refresh")}
              </Button>
            }
          />

          {/* The score summary leads: an owner opens this page to find out
              whether the average moved, and only then reads individual reviews.

              It holds its place while loading rather than appearing once the
              request lands — a strip that materialises above the list shoves
              the toolbar and the first review down under a reader who has
              already started reading. It only disappears for a menu with no
              reviews at all, where two zeroes would be noise above an empty
              state. */}
          {loading || summary.total > 0 ? (
            <StatGrid columns={2} ruled className="sm:max-w-md">
              <StatCard
                label={t("totalLabel")}
                loading={loading}
                value={
                  <span lang="en">{summary.total.toLocaleString("en-US")}</span>
                }
              />
              <StatCard
                label={t("averageLabel")}
                loading={loading}
                value={<span lang="en">{summary.average.toFixed(1)}</span>}
                hint={
                  loading ? null : (
                    <RatingStars stars={summary.average} precise />
                  )
                }
              />
            </StatGrid>
          ) : null}
        </>
      }
      toolbar={
        <Toolbar
          search={
            <SearchInput
              value={searchInput}
              onChange={runSearch}
              label={t("search")}
              placeholder={t("searchPlaceholder")}
            />
          }
          actions={
            hasActiveFilter ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => runSearch("")}
              >
                {t("clearFilter")}
              </Button>
            ) : null
          }
        />
      }
    >
      <RatingsCardGrid
        ratings={ratings}
        loading={loading}
        locale={locale}
        page={page}
        totalPages={totalPages}
        isSearch={Boolean(query)}
        onPageChange={setPage}
      />
    </PageShell>
  );
}
