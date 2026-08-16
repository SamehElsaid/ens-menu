"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoGlobeOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  EmptyState,
  Field,
  LoadingBlock,
  Modal,
  NoResultsState,
  PageHeader,
  PageShell,
  Pagination,
  SearchInput,
  Select,
  StatCard,
  StatGrid,
  Textarea,
  Toolbar,
  type DataColumn,
  type StatusTone,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";
import { cn } from "@/lib/cn";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import type { AdminDomainTransferRequest } from "@/types/DomainTransfer";
import { toast } from "react-toastify";
import { resolveApiErrorMessage } from "@/api/apiError";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import { formatMediumDateTime } from "@/lib/formatDateTime";

const PAGE_SIZE = 20;

type TransferStatus = AdminDomainTransferRequest["status"];

const STATUS_TONE: Record<TransferStatus, StatusTone> = {
  pending: "neutral",
  awaiting_user: "warning",
  user_confirmed: "info",
  completed: "success",
  cancelled: "danger",
};

const STATUSES: TransferStatus[] = [
  "pending",
  "awaiting_user",
  "user_confirmed",
  "completed",
  "cancelled",
];

/** The four states a request can still be moved out of, in queue order. */
const SUMMARY_STATUSES: TransferStatus[] = [
  "pending",
  "awaiting_user",
  "user_confirmed",
  "completed",
];

