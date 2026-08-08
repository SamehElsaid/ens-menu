"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IoTimeOutline } from "react-icons/io5";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { useMenuActivityLog } from "@/hooks/useMenuActivityLog";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import {
  EmptyState,
  NoResultsState,
  Pagination,
  SearchInput,
  Skeleton,
} from "@/components/ui";
import AuditActivityTimeline from "./AuditActivityTimeline";

const PAGE_SIZE = 20;

export default function AuditActivityView() {
  const t = useTranslations("menuActivityLog");
  const tCommon = useTranslations("common");
  const locale = useLocale();
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
    <div className="space-y-6">
      <PageTitleWithHelp
        id="onboarding-history-header"
        title={t("title")}
        description={t("subtitle")}
      />

      <div id="onboarding-history-search" className="max-w-md">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t("searchPlaceholder")}
          label={t("searchPlaceholder")}
          debounceMs={0}
        />
      </div>

      <div id="onboarding-history-table">
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-live="polite">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
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

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          disabled={loading}
          className="mt-6"
          labels={{
            region: tCommon("pagination"),
            previous: t("prev"),
            next: t("next"),
            page: (n) => tCommon("goToPage", { page: n }),
          }}
          summary={t("pageInfo", { page, totalPages })}
        />
      </div>
    </div>
  );
}
