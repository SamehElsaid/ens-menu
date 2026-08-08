"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoGlobeOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DataTable from "@/components/Custom/DataTable";
import PhoneDisplay from "@/components/Global/PhoneDisplay";
import {
  Button,
  LoadingBlock,
  Modal,
  PageHeader,
  buttonClasses,
} from "@/components/ui";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import type { AdminDomainTransferRequest } from "@/types/DomainTransfer";
import { toast } from "react-toastify";

function formatDateTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusBadgeClass(
  status: AdminDomainTransferRequest["status"],
): string {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "user_confirmed":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "awaiting_user":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-slate-100 text-slate-700  ";
  }
}

export default function AdminDomainTransfersPage() {
  const locale = useLocale();
  const t = useTranslations("adminDomainTransfers");
  const tCommon = useTranslations("common");
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const [requests, setRequests] = useState<AdminDomainTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminDomainTransferRequest | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const result = await axiosGet<{ requests: AdminDomainTransferRequest[] }>(
      "/admin/domain-transfers",
      locale,
    );
    if (result.status && result.data) {
      setRequests(result.data.requests);
    }
    setLoading(false);
  }, [locale]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const openDetail = async (requestId: number) => {
    setDetailLoading(true);
    const result = await axiosGet<{ request: AdminDomainTransferRequest }>(
      `/admin/domain-transfers/${requestId}`,
      locale,
    );
    setDetailLoading(false);
    if (result.status && result.data) {
      setSelected(result.data.request);
      setMessage("");
      setShowCancelConfirm(false);
    } else {
      toast.error(t("loadDetailError"));
    }
  };

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
        (result.data as { message?: string })?.message || t("messageError"),
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
        (result.data as { message?: string })?.message || t("completeError"),
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
        (result.data as { message?: string })?.message || t("cancelError"),
      );
    }
  };

  const columnDefs = useMemo<ColDef<AdminDomainTransferRequest>[]>(
    () => [
      {
        field: "userName",
        headerName: t("colUser"),
        flex: 1,
        minWidth: 140,
      },
      {
        field: "domainUrl",
        headerName: t("colDomain"),
        flex: 1.2,
        minWidth: 160,
        cellRenderer: (
          params: ICellRendererParams<AdminDomainTransferRequest>,
        ) => (
          <span dir="ltr" className="font-mono text-sm">
            {params.value}
          </span>
        ),
      },
      {
        field: "status",
        headerName: t("colStatus"),
        width: 150,
        cellRenderer: (
          params: ICellRendererParams<AdminDomainTransferRequest>,
        ) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(params.value)}`}
          >
            {t(`status.${params.value}`)}
          </span>
        ),
      },
      {
        field: "createdAt",
        headerName: t("colDate"),
        width: 170,
        valueFormatter: (params) =>
          params.value ? formatDateTime(String(params.value), locale) : "",
      },
      {
        headerName: t("colActions"),
        width: 120,
        sortable: false,
        filter: false,
        cellRenderer: (
          params: ICellRendererParams<AdminDomainTransferRequest>,
        ) => (
          <button
            type="button"
            onClick={() => void openDetail(params.data!.id)}
            className={buttonClasses({ variant: "subtle", size: "sm" })}
          >
            {t("view")}
          </button>
        ),
      },
    ],
    [locale, t],
  );

  return (
    <div className="space-y-6" dir={textDir}>
      <PageHeader
        title={
          <>
            <IoGlobeOutline className="text-brand" aria-hidden />
            {t("title")}
          </>
        }
        description={t("description")}
        actions={
          <Button
            variant="secondary"
            startIcon={<IoRefreshOutline />}
            onClick={() => void loadRequests()}
          >
            {t("refresh")}
          </Button>
        }
      />

      <CardDashBoard>
        {loading ? (
          <LoadingBlock label={tCommon("loading")} className="min-h-[200px]" />
        ) : (
          <DataTable
            rowData={requests}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={20}
          />
        )}
      </CardDashBoard>

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
          <div className="space-y-5">
            <div className="grid gap-3 rounded-lg bg-surface-2 p-4 text-sm sm:grid-cols-2">
              <div>
                <span className="text-fg-muted">{t("colUser")}: </span>
                <span className="font-medium">{selected.userName}</span>
              </div>
              <div>
                <span className="text-fg-muted">{t("email")}: </span>
                <span className="font-medium" dir="ltr">
                  {selected.userEmail}
                </span>
              </div>
              {selected.userPhone && (
                <div>
                  <span className="text-fg-muted">{t("phone")}: </span>
                  <PhoneDisplay value={selected.userPhone} />
                </div>
              )}
              <div>
                <span className="text-fg-muted">{t("colStatus")}: </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(selected.status)}`}
                >
                  {t(`status.${selected.status}`)}
                </span>
              </div>
            </div>

            {selected.status === "user_confirmed" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                {t("userConfirmedAlert")}
              </div>
            )}

            {selected.messages && selected.messages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-fg">
                  {t("messagesHistory")}
                </h3>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {selected.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-3 text-sm ${
                        msg.senderType === "admin"
                          ? "bg-primary/5 border border-primary/10"
                          : "bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-fg-subtle">
                        <span>
                          {msg.senderType === "user"
                            ? t("customer")
                            : msg.message.startsWith("__system:") ||
                                msg.adminName === "ENS System"
                              ? t("system")
                              : msg.adminName || t("admin")}
                        </span>
                        <span>{formatDateTime(msg.createdAt, locale)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-fg-muted">
                        {msg.message === "confirmed_steps"
                          ? t("userConfirmedSteps")
                          : msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.status === "cancelled" && selected.cancelledAt && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {t("cancelledInfo", {
                  by:
                    selected.cancelledBy === "user"
                      ? t("cancelledByUser")
                      : t("cancelledByAdmin"),
                  date: formatDateTime(selected.cancelledAt, locale),
                })}
              </div>
            )}

            {selected.status !== "completed" &&
              selected.status !== "cancelled" && (
                <div className="space-y-3 border-t border-line pt-4 dark:border-line">
                  {selected.status === "pending" && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                      {t("pendingDnsAlert")}
                    </div>
                  )}

                  <label className="block text-sm font-medium text-fg-muted">
                    {selected.status === "pending" ||
                    !selected.messages?.some(
                      (m) =>
                        m.senderType === "admin" &&
                        !m.message.startsWith("__system:"),
                    )
                      ? t("dnsConfigLabel")
                      : t("replyLabel")}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder={
                      selected.status === "pending"
                        ? t("dnsConfigPlaceholder")
                        : t("replyPlaceholder")
                    }
                    className="w-full rounded-lg border border-line bg-white px-4 py-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:text-white"
                    dir="ltr"
                  />
                  <p className="text-xs text-fg-muted">{t("dnsConfigHint")}</p>
                  <div className="flex flex-wrap gap-3">
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
                      <div className="flex w-full flex-wrap items-center gap-2 border-t border-danger-line pt-3">
                        <span className="text-sm text-fg-muted">
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
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                {t("completedBy", {
                  name: selected.completedByAdminName || t("admin"),
                  date: selected.completedAt
                    ? formatDateTime(selected.completedAt, locale)
                    : "",
                })}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
