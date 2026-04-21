"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { axiosGet } from "@/shared/axiosCall";
import {
  IoChevronBack,
  IoChevronForward,
  IoSearchOutline,
  IoTimeOutline,
} from "react-icons/io5";

type ActivityLogRow = {
  id: number;
  menuId: number;
  actorRole: string;
  actorName: string;
  actorStaffJobRole?: string | null;
  action: string;
  targetType: string | null;
  targetId: number | null;
  summaryAr: string | null;
  summaryEn: string | null;
  detailJson: string | null;
  createdAt: string;
};

type ActivityLogsPayload = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  entries: ActivityLogRow[];
};

const PAGE_SIZE = 25;

type RoleAccent = {
  bar: string;
  badge: string;
  avatar: string;
  detailRing: string;
  rowBg: string;
};

type ActivityHistoryT = {
  (key: string): string;
  (key: string, values: Record<string, string | number>): string;
  has: (key: string) => boolean;
};

export default function ActivityHistoryPage() {
  const t = useTranslations("activityHistory");
  const locale = useLocale();
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [entries, setEntries] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const dfLocale = locale === "ar" ? ar : enUS;
  const isRTL = locale === "ar";

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
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

  const fetchLogs = useCallback(async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      const paramsQ: Record<string, unknown> = {
        page,
        limit: PAGE_SIZE,
      };
      if (debouncedSearch.length > 0) {
        paramsQ.q = debouncedSearch;
      }
      const result = await axiosGet<ActivityLogsPayload>(
        `/menus/${menuId}/activity-logs`,
        locale,
        undefined,
        paramsQ,
      );
      if (result.status && result.data && "entries" in result.data) {
        const p = result.data;
        setEntries(p.entries ?? []);
        setTotalPages(Math.max(1, p.totalPages ?? 1));
        setTotal(p.total ?? 0);
      } else {
        setEntries([]);
        setTotalPages(1);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, page, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <header
        className="relative overflow-hidden rounded-2xl border border-violet-200/60 bg-linear-to-br from-violet-50 via-fuchsia-50/80 to-white p-6 shadow-sm dark:border-violet-500/20 dark:from-violet-950/50 dark:via-fuchsia-950/30 dark:to-slate-900 md:p-8"
      >
        <div
          className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-linear-to-br from-violet-400/20 to-fuchsia-400/10 blur-2xl dark:from-violet-500/15 dark:to-fuchsia-500/10"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25">
              <IoTimeOutline className="text-2xl" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                {t("title")}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-6">
          <label htmlFor="activity-history-search" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <IoSearchOutline
            className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-violet-500 dark:text-violet-400 ${isRTL ? "end-3" : "start-3"}`}
            aria-hidden
          />
          <input
            id="activity-history-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={`w-full rounded-xl border border-violet-200/90 bg-white/90 py-3 text-sm text-slate-900 shadow-inner shadow-violet-500/5 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/35 dark:border-violet-500/30 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/25 ${isRTL ? "pe-11 ps-4" : "ps-11 pe-4"}`}
            autoComplete="off"
          />
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-violet-100/90 bg-white shadow-md shadow-violet-500/5 dark:border-violet-500/15 dark:bg-slate-800 dark:shadow-violet-950/40">
        {loading ? (
          <div className="p-12 text-center text-violet-600/80 dark:text-violet-300/80">
            {t("loading")}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            {debouncedSearch ? t("noSearchResults") : t("empty")}
          </div>
        ) : (
          <ul className="divide-y divide-violet-100/80 dark:divide-violet-900/40">
            {entries.map((row) => {
              const summary =
                locale === "ar"
                  ? (row.summaryAr ?? row.summaryEn ?? "—")
                  : (row.summaryEn ?? row.summaryAr ?? "—");
              const when = row.createdAt
                ? format(new Date(row.createdAt), "PPp", { locale: dfLocale })
                : "—";
              const roleLabel = actorBadgeLabel(row, t);
              const detail = parseActivityDetail(row.detailJson, row.action);
              const accent = getRoleAccent(row);
              const initial =
                row.actorName?.trim().charAt(0).toUpperCase() || "?";

              return (
                <ActivityRow
                  key={row.id}
                  summary={summary}
                  when={when}
                  createdAt={row.createdAt}
                  actorName={row.actorName || "—"}
                  roleLabel={roleLabel}
                  detail={detail}
                  accent={accent}
                  initial={initial}
                  t={t}
                />
              );
            })}
          </ul>
        )}

        {!loading && entries.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-violet-100/90 bg-linear-to-r from-violet-50/50 to-fuchsia-50/30 px-4 py-4 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-slate-900/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("pageInfo", {
                page,
                totalPages,
                total,
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-violet-200/90 bg-white px-3 py-2 text-sm font-medium text-violet-800 shadow-sm transition-colors hover:bg-violet-50 disabled:pointer-events-none disabled:opacity-40 dark:border-violet-700/60 dark:bg-slate-800 dark:text-violet-200 dark:hover:bg-violet-950/50"
              >
                <IoChevronBack className="text-lg" />
                {t("prev")}
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((p) => (p < totalPages ? p + 1 : p))
                }
                className="inline-flex items-center gap-1 rounded-xl border border-violet-200/90 bg-white px-3 py-2 text-sm font-medium text-violet-800 shadow-sm transition-colors hover:bg-violet-50 disabled:pointer-events-none disabled:opacity-40 dark:border-violet-700/60 dark:bg-slate-800 dark:text-violet-200 dark:hover:bg-violet-950/50"
              >
                {t("next")}
                <IoChevronForward className="text-lg" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ParsedDetail =
  | { type: "menuFields"; fields: string[] }
  | { type: "orderStatus"; status: string }
  | { type: "itemsEdited" };

function parseActivityDetail(
  detailJson: string | null,
  action: string,
): ParsedDetail | null {
  if (!detailJson) {
    if (action === "TABLE_CALL_ITEMS_UPDATED") {
      return { type: "itemsEdited" };
    }
    return null;
  }
  try {
    const o = JSON.parse(detailJson) as Record<string, unknown>;
    if (
      Array.isArray(o.fields) &&
      o.fields.length > 0 &&
      o.fields.every((x) => typeof x === "string")
    ) {
      return { type: "menuFields", fields: o.fields as string[] };
    }
    const st = o.status;
    if (
      typeof st === "string" &&
      ["pending", "confirmed", "cancelled"].includes(st.toLowerCase())
    ) {
      return { type: "orderStatus", status: st.toLowerCase() };
    }
  } catch {
    return null;
  }
  if (action === "TABLE_CALL_ITEMS_UPDATED") {
    return { type: "itemsEdited" };
  }
  return null;
}

function ActivityRow({
  summary,
  when,
  createdAt,
  actorName,
  roleLabel,
  detail,
  accent,
  initial,
  t,
}: {
  summary: string;
  when: string;
  createdAt: string;
  actorName: string;
  roleLabel: string;
  detail: ParsedDetail | null;
  accent: RoleAccent;
  initial: string;
  t: ActivityHistoryT;
}) {
  return (
    <li
      className={`border-l-4 ${accent.bar} ${accent.rowBg} px-4 py-4 transition-colors hover:brightness-[1.02] dark:hover:brightness-110 sm:px-6`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-inner ${accent.avatar}`}
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {actorName}
              </span>
              <span
                className={`text-xs font-medium ${accent.badge} rounded-full px-2.5 py-0.5`}
              >
                {roleLabel}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {summary}
            </p>
            {detail ? (
              <div
                className={`rounded-xl border ${accent.detailRing} bg-white/90 px-3 py-2.5 dark:bg-slate-900/50`}
              >
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-violet-600/90 dark:text-violet-300/90">
                  {t("changedLabel")}
                </p>
                {detail.type === "menuFields" ? (
                  <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                    {detail.fields.map((fieldKey) => {
                      const path = `fields.${fieldKey}`;
                      const label = t.has(path) ? t(path) : fieldKey;
                      return (
                        <li key={fieldKey}>
                          <span className="inline-block rounded-lg border border-violet-200/80 bg-violet-50/90 px-2.5 py-1 text-xs text-violet-900 dark:border-violet-700/50 dark:bg-violet-950/40 dark:text-violet-100">
                            {label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : detail.type === "orderStatus" ? (
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {t("orderStatusLine", {
                      status: t(`orderStatus.${detail.status}` as never),
                    })}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {t("changeTypes.itemsEdited")}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <time
          dateTime={createdAt}
          className="shrink-0 text-xs tabular-nums text-violet-600/70 dark:text-violet-300/70 sm:text-end"
        >
          {when}
        </time>
      </div>
    </li>
  );
}

function normalizeRoleKey(role: string): string {
  const r = String(role || "")
    .trim()
    .toLowerCase();
  if (r === "staff") return "staff";
  if (r === "admin") return "admin";
  if (r === "user") return "owner";
  return "other";
}

function staffJobRoleFromRow(row: ActivityLogRow): string | null {
  const direct = row.actorStaffJobRole;
  if (direct != null && String(direct).trim() !== "") {
    return String(direct).trim().toLowerCase();
  }
  try {
    if (!row.detailJson) return null;
    const o = JSON.parse(row.detailJson) as { actorStaffJobRole?: string };
    const j = o.actorStaffJobRole;
    if (j != null && String(j).trim() !== "") {
      return String(j).trim().toLowerCase();
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getRoleAccent(row: ActivityLogRow): RoleAccent {
  const baseRow =
    "bg-linear-to-r from-white to-violet-50/30 dark:from-slate-800 dark:to-violet-950/25";
  const kind = normalizeRoleKey(row.actorRole);
  if (kind === "staff") {
    const jr = staffJobRoleFromRow(row);
    const slug = jr === "casher" ? "cashier" : jr;
    if (slug === "cashier") {
      return {
        bar: "border-l-sky-500",
        badge:
          "bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100",
        avatar:
          "bg-linear-to-br from-sky-400 to-cyan-500 text-white shadow-sky-500/20",
        detailRing: "border-sky-200/90 dark:border-sky-700/50",
        rowBg: baseRow,
      };
    }
    if (slug === "waiter") {
      return {
        bar: "border-l-teal-500",
        badge:
          "bg-teal-100 text-teal-900 dark:bg-teal-900/50 dark:text-teal-100",
        avatar:
          "bg-linear-to-br from-teal-400 to-emerald-500 text-white shadow-teal-500/20",
        detailRing: "border-teal-200/90 dark:border-teal-700/50",
        rowBg: baseRow,
      };
    }
    return {
      bar: "border-l-slate-400",
      badge:
        "bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100",
      avatar:
        "bg-linear-to-br from-slate-400 to-slate-600 text-white shadow-slate-500/20",
      detailRing: "border-slate-200 dark:border-slate-600",
      rowBg: baseRow,
    };
  }
  if (kind === "owner") {
    return {
      bar: "border-l-emerald-500",
      badge:
        "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
      avatar:
        "bg-linear-to-br from-emerald-400 to-green-600 text-white shadow-emerald-500/20",
      detailRing: "border-emerald-200/90 dark:border-emerald-700/50",
      rowBg: baseRow,
    };
  }
  if (kind === "admin") {
    return {
      bar: "border-l-amber-500",
      badge:
        "bg-amber-100 text-amber-950 dark:bg-amber-900/45 dark:text-amber-100",
      avatar:
        "bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/20",
      detailRing: "border-amber-200/90 dark:border-amber-700/50",
      rowBg: baseRow,
    };
  }
  return {
    bar: "border-l-violet-500",
    badge:
      "bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100",
    avatar:
      "bg-linear-to-br from-violet-500 to-fuchsia-600 text-white shadow-violet-500/25",
    detailRing: "border-violet-200/90 dark:border-violet-700/50",
    rowBg: baseRow,
  };
}

function actorBadgeLabel(
  row: ActivityLogRow,
  t: ActivityHistoryT,
): string {
  const kind = normalizeRoleKey(row.actorRole);
  if (kind === "staff") {
    const jr = staffJobRoleFromRow(row);
    const slug = jr === "casher" ? "cashier" : jr;
    if (slug === "cashier") return t("staffJobRole.cashier");
    if (slug === "waiter") return t("staffJobRole.waiter");
  }
  return t(`role.${kind}`);
}
