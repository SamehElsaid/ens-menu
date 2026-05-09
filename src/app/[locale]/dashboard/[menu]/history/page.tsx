"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { axiosGet } from "@/shared/axiosCall";
import { decryptData } from "@/shared/encryption";
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

type OrderItemDetail = {
  name: string;
  quantity: number;
  price: number | null;
  total: number | null;
  notes: string | null;
};

type ActivityLogsPayload = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  entries: ActivityLogRow[];
};

const PAGE_SIZE = 25;

function dashboardSocketOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_URL ?? "").trim();
  if (!raw) {
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }
  try {
    const u = new URL(raw);
    const path = u.pathname.replace(/\/+$/, "");
    if (path === "/api" || path.endsWith("/api")) {
      u.pathname = "";
      return u.origin;
    }
    return u.origin;
  } catch {
    return raw.replace(/\/?api\/?$/i, "");
  }
}

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
  /** Bumps when Socket.IO reports new activity so we refetch even if already on page 1. */
  const [liveTick, setLiveTick] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<{
    row: ActivityLogRow;
    summary: string;
    when: string;
    detail: ParsedDetail | null;
    roleLabel: string;
  } | null>(null);

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
  }, [menuId, locale, page, debouncedSearch, liveTick]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const mid = parseInt(menuId, 10);
    if (!Number.isFinite(mid) || mid <= 0) return;

    const origin = dashboardSocketOrigin();
    if (!origin) return;

    const authToken = Cookies.get("sub") ?? "";
    let token: string | undefined;
    try {
      token = (decryptData(authToken) as { token?: string })?.token;
    } catch {
      return;
    }
    if (!token) return;

    const socket = io(origin, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    socket.emit(
      "dashboard:menu_subscribe",
      { token: `Bearer ${token}`, menuId: mid },
      () => {
        /* ack optional */
      },
    );

    socket.on("menu:activity_updated", (payload: { menuId?: number }) => {
      if (payload?.menuId !== mid) return;
      setPage(1);
      setLiveTick((n) => n + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [menuId]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEntry(null);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="relative overflow-hidden rounded-2xl border border-violet-200/60 bg-linear-to-br from-violet-50 via-fuchsia-50/80 to-white p-6 shadow-sm dark:border-violet-500/20 dark:from-violet-950/50 dark:via-fuchsia-950/30 dark:to-slate-900 md:p-8">
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
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
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
                detail?.type === "orderSnapshot"
                  ? String(detail.tableNumber ?? "?")
                  : row.actorName?.trim().charAt(0).toUpperCase() || "?";

              return (
                <ActivityRow
                  key={row.id}
                  row={row}
                  summary={summary}
                  when={when}
                  createdAt={row.createdAt}
                  actorName={row.actorName || "—"}
                  roleLabel={roleLabel}
                  detail={detail}
                  accent={accent}
                  initial={initial}
                  t={t}
                  onOpenDetails={(payload) => setSelectedEntry(payload)}
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
                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                className="inline-flex items-center gap-1 rounded-xl border border-violet-200/90 bg-white px-3 py-2 text-sm font-medium text-violet-800 shadow-sm transition-colors hover:bg-violet-50 disabled:pointer-events-none disabled:opacity-40 dark:border-violet-700/60 dark:bg-slate-800 dark:text-violet-200 dark:hover:bg-violet-950/50"
              >
                {t("next")}
                <IoChevronForward className="text-lg" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
      {selectedEntry ? (
        <OrderDetailsModal
          entry={selectedEntry}
          t={t}
          onClose={() => setSelectedEntry(null)}
        />
      ) : null}
    </div>
  );
}

type ParsedDetail =
  | { type: "menuFields"; fields: string[] }
  | { type: "orderStatus"; status: string }
  | { type: "itemsEdited" }
  | {
      type: "orderSnapshot";
      status: string;
      tableNumber: string | null;
      customerName: string | null;
      orderTotal: number | null;
      itemsCount: number;
      items: OrderItemDetail[];
    };

function normalizeOrderItems(raw: unknown): OrderItemDetail[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): OrderItemDetail | null => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const name = String(o.name ?? "").trim() || "—";
      const quantityRaw = Number(o.quantity);
      const quantity = Number.isFinite(quantityRaw) ? quantityRaw : 0;
      const priceRaw = Number(o.price);
      const totalRaw = Number(o.total);
      const notesRaw =
        o.notes != null && String(o.notes).trim() !== ""
          ? String(o.notes)
          : null;
      return {
        name,
        quantity,
        price: Number.isFinite(priceRaw) ? priceRaw : null,
        total: Number.isFinite(totalRaw) ? totalRaw : null,
        notes: notesRaw,
      };
    })
    .filter((x): x is OrderItemDetail => x != null);
}

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
    const orderRaw =
      o.order && typeof o.order === "object"
        ? (o.order as Record<string, unknown>)
        : null;
    if (orderRaw) {
      const itemsRaw = Array.isArray(orderRaw.items) ? orderRaw.items : [];
      const statusRaw =
        typeof o.status === "string"
          ? o.status
          : typeof orderRaw.status === "string"
            ? orderRaw.status
            : action;
      return {
        type: "orderSnapshot",
        status: String(statusRaw).toLowerCase(),
        tableNumber:
          orderRaw.tableNumber != null ? String(orderRaw.tableNumber) : null,
        customerName:
          orderRaw.customerName != null ? String(orderRaw.customerName) : null,
        orderTotal:
          orderRaw.orderTotal != null &&
          Number.isFinite(Number(orderRaw.orderTotal))
            ? Number(orderRaw.orderTotal)
            : null,
        itemsCount: itemsRaw.length,
        items: normalizeOrderItems(itemsRaw),
      };
    }
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
  row,
  summary,
  when,
  createdAt,
  actorName,
  roleLabel,
  detail,
  accent,
  initial,
  t,
  onOpenDetails,
}: {
  row: ActivityLogRow;
  summary: string;
  when: string;
  createdAt: string;
  actorName: string;
  roleLabel: string;
  detail: ParsedDetail | null;
  accent: Pick<RoleAccent, "avatar" | "badge">;
  initial: string;
  t: ActivityHistoryT;
  onOpenDetails: (payload: {
    row: ActivityLogRow;
    summary: string;
    when: string;
    detail: ParsedDetail | null;
    roleLabel: string;
  }) => void;
}) {
  const openDetails = () => {
    onOpenDetails({ row, summary, when, detail, roleLabel });
  };
  const orderMeta =
    detail?.type === "orderSnapshot"
      ? t("cardOrderMeta", {
          table: detail.tableNumber ?? "—",
          count: detail.itemsCount,
        })
      : null;

  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={openDetails}
        className={`flex h-full w-full flex-col gap-2 rounded-2xl border border-violet-200/80 bg-white p-3.5 text-start shadow-sm ring-1 ring-violet-500/5 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:border-violet-800/60 dark:bg-slate-800/90 dark:ring-violet-950/30 dark:hover:border-violet-600`}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-inner ${accent.avatar}`}
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {orderMeta}
              </span>
            </div>
            <time
              dateTime={createdAt}
              className="mt-1 inline-block rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-violet-800 dark:bg-violet-900/45 dark:text-violet-200"
            >
              {when}
            </time>
          </div>
        </div>
        <p className="line-clamp-2 text-xs leading-snug text-slate-600 dark:text-slate-300">
          {summary}
        </p>

        <span className="mt-auto pt-0.5 text-[10px] font-medium text-violet-600/90 dark:text-violet-400/90">
          {t("tapForDetails")}
        </span>
      </button>
    </li>
  );
}

function OrderDetailsModal({
  entry,
  onClose,
  t,
}: {
  entry: {
    row: ActivityLogRow;
    summary: string;
    when: string;
    detail: ParsedDetail | null;
    roleLabel: string;
  };
  onClose: () => void;
  t: ActivityHistoryT;
}) {
  const detail = entry.detail;
  const items =
    detail && detail.type === "orderSnapshot"
      ? detail.items
      : ([] as OrderItemDetail[]);

  console.log(entry.detail);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-violet-200/70 bg-white p-5 shadow-2xl dark:border-violet-600/40 dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t("detailsTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {entry.summary}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-violet-200 px-3 py-1.5 text-sm text-violet-800 hover:bg-violet-50 dark:border-violet-600 dark:text-violet-200 dark:hover:bg-violet-950/40"
          >
            {t("close")}
          </button>
        </div>

        <div className="space-y-2 rounded-xl bg-violet-50/70 p-3 text-sm dark:bg-violet-950/25">
          <p className="text-slate-700 dark:text-slate-200">
            <span className="font-semibold">{t("detailsWho")}:</span>{" "}
            {entry.row.actorName}
          </p>
          <p className="text-slate-700 dark:text-slate-200">
            <span className="font-semibold">{t("detailsWhen")}:</span>{" "}
            {entry.when}
          </p>
          {detail && detail.type === "orderSnapshot" ? (
            <>
              <p className="text-slate-700 dark:text-slate-200">
                <span className="font-semibold">{t("detailsTable")}:</span>{" "}
                {detail.tableNumber ?? "—"}
              </p>
              <p className="text-slate-700 dark:text-slate-200">
                <span className="font-semibold">{t("detailsCustomer")}:</span>{" "}
                {detail.customerName ?? "—"}
              </p>
              <p className="text-slate-700 dark:text-slate-200">
                <span className="font-semibold">{t("detailsStatus")}:</span>{" "}
                {t(`orderStatus.${detail.status}` as never)}
              </p>
              <p className="text-slate-700 dark:text-slate-200">
                <span className="font-semibold">{t("detailsTotal")}:</span>{" "}
                {detail.orderTotal != null ? detail.orderTotal : "—"}
              </p>
            </>
          ) : null}
        </div>

        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("itemsTitle")}
          </h4>
          {items.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("itemsEmpty")}
            </p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-auto pe-1">
              {items.map((it, idx) => (
                <div
                  key={`${it.name}-${idx}`}
                  className="rounded-xl border border-violet-200/70 bg-white p-3 dark:border-violet-700/60 dark:bg-slate-800"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {it.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {t("itemMetaLine", {
                      qty: it.quantity,
                      price: it.price != null ? String(it.price) : "—",
                      total: it.total != null ? String(it.total) : "—",
                    })}
                  </p>
                  {it.notes ? (
                    <p className="mt-1 text-xs text-violet-700 dark:text-violet-300">
                      {t("itemNotesLine", { notes: it.notes })}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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
        badge: "bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100",
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

function actorBadgeLabel(row: ActivityLogRow, t: ActivityHistoryT): string {
  const kind = normalizeRoleKey(row.actorRole);
  if (kind === "staff") {
    const jr = staffJobRoleFromRow(row);
    const slug = jr === "casher" ? "cashier" : jr;
    if (slug === "cashier") return t("staffJobRole.cashier");
    if (slug === "waiter") return t("staffJobRole.waiter");
  }
  return t(`role.${kind}`);
}
