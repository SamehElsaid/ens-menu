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
import Loader from "@/components/Global/Loader";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import type { AdminDomainTransferRequest } from "@/types/DomainTransfer";
import { toast } from "react-toastify";

function formatDateTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusBadgeClass(status: AdminDomainTransferRequest["status"]): string {
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
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function AdminDomainTransfersPage() {
  const locale = useLocale();
  const t = useTranslations("adminDomainTransfers");
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
    >(
      `/admin/domain-transfers/${selected.id}/message`,
      locale,
      { message: message.trim() },
    );
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
    >(
      `/admin/domain-transfers/${selected.id}/complete`,
      locale,
      {},
    );
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
        cellRenderer: (params: ICellRendererParams<AdminDomainTransferRequest>) => (
          <span dir="ltr" className="font-mono text-sm">
            {params.value}
          </span>
        ),
      },
      {
        field: "status",
        headerName: t("colStatus"),
        width: 150,
        cellRenderer: (params: ICellRendererParams<AdminDomainTransferRequest>) => (
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
          params.value
            ? formatDateTime(String(params.value), locale)
            : "",
      },
      {
        headerName: t("colActions"),
        width: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<AdminDomainTransferRequest>) => (
          <button
            type="button"
            onClick={() => void openDetail(params.data!.id)}
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <IoGlobeOutline className="text-primary" />
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t("description")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadRequests()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <IoRefreshOutline />
          {t("refresh")}
        </button>
      </div>

      <CardDashBoard>
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader />
          </div>
        ) : (
          <DataTable
            rowData={requests}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={20}
          />
        )}
      </CardDashBoard>

      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            dir={textDir}
          >
            {detailLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Loader />
              </div>
            ) : selected ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {t("detailTitle")}
                    </h2>
                    <p className="mt-1 font-mono text-sm text-primary" dir="ltr">
                      {selected.domainUrl}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50 sm:grid-cols-2">
                  <div>
                    <span className="text-slate-500">{t("colUser")}: </span>
                    <span className="font-medium">{selected.userName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t("email")}: </span>
                    <span className="font-medium" dir="ltr">
                      {selected.userEmail}
                    </span>
                  </div>
                  {selected.userPhone && (
                    <div>
                      <span className="text-slate-500">{t("phone")}: </span>
                      <PhoneDisplay value={selected.userPhone} />
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">{t("colStatus")}: </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(selected.status)}`}
                    >
                      {t(`status.${selected.status}`)}
                    </span>
                  </div>
                </div>

                {selected.status === "user_confirmed" && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    {t("userConfirmedAlert")}
                  </div>
                )}

                {selected.messages && selected.messages.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {t("messagesHistory")}
                    </h3>
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {selected.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`rounded-xl p-3 text-sm ${
                            msg.senderType === "admin"
                              ? "bg-primary/5 border border-primary/10"
                              : "bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800"
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                            <span>
                              {msg.senderType === "user"
                                ? t("customer")
                                : msg.message.startsWith("__system:") ||
                                    msg.adminName === "ENS System"
                                  ? t("system")
                                  : msg.adminName || t("admin")}
                            </span>
                            <span>
                              {formatDateTime(msg.createdAt, locale)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
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
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
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
                  <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                    {selected.status === "pending" && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                        {t("pendingDnsAlert")}
                      </div>
                    )}

                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      dir="ltr"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("dnsConfigHint")}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleSendMessage()}
                        disabled={sending || !message.trim()}
                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        {sending
                          ? t("sending")
                          : selected.status === "pending"
                            ? t("sendDnsConfig")
                            : t("sendMessage")}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleComplete()}
                        disabled={completing}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <IoCheckmarkCircleOutline />
                        {completing ? t("completing") : t("markComplete")}
                      </button>
                      {!showCancelConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowCancelConfirm(true)}
                          className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <IoCloseCircleOutline />
                          {t("cancelRequest")}
                        </button>
                      ) : (
                        <div className="flex w-full flex-wrap items-center gap-2 border-t border-red-100 pt-3 dark:border-red-900/30">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {t("cancelConfirm")}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleCancel()}
                            disabled={cancelling}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {cancelling ? t("cancelling") : t("confirmCancel")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirm(false)}
                            disabled={cancelling}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
                          >
                            {t("cancelDismiss")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selected.status === "completed" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
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
          </div>
        </div>
      )}
    </div>
  );
}
