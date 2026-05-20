"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import ViewTime from "@/shared/ViewTime";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { axiosGet } from "@/shared/axiosCall";
import { decryptData } from "@/shared/encryption";
import {
  IoTimeOutline,
  IoSearchOutline,
  IoEyeOutline,
  IoCloseOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoReceiptOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoEllipseSharp,
  IoListOutline,
} from "react-icons/io5";
import { NotificationPermissionCard } from "@/components/Global/NotificationPermissionCard";
import DataTable from "@/components/Custom/DataTable";
import { useAppSelector } from "@/store/hooks";

// ─── Types ────────────────────────────────────────────────────────────────────

type CallItem = {
  name: string;
  menuItemId: number;
  quantity: number;
  price: number;
  total: number;
};

/** Shape returned by the list endpoint */
type ActionDetail = {
  waiterName: string;
  time: string;
  status: string;
};

type CallEntry = {
  id: string;
  orderId: string;
  lastAction: string;
  actionDetails: ActionDetail[];
  customerName?: string | null;
  items: CallItem[];
  totalPrice: number;
};

/** Shape returned by the single-entry endpoint (GET /activity-logs/:id) */
type EntryAction = {
  action: string;
  status: string;
  waiterName: string;
  waiterRole: string;
  actorRole: string;
  actorStaffJobRole: string | null;
  time: string;
  summaryAr: string | null;
  summaryEn: string | null;
  detail: {
    status: string;
    order?: {
      tableNumber?: string;
      customerName?: string;
      items?: CallItem[];
      orderTotal?: number;
      status?: string;
    };
  } | null;
};

type EntryOrder = {
  tableNumber?: string;
  customerName?: string;
  items?: CallItem[];
  orderTotal?: number;
  status?: string;
};

type CallEntryDetail = {
  id: string;
  orderId: string;
  lastAction: string;
  actions: EntryAction[];
  order?: EntryOrder;
  items?: CallItem[];
  totalPrice?: number;
  updatedAt?: string;
};

type ActivityCallsPayload = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  entries: CallEntry[];
  calls: CallEntry[];
};

// ─── Socket helper ────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

/** Latest lifecycle status (not the first TABLE_CALL_CREATED row). */
function resolveLatestOrderStatus(
  actions?: Array<{ status?: string }>,
  order?: { status?: string } | null,
): string {
  const orderStatus = order?.status?.trim().toLowerCase();
  if (
    orderStatus === "confirmed" ||
    orderStatus === "cancelled" ||
    orderStatus === "pending"
  ) {
    return orderStatus;
  }
  if (!actions?.length) return "pending";
  for (let i = actions.length - 1; i >= 0; i -= 1) {
    const s = String(actions[i]?.status ?? "")
      .trim()
      .toLowerCase();
    if (s === "confirmed" || s === "cancelled") return s;
  }
  return String(actions[actions.length - 1]?.status ?? "pending")
    .trim()
    .toLowerCase();
}