export default function AdminDomainTransfersPage() {
  const locale = useLocale();
  const t = useTranslations("adminDomainTransfers");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const tableLabels = useDataTableLabels();

  const [requests, setRequests] = useState<AdminDomainTransferRequest[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransferStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminDomainTransferRequest | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const requestTransfers = useCallback(
    () =>
      axiosGet<{ requests: AdminDomainTransferRequest[] }>(
        "/admin/domain-transfers",
        locale,
      ),
    [locale],
  );
  const transfersQuery = useApiQuery({
    request: requestTransfers,
    onSuccess: (data) => setRequests(data.requests),
  });
  const loading = transfersQuery.loading;
  const loadRequests = transfersQuery.refetch;

  const requestTransferDetail = useCallback(
    (requestId: number) =>
      axiosGet<{ request: AdminDomainTransferRequest }>(
        `/admin/domain-transfers/${requestId}`,
        locale,
      ),
    [locale],
  );
  const detailQuery = useApiMutation({
    request: requestTransferDetail,
    errorToast: t("loadDetailError"),
    onSuccess: (data) => {
      if (!data) return;
      setSelected(data.request);
      setMessage("");
      setShowCancelConfirm(false);
    },
  });
  const detailLoading = detailQuery.loading;

  const openDetail = useCallback(
    async (requestId: number) => {
      await detailQuery.mutate(requestId);
    },
    [detailQuery],
  );

  const handleSendMessage = async () => {
    if (!selected || !message.trim()) return;

    setSending(true);
    const result = await axiosPost<
      { message: string },
      { request: AdminDomainTransferRequest }
    >(`/admin/domain-transfers/${selected.id}/message`, locale, {
      message: message.trim(),
    });
    setSending(false);

    if (result.status && result.data?.request) {
      setSelected(result.data.request);
      setMessage("");
      void loadRequests();
      toast.success(t("messageSent"));
    } else {
      toast.error(
        resolveApiErrorMessage(result.data, locale, t("messageError")),
      );
    }
  };

  const handleComplete = async () => {
    if (!selected) return;

    setCompleting(true);
    const result = await axiosPost<
      Record<string, never>,
      { request: AdminDomainTransferRequest }
    >(`/admin/domain-transfers/${selected.id}/complete`, locale, {});
    setCompleting(false);

    if (result.status && result.data?.request) {
      setSelected(result.data.request);
      void loadRequests();
      toast.success(t("completeSuccess"));
    } else {
      toast.error(
        resolveApiErrorMessage(result.data, locale, t("completeError")),
      );
    }
  };

  const handleCancel = async () => {
    if (!selected) return;

    setCancelling(true);
    const result = await axiosPost<
      Record<string, never>,
      { request: AdminDomainTransferRequest }
    >(`/admin/domain-transfers/${selected.id}/cancel`, locale, {});
    setCancelling(false);

    if (result.status && result.data?.request) {
      setSelected(result.data.request);
      setShowCancelConfirm(false);
      void loadRequests();
      toast.success(t("cancelSuccess"));
    } else {
      toast.error(
        resolveApiErrorMessage(result.data, locale, t("cancelError")),
      );
    }
  };

  const counts = useMemo(() => {
    const map = new Map<TransferStatus, number>();
    for (const request of requests) {
      map.set(request.status, (map.get(request.status) ?? 0) + 1);
    }
    return map;
  }, [requests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter !== "all" && request.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        request.userName?.toLowerCase().includes(q) ||
        request.domainUrl?.toLowerCase().includes(q) ||
        request.userEmail?.toLowerCase().includes(q)
      );
    });
  }, [requests, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const columns = useMemo<DataColumn<AdminDomainTransferRequest>[]>(
    () => [
      {
        id: "user",
        header: t("colUser"),
        primary: true,
        cell: (row) => (
          <span className="min-w-0">
            <span className="block truncate font-medium text-fg">
              {row.userName}
            </span>
            <span
              className="block truncate font-mono text-[11px] text-fg-subtle"
              dir="ltr"
            >
              {row.userEmail}
            </span>
          </span>
        ),
      },
      {
        id: "domain",
        header: t("colDomain"),
        cell: (row) => (
          <span className="ui-figure text-[13px] text-fg" dir="ltr">
            {row.domainUrl}
          </span>
        ),
      },
      {
        id: "status",
        header: t("colStatus"),
        cell: (row) => (
          <Badge tone={STATUS_TONE[row.status] ?? "neutral"} dot>
            {t(`status.${row.status}`)}
          </Badge>
        ),
      },
      {
        id: "createdAt",
        header: t("colDate"),
        numeric: true,
        cell: (row) => (
          <span className="ui-figure text-[12px] text-fg-muted" lang="en">
            {row.createdAt ? formatMediumDateTime(row.createdAt, locale) : "—"}
          </span>
        ),
      },
    ],
    [locale, t],
  );

  const adminMessages = selected?.messages ?? [];

  /**
   * The queue first, the conversation second.
   *
   * The counts across the top say how much work is waiting in each state before
   * any row is read, the filter narrows to one of those states, and the table
   * carries the domain as a mono ticket because that string — not the customer
   * name — is what an operator matches against a DNS record.
   */
  return (
    <PageShell
      kind="table"
      header={
        <>
          <PageHeader
            title={
              <span className="inline-flex items-center gap-2">
                <IoGlobeOutline className="text-fg-subtle" aria-hidden />
                {t("title")}
              </span>
            }
            description={t("description")}
            breadcrumbs={[
              { label: tAdmin("title"), href: "/admin" },
              { label: t("title") },
            ]}
            breadcrumbsLabel={tCommon("breadcrumb")}
            actions={
              <Button
                variant="secondary"
                startIcon={<IoRefreshOutline />}
                onClick={() => void loadRequests()}
                loading={loading}
              >
                {t("refresh")}
              </Button>
            }
          />

          {/* The tiles were marked `active` by the status filter but had no way
              to set it, so the highlight could never appear from a click on the
              thing it highlighted. Each tile now selects its own state, and
              clicking the selected one clears back to everything. */}
          <StatGrid columns={4} ruled>
            {SUMMARY_STATUSES.map((status) => (
              <StatCard
                key={status}
                label={t(`status.${status}`)}
                value={
                  <span lang="en">
                    {(counts.get(status) ?? 0).toLocaleString("en-US")}
                  </span>
                }
                loading={loading}
                active={statusFilter === status}
                onClick={() => {
                  setStatusFilter((current) =>
                    current === status ? "all" : status,
                  );
                  setPage(1);
                }}
              />
            ))}
          </StatGrid>
        </>
      }
      toolbar={
        <Toolbar
          search={
            <SearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder={tCommon("search")}
              label={tCommon("search")}
              clearLabel={tCommon("clearSearch")}
            />
          }
          filters={
            <Select
              inputSize="sm"
              aria-label={t("colStatus")}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as TransferStatus | "all");
                setPage(1);
              }}
              wrapperClassName="w-auto"
            >
              <option value="all">{t("filterAll")}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`status.${status}`)}
                </option>
              ))}
            </Select>
          }
        />
      }
      footer={
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          summary={
            filtered.length > 0
              ? tCommon("paginationInfo", {
                  from: (currentPage - 1) * PAGE_SIZE + 1,
                  to: Math.min(currentPage * PAGE_SIZE, filtered.length),
                  total: filtered.length,
                })
              : undefined
          }
          labels={{
            region: tCommon("pagination"),
            previous: tCommon("previousPage"),
            next: tCommon("nextPage"),
            page: (n) => tCommon("goToPage", { page: n }),
          }}
        />
      }
    >
      <DataTable<AdminDomainTransferRequest>
        columns={columns}
        rows={pageRows}
        getRowKey={(row) => String(row.id)}
        caption={t("title")}
        loading={loading}
        skeletonRows={8}
        tableId="admin-domain-transfers"
        stickyHeader
        densityControl
        labels={tableLabels}
        empty={
          query.trim() || statusFilter !== "all" ? (
            <NoResultsState
              title={tCommon("noResultsTitle")}
              description={tCommon("noResultsDescription")}
              onClear={() => {
                setQuery("");
                setStatusFilter("all");
                setPage(1);
              }}
              clearLabel={tCommon("clearFilters")}
            />
          ) : (
            <EmptyState
              icon={<IoGlobeOutline />}
              title={t("title")}
              description={t("description")}
            />
          )
        }
        rowActions={(row) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void openDetail(row.id)}
          >
            {t("view")}
          </Button>
        )}
      />

      <Modal
        open={selected !== null || detailLoading}
        onClose={() => {
          setSelected(null);
          setShowCancelConfirm(false);
        }}
        title={selected ? t("detailTitle") : undefined}
        description={
          selected ? (
            <span className="font-mono" dir="ltr">
              {selected.domainUrl}
            </span>
          ) : undefined
        }
        size="lg"
        dismissible={!sending && !completing && !cancelling}
      >
        {detailLoading ? (
          <LoadingBlock label={tCommon("loading")} className="min-h-[200px]" />
        ) : selected ? (
          <div className="flex flex-col gap-5">
            {/* The request's facts are a ticket stub: mono captions above the
                values, so the panel scans top-to-bottom rather than as prose. */}
            <dl className="grid gap-3 rounded-lg border border-line bg-surface-2 p-3 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="ui-label">{t("colUser")}</dt>
                <dd className="truncate text-[13px] font-medium text-fg">
                  {selected.userName}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="ui-label">{t("email")}</dt>
                <dd
                  className="truncate text-[13px] font-medium text-fg"
                  dir="ltr"
                >
                  {selected.userEmail}
                </dd>
              </div>
              {selected.userPhone && (
                <div className="min-w-0">
                  <dt className="ui-label">{t("phone")}</dt>
                  <dd className="text-[13px] font-medium text-fg">
                    <PhoneDisplay value={selected.userPhone} />
                  </dd>
                </div>
              )}
              <div className="min-w-0">
                <dt className="ui-label">{t("colStatus")}</dt>
                <dd className="mt-0.5">
                  <Badge tone={STATUS_TONE[selected.status]} dot>
                    {t(`status.${selected.status}`)}
                  </Badge>
                </dd>
              </div>
            </dl>

            {selected.status === "user_confirmed" && (
              <Alert tone="info">{t("userConfirmedAlert")}</Alert>
            )}

            {adminMessages.length > 0 && (
              <section className="flex flex-col gap-2">
                <h3 className="ui-label">{t("messagesHistory")}</h3>
                {/* One ruled thread: the admin's turns take the ink-soft fill
                    and the customer's stay on the sunken surface, so the
                    exchange reads without either side needing a hue. */}
                <ul className="flex max-h-60 flex-col gap-1.5 overflow-y-auto">
                  {adminMessages.map((msg) => (
                    <li
                      key={msg.id}
                      className={cn(
                        "rounded-lg border p-2.5",
                        msg.senderType === "admin"
                          ? "border-brand-line bg-brand-soft"
                          : "border-line bg-surface-2",
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="ui-label">
                          {msg.senderType === "user"
                            ? t("customer")
                            : msg.message.startsWith("__system:") ||
                                msg.adminName === "ENS System"
                              ? t("system")
                              : msg.adminName || t("admin")}
                        </span>
                        <span className="ui-figure text-[11px] text-fg-subtle">
                          {formatMediumDateTime(msg.createdAt, locale)}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-fg">
                        {msg.message === "confirmed_steps"
                          ? t("userConfirmedSteps")
                          : msg.message}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {selected.status === "cancelled" && selected.cancelledAt && (
              <Alert tone="danger">
                {t("cancelledInfo", {
                  by:
                    selected.cancelledBy === "user"
                      ? t("cancelledByUser")
                      : t("cancelledByAdmin"),
                  date: formatMediumDateTime(selected.cancelledAt, locale),
                })}
              </Alert>
            )}

            {selected.status !== "completed" &&
              selected.status !== "cancelled" && (
                <div className="flex flex-col gap-3 border-t border-line pt-4">
                  {selected.status === "pending" && (
                    <Alert tone="warning">{t("pendingDnsAlert")}</Alert>
                  )}

                  <Field
                    label={
                      selected.status === "pending" ||
                      !adminMessages.some(
                        (m) =>
                          m.senderType === "admin" &&
                          !m.message.startsWith("__system:"),
                      )
                        ? t("dnsConfigLabel")
                        : t("replyLabel")
                    }
                    hint={t("dnsConfigHint")}
                  >
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      placeholder={
                        selected.status === "pending"
                          ? t("dnsConfigPlaceholder")
                          : t("replyPlaceholder")
                      }
                      className="font-mono"
                      dir="ltr"
                    />
                  </Field>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => void handleSendMessage()}
                      disabled={sending || !message.trim()}
                      loading={sending}
                    >
                      {selected.status === "pending"
                        ? t("sendDnsConfig")
                        : t("sendMessage")}
                    </Button>
                    <Button
                      variant="secondary"
                      startIcon={<IoCheckmarkCircleOutline />}
                      onClick={() => void handleComplete()}
                      loading={completing}
                    >
                      {t("markComplete")}
                    </Button>
                    {!showCancelConfirm ? (
                      <Button
                        variant="dangerGhost"
                        startIcon={<IoCloseCircleOutline />}
                        onClick={() => setShowCancelConfirm(true)}
                      >
                        {t("cancelRequest")}
                      </Button>
                    ) : (
                      <div
                        role="group"
                        aria-label={t("cancelRequest")}
                        className="flex w-full flex-wrap items-center gap-2 border-t border-danger-line pt-3"
                      >
                        <span className="text-[13px] text-fg-muted">
                          {t("cancelConfirm")}
                        </span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => void handleCancel()}
                          loading={cancelling}
                        >
                          {t("confirmCancel")}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowCancelConfirm(false)}
                          disabled={cancelling}
                        >
                          {t("cancelDismiss")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {selected.status === "completed" && (
              <Alert tone="success">
                {t("completedBy", {
                  name: selected.completedByAdminName || t("admin"),
                  date: selected.completedAt
                    ? formatMediumDateTime(selected.completedAt, locale)
                    : "",
                })}
              </Alert>
            )}
          </div>
        ) : null}
      </Modal>
    </PageShell>
  );
}
