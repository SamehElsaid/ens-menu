"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { IoTimeOutline } from "react-icons/io5";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { useMenuActivityLog } from "@/hooks/useMenuActivityLog";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import {
  EmptyState,
  NoResultsState,
  PageShell,
  Pagination,
  SearchInput,
  Skeleton,
  SkeletonRegion,
  Toolbar,
} from "@/components/ui";
import AuditActivityTimeline from "./AuditActivityTimeline";

const PAGE_SIZE = 20;

export default function AuditActivityView() {
  const t = useTranslations("menuActivityLog");
  const tCommon = useTranslations("common");
  const params = useParams();

  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
    /* A timeline reads as a column, not a full-bleed grid, so this is a detail
       measure with the search pinned above it — filtering an audit log 300
       entries deep should not mean scrolling back to the top. */
    <PageShell
      kind="detail"
      header={
        <PageTitleWithHelp
          id="onboarding-history-header"
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={[
            {
              label: t("breadcrumbs.dashboard"),
              href: menuId ? `/dashboard/${menuId}` : "/dashboard",
            },
            { label: t("title") },
          ]}
          breadcrumbsLabel={t("title")}
        />
      }
      toolbar={
        <Toolbar
          search={
            <div id="onboarding-history-search" className="w-full sm:max-w-xs">
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder={t("searchPlaceholder")}
                label={t("searchPlaceholder")}
                debounceMs={0}
              />
            </div>
          }
        />
      }
      footer={
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={loading}
          labels={{
            region: tCommon("pagination"),
            previous: t("prev"),
            next: t("next"),
            page: (n) => tCommon("goToPage", { page: n }),
          }}
          summary={t("pageInfo", { page, totalPages })}
        />
      }
    >
      <div id="onboarding-history-table">
        {loading ? (
          <SkeletonRegion
            label={t("title")}
            className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="grid gap-x-4 gap-y-1.5 px-3 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:px-4"
              >
                <Skeleton className="h-3 w-20" rounded="sm" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-2/3" rounded="sm" />
                  <Skeleton className="h-3 w-1/3" rounded="sm" />
                </div>
              </div>
            ))}
          </SkeletonRegion>
        ) : entries.length === 0 ? (
          debouncedSearch ? (
            <NoResultsState
              title={t("noSearchResults")}
              onClear={() => setSearchInput("")}
              clearLabel={tCommon("clearSearch")}
            />
          ) : (
            <EmptyState
              icon={<IoTimeOutline />}
              title={t("empty")}
              description={t("emptyHint")}
            />
          )
        ) : (
          <AuditActivityTimeline entries={entries} />
        )}
      </div>
    </PageShell>
  );
}