export default function ActivityHistoryPage() {
  const t = useTranslations("activityHistory");
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [entries, setEntries] = useState<CallEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [liveTick, setLiveTick] = useState(0);

  // Modal state — entry data + loading state for deep-link fetches
  const [modalEntry, setModalEntry] = useState<CallEntryDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const isRTL = locale === "ar";
  const currency = useAppSelector((s) => s.menuData.menu?.currency ?? "");

  // ── URL param helpers ────────────────────────────────────────────────────
  const entryParam = searchParams.get("entry");

  const openModal = useCallback(
    (id: string) => {
      const sp = new URLSearchParams(Array.from(searchParams.entries()));
      sp.set("entry", id);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const closeModal = useCallback(() => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.delete("entry");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setModalEntry(null);
  }, [router, pathname, searchParams]);

  // ── debounce search ──────────────────────────────────────────────────────
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

  // ── fetch list ───────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      const paramsQ: Record<string, unknown> = { page, limit: PAGE_SIZE };
      if (debouncedSearch.length > 0) paramsQ.q = debouncedSearch;

      const result = await axiosGet<ActivityCallsPayload>(
        `/menus/${menuId}/activity-logs`,
        locale,
        undefined,
        paramsQ,
      );

      if (result.status && result.data) {
        const p = result.data;
        setEntries(p.entries ?? p.calls ?? []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId, locale, page, debouncedSearch, liveTick]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── fetch single entry by ID whenever ?entry param changes ─────────────
  useEffect(() => {
    if (!entryParam || !menuId) {
      setModalEntry(null);
      return;
    }

    let cancelled = false;
    setModalEntry(null);
    setModalLoading(true);

    axiosGet<{ entry: CallEntryDetail } | CallEntryDetail>(
      `/menus/${menuId}/activity-logs/${entryParam}`,
      locale,
    )
      .then((result) => {
        if (cancelled) return;
        if (result.status && result.data) {
          // Unwrap { entry: {...} } wrapper if present
          const raw = result.data as Record<string, unknown>;
          const resolved = (raw.entry ?? raw) as CallEntryDetail;
          setModalEntry(resolved);
        }
        setModalLoading(false);
      })
      .catch(() => {
        if (!cancelled) setModalLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entryParam, menuId, locale, liveTick]);

  // ── close on Esc ────────────────────────────────────────────────────────
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && entryParam) closeModal();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [entryParam, closeModal]);

  // ── socket for live updates ──────────────────────────────────────────────
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
      () => {},
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

  // ── column defs ──────────────────────────────────────────────────────────
  const columnDefs = useMemo<ColDef<CallEntry>[]>(
    () => [
      {
        headerName: t("colOrderId"),
        field: "orderId",
        width: 120,
        cellRenderer: (p: ICellRendererParams<CallEntry>) => (
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            #{p.data?.orderId}
          </span>
        ),
      },
      {
        headerName: t("colCustomer"),
        flex: 1,
        minWidth: 130,
        cellRenderer: (p: ICellRendererParams<CallEntry>) => (
          <span className="text-slate-700 dark:text-slate-200">
            {p.data?.customerName?.trim() || "—"}
          </span>
        ),
      },
      {
        headerName: t("colItems"),
        width: 90,
        sortable: false,
        cellRenderer: (p: ICellRendererParams<CallEntry>) => (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
            {p.data?.items?.length ?? 0}
          </span>
        ),
      },
      {
        headerName: t("colStatus"),
        width: 130,
        cellRenderer: (p: ICellRendererParams<CallEntry>) => {
          const status = resolveLatestOrderStatus(p.data?.actionDetails);
          const cls =
            status === "confirmed"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : status === "cancelled"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}
            >
              {t(`orderStatus.${status}` as never)}
            </span>
          );
        },
      },
      {
        headerName: t("colTotal"),
        field: "totalPrice",
        width: 130,
        cellRenderer: (p: ICellRendererParams<CallEntry>) => (
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {p.data?.totalPrice ?? 0}
            {currency && (
              <span className="ms-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                {currency}
              </span>
            )}
          </span>
        ),
      },
      {
        headerName: t("colTime"),
        flex: 1,
        minWidth: 160,
        cellRenderer: (p: ICellRendererParams<CallEntry>) => {
          const details = p.data?.actionDetails;
          const rawTime =
            details && details.length > 0
              ? details[details.length - 1]?.time
              : undefined;
          if (!rawTime) return <span className="text-slate-400">—</span>;
          return (
            <span className="text-slate-600 dark:text-slate-300 text-sm">
              <ViewTime data={rawTime} />
            </span>
          );
        },
      },
      {
        headerName: "",
        width: 120,
        pinned: !isRTL ? "right" : "left",
        sortable: false,
        cellRenderer: (p: ICellRendererParams<CallEntry>) => {
          const row = p.data;
          if (!row) return null;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal(row.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-xs font-medium transition-colors"
            >
              <IoEyeOutline className="text-base" />
              {t("view")}
            </button>
          );
        },
      },
    ],
    [t, openModal, currency],
  );

  const showModal =
    Boolean(entryParam) && (modalLoading || Boolean(modalEntry));

  return (
    <div className="space-y-6 animate-fadeIn">
      <NotificationPermissionCard />

      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl border border-violet-200/60 bg-linear-to-br from-violet-50 via-fuchsia-50/80 to-white p-6 shadow-sm dark:border-violet-500/20 dark:from-violet-950/50 dark:via-fuchsia-950/30 dark:to-slate-900 md:p-8">
        <div
          className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-linear-to-br from-violet-400/20 to-fuchsia-400/10 blur-2xl dark:from-violet-500/15 dark:to-fuchsia-500/10"
          aria-hidden
        />
        <div className="relative flex gap-4">
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

        <div className="relative mt-6">
          <label htmlFor="history-search" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <IoSearchOutline
            className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-violet-500 dark:text-violet-400 ${isRTL ? "end-3" : "start-3"}`}
            aria-hidden
          />
          <input
            id="history-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={`w-full rounded-xl border border-violet-200/90 bg-white/90 py-3 text-sm text-slate-900 shadow-inner shadow-violet-500/5 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/35 dark:border-violet-500/30 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/25 ${isRTL ? "pe-11 ps-4" : "ps-11 pe-4"}`}
            autoComplete="off"
          />
        </div>
      </header>

      {/* Table */}
      <DataTable<CallEntry>
        rowData={entries}
        columnDefs={columnDefs}
        loading={loading}
        locale={locale}
        showRowNumbers={true}
        pagination={true}
        paginationPageSize={PAGE_SIZE}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Detail modal */}
      {showModal && (
        <OrderDetailsModal
          entry={modalEntry}
          loading={modalLoading}
          t={t}
          currency={currency}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: string }) {
  if (status === "confirmed")
    return <IoCheckmarkCircle className="text-green-500 text-lg shrink-0" />;
  if (status === "cancelled")
    return <IoCloseCircle className="text-red-500 text-lg shrink-0" />;
  return <IoEllipseSharp className="text-amber-500 text-[10px] shrink-0" />;
}

function ModalSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-4 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-2/5 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="mt-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Actions Timeline ─────────────────────────────────────────────────────────

const ACTION_LABEL: Record<string, { en: string; ar: string }> = {
  TABLE_CALL_CREATED: { en: "Order Created", ar: "تم إنشاء الطلب" },
  TABLE_CALL_CONFIRMED: { en: "Order Confirmed", ar: "تم تأكيد الطلب" },
  TABLE_CALL_CANCELLED: { en: "Order Cancelled", ar: "تم إلغاء الطلب" },
  TABLE_CALL_ITEMS_UPDATED: { en: "Items Updated", ar: "تم تحديث الأصناف" },
};

function actionLabel(action: string, locale: string): string {
  const entry = ACTION_LABEL[action];
  if (!entry) return action;
  return locale === "ar" ? entry.ar : entry.en;
}

function isGuestOrderAction(act: EntryAction): boolean {
  return (
    act.action === "TABLE_CALL_CREATED" ||
    String(act.actorRole ?? "").toLowerCase() === "guest"
  );
}

function actionActorName(
  act: EntryAction,
  order?: EntryOrder | null,
): string {
  if (isGuestOrderAction(act)) {
    const fromOrder =
      order?.customerName ??
      act.detail?.order?.customerName ??
      null;
    if (fromOrder != null && String(fromOrder).trim() !== "") {
      return String(fromOrder).trim();
    }
  }
  return act.waiterName?.trim() ?? "";
}

function lastStaffWaiterName(actions: EntryAction[]): string | null {
  for (let i = actions.length - 1; i >= 0; i -= 1) {
    const act = actions[i];
    if (isGuestOrderAction(act)) continue;
    const name = act.waiterName?.trim();
    if (name) return name;
  }
  return null;
}

function ActionDot({ status }: { status: string }) {
  const lc = status.toLowerCase();
  if (lc === "confirmed")
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 ring-4 ring-white dark:ring-slate-900">
        <IoCheckmarkCircle className="text-green-500 text-lg" />
      </span>
    );
  if (lc === "cancelled")
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 ring-4 ring-white dark:ring-slate-900">
        <IoCloseCircle className="text-red-500 text-lg" />
      </span>
    );
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 ring-4 ring-white dark:ring-slate-900">
      <IoTimeOutline className="text-amber-500 text-base" />
    </span>
  );
}

function ActionsTimeline({
  actions,
  locale,
  t,
  order,
}: {
  actions: EntryAction[];
  locale: string;
  t: ReturnType<typeof useTranslations<"activityHistory">>;
  order?: EntryOrder | null;
}) {
  return (
    <ol className="relative space-y-0">
      {actions.map((act, idx) => {
        const isLast = idx === actions.length - 1;
        const actorName = actionActorName(act, order);
        const actorLabel = isGuestOrderAction(act)
          ? t("detailsCustomer")
          : t("colWaiter");
        const summary =
          locale === "ar"
            ? (act.summaryAr ?? act.summaryEn ?? null)
            : (act.summaryEn ?? act.summaryAr ?? null);
        const lc = act.status.toLowerCase();
        const pillCls =
          lc === "confirmed"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : lc === "cancelled"
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";

        return (
          <li key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <ActionDot status={act.status} />
              {!isLast && (
                <div className="mt-1 flex-1 w-px min-h-6 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>

            <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {actionLabel(act.action, locale)}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${pillCls}`}
                >
                  {t(`orderStatus.${lc}` as never)}
                </span>
              </div>

              {actorName && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <IoPersonOutline className="shrink-0" />
                  <span className="text-slate-400 dark:text-slate-500">
                    {actorLabel}:
                  </span>
                  {actorName}
                </p>
              )}

              <time className="mt-1 block text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                {act.time ? <ViewTime data={act.time} /> : "—"}
              </time>

              {summary && (
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
                  {summary}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetailsModal({
  entry,
  loading,
  t,
  currency,
  onClose,
}: {
  entry: CallEntryDetail | null;
  loading: boolean;
  t: ReturnType<typeof useTranslations<"activityHistory">>;
  currency: string;
  onClose: () => void;
}) {
  const locale = useLocale();

  const actions = entry?.actions ?? [];
  const lastAction =
    actions.length > 0 ? actions[actions.length - 1] : undefined;

  // Prefer root-level order, fall back to detail.order from latest action
  const order =
    entry?.order ?? lastAction?.detail?.order ?? actions[0]?.detail?.order;

  // Items: root items → order.items
  const items: CallItem[] = entry?.items ?? order?.items ?? [];

  // Totals
  const totalPrice = entry?.totalPrice ?? order?.orderTotal ?? 0;

  const status = resolveLatestOrderStatus(actions, order);

  // Summary from the most recent action
  const summary =
    locale === "ar"
      ? (lastAction?.summaryAr ??
        lastAction?.summaryEn ??
        actions[0]?.summaryAr ??
        null)
      : (lastAction?.summaryEn ??
        lastAction?.summaryAr ??
        actions[0]?.summaryEn ??
        null);

  const customerDisplay =
    order?.customerName?.trim() ||
    (lastAction && isGuestOrderAction(lastAction)
      ? actionActorName(lastAction, order)
      : actions[0] && isGuestOrderAction(actions[0])
        ? actionActorName(actions[0], order)
        : "") ||
    null;
  const waiterDisplay = entry?.actions
    ? lastStaffWaiterName(entry.actions)
    : null;

  const statusConfig = {
    confirmed: {
      pill: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 ring-1 ring-green-300/50",
      header:
        "from-green-500/10 to-emerald-500/5 dark:from-green-900/30 dark:to-emerald-900/10",
      border: "border-green-200/60 dark:border-green-700/40",
    },
    cancelled: {
      pill: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-300/50",
      header:
        "from-red-500/10 to-rose-500/5 dark:from-red-900/30 dark:to-rose-900/10",
      border: "border-red-200/60 dark:border-red-700/40",
    },
    pending: {
      pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-300/50",
      header:
        "from-violet-500/10 to-fuchsia-500/5 dark:from-violet-900/30 dark:to-fuchsia-900/10",
      border: "border-violet-200/60 dark:border-violet-700/40",
    },
  };
  const cfg =
    statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Gradient header ── */}
        <div
          className={`relative bg-linear-to-br ${cfg.header} px-5 pt-5 pb-4 border-b ${cfg.border}`}
        >
          {/* Drag handle (mobile) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600 sm:hidden" />

          <div className="flex items-start justify-between gap-3 mt-3 sm:mt-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                <IoReceiptOutline className="text-2xl text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {t("detailsTitle")}
                </h3>
                {entry && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t("colOrderId")}&nbsp;
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      #{entry.orderId}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {entry && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.pill}`}
                >
                  <StatusIcon status={status} />
                  {t(`orderStatus.${status}` as never)}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <IoCloseOutline className="text-lg" />
              </button>
            </div>
          </div>

          {/* Summary line */}
          {summary && (
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/50 pt-2">
              {summary}
            </p>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <ModalSkeleton />
          ) : entry ? (
            <>
              {/* Meta cards */}
              <div className="px-5 py-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-b border-slate-100 dark:border-slate-800">
                {customerDisplay && (
                  <MetaCard
                    icon={<IoPersonOutline className="text-fuchsia-500" />}
                    label={t("detailsCustomer")}
                    value={customerDisplay}
                  />
                )}
                {waiterDisplay && (
                  <MetaCard
                    icon={<IoPersonOutline className="text-violet-500" />}
                    label={t("colWaiter")}
                    value={waiterDisplay}
                  />
                )}
                <MetaCard
                  icon={<IoCalendarOutline className="text-violet-500" />}
                  label={t("detailsWhen")}
                  value={<ViewTime data={lastAction?.time ?? actions[0]?.time} />}
                />
                {order?.tableNumber && (
                  <MetaCard
                    icon={<IoReceiptOutline className="text-violet-500" />}
                    label={t("detailsTable")}
                    value={order.tableNumber}
                  />
                )}
              </div>

              {/* Items */}
              <div className="px-5 py-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
                    {items.length}
                  </span>
                  {t("itemsTitle")}
                </h4>

                {items.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                    {t("itemsEmpty")}
                  </p>
                ) : (
                  <>
                    {/* Table head */}
                    <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-2 rounded-t-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <span>{t("colItemName")}</span>
                      <span className="text-center">{t("colQty")}</span>
                      <span className="text-end">{t("colTotal")}</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border-x border-b border-slate-200 dark:border-slate-700 rounded-b-xl overflow-hidden">
                      {items.map((item, idx) => (
                        <div
                          key={`${item.menuItemId}-${idx}`}
                          className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-3 text-sm items-center odd:bg-white even:bg-slate-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-800/40 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                              {item.name}
                            </p>
                            {item.price != null && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {item.price}
                                {currency && (
                                  <span className="ms-0.5">{currency}</span>
                                )}{" "}
                                × {item.quantity}
                              </p>
                            )}
                          </div>
                          <span className="text-center min-w-8 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            ×{item.quantity}
                          </span>
                          <span className="text-end font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                            {item.total}
                            {currency && (
                              <span className="ms-1 text-xs font-normal text-slate-500 dark:text-slate-400">
                                {currency}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Grand total */}
                    <div className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl bg-linear-to-r from-violet-50 to-fuchsia-50/60 dark:from-violet-950/40 dark:to-fuchsia-950/20 border border-violet-200/60 dark:border-violet-700/40">
                      <span className="text-sm font-semibold text-violet-800 dark:text-violet-300">
                        {t("detailsTotal")}
                      </span>
                      <span className="text-lg font-bold text-violet-900 dark:text-violet-200 tabular-nums">
                        {totalPrice}
                        {currency && (
                          <span className="ms-1.5 text-sm font-semibold text-violet-700 dark:text-violet-400">
                            {currency}
                          </span>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions timeline */}
              {entry.actions && entry.actions.length > 0 && (
                <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <IoListOutline className="text-violet-500 text-base" />
                    {t("actionsTitle")}
                  </h4>
                  <ActionsTimeline
                    actions={entry.actions}
                    locale={locale}
                    t={t}
                    order={order}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/80 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
  valueClass = "text-slate-800 dark:text-slate-100",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-3">
      <span className="mt-0.5 text-xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <div className={`text-sm font-semibold mt-0.5 truncate ${valueClass}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
