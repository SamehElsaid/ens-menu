"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoGlobeOutline,
  IoHardwareChipOutline,
  IoLinkOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import CardDashBoard from "@/components/Card/CardDashBoard";
import DomainTransferHistory from "@/components/Dashboard/DomainTransferHistory";
import Loader from "@/components/Global/Loader";
import {
  DOMAIN_TRANSFER_SYSTEM_KEYS,
  getLatestDnsConfigMessage,
  isSystemMessageKey,
} from "@/lib/domainTransfer";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import type { DomainTransferRequest } from "@/types/DomainTransfer";
import { toast } from "react-toastify";

const ANALYSIS_MS = 2800;
const POLL_MS = 5000;

function formatDateTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type StepState = "done" | "active" | "pending";

function getStepStates(
  status: DomainTransferRequest["status"],
  analyzing: boolean,
  analysisDone: boolean,
): StepState[] {
  const step2: StepState =
    analyzing ? "active" : analysisDone || status !== "pending" ? "done" : "pending";

  const step3: StepState =
    status === "awaiting_user"
      ? "active"
      : status === "user_confirmed" || status === "completed"
        ? "done"
        : analysisDone && status === "pending"
          ? "active"
          : "pending";

  return [
    "done",
    step2,
    step3,
    status === "user_confirmed"
      ? "active"
      : status === "completed"
        ? "done"
        : "pending",
    status === "completed" ? "done" : "pending",
  ];
}

function TimelineStep({
  title,
  description,
  state,
  icon: Icon,
  isLast,
}: {
  title: string;
  description?: string;
  state: StepState;
  icon: React.ComponentType<{ className?: string }>;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
            state === "done"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : state === "active"
                ? "border-primary bg-primary/10 text-primary animate-pulse"
                : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
          }`}
        >
          {state === "done" ? (
            <IoCheckmarkCircle className="text-xl" />
          ) : (
            <Icon className="text-lg" />
          )}
        </div>
        {!isLast && (
          <div
            className={`mt-1 w-0.5 flex-1 min-h-[2rem] transition-colors duration-500 ${
              state === "done" ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        )}
      </div>
      <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
        <p
          className={`font-semibold transition-colors ${
            state === "pending"
              ? "text-slate-400 dark:text-slate-500"
              : "text-slate-900 dark:text-white"
          }`}
        >
          {title}
        </p>
        {description && (
          <p
            className={`mt-1 text-sm leading-relaxed ${
              state === "active"
                ? "text-slate-600 dark:text-slate-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DomainTransferPageContent() {
  const locale = useLocale();
  const t = useTranslations("domainTransfer");
  const textDir = locale === "ar" ? "rtl" : "ltr";

  const [request, setRequest] = useState<DomainTransferRequest | null>(null);
  const [history, setHistory] = useState<DomainTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainUrl, setDomainUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const analysisStartedRef = useRef<number | null>(null);

  const loadRequest = useCallback(async () => {
    const result = await axiosGet<{
      request: DomainTransferRequest | null;
      history: DomainTransferRequest[];
    }>("/user/domain-transfer", locale);
    if (result.status && result.data) {
      setRequest(result.data.request);
      setHistory(result.data.history ?? []);
      if (result.data.request?.status !== "pending") {
        setAnalysisDone(true);
        setAnalyzing(false);
      }
    }
    setLoading(false);
    return result.data?.request ?? null;
  }, [locale]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  const runAnalysisAnimation = useCallback((requestId: number) => {
    if (analysisStartedRef.current === requestId) return;
    analysisStartedRef.current = requestId;
    setAnalyzing(true);
    setAnalysisDone(false);

    window.setTimeout(() => {
      setAnalyzing(false);
      setAnalysisDone(true);
    }, ANALYSIS_MS);
  }, []);

  useEffect(() => {
    if (request?.status === "pending" && request.id) {
      runAnalysisAnimation(request.id);
    }
  }, [request?.id, request?.status, runAnalysisAnimation]);

  useEffect(() => {
    if (!request) return;
    if (request.status !== "pending" && request.status !== "user_confirmed") {
      return;
    }

    const interval = setInterval(() => {
      void loadRequest();
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [request?.status, loadRequest, request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainUrl.trim()) return;

    setSubmitting(true);
    const result = await axiosPost<
      { domainUrl: string },
      { request: DomainTransferRequest }
    >("/user/domain-transfer", locale, { domainUrl: domainUrl.trim() });
    setSubmitting(false);

    if (result.status && result.data?.request) {
      setRequest(result.data.request);
      setDomainUrl("");
      toast.success(t("submitSuccess"));
      runAnalysisAnimation(result.data.request.id);
    } else {
      toast.error(
        (result.data as { message?: string })?.message || t("submitError"),
      );
    }
  };

  const handleConfirm = async () => {
    if (!request) return;

    setConfirming(true);
    const result = await axiosPost<
      Record<string, never>,
      { request: DomainTransferRequest }
    >(`/user/domain-transfer/${request.id}/confirm`, locale, {});
    setConfirming(false);

    if (result.status && result.data?.request) {
      setRequest(result.data.request);
      toast.success(t("confirmSuccess"));
    } else {
      toast.error(
        (result.data as { message?: string })?.message || t("confirmError"),
      );
    }
  };

  const handleCancel = async () => {
    if (!request) return;

    setCancelling(true);
    const result = await axiosPost<
      Record<string, never>,
      { success?: boolean }
    >(`/user/domain-transfer/${request.id}/cancel`, locale, {});
    setCancelling(false);
    setShowCancelConfirm(false);

    if (result.status) {
      setRequest(null);
      setAnalyzing(false);
      setAnalysisDone(false);
      analysisStartedRef.current = null;
      setShowCancelConfirm(false);
      await loadRequest();
      toast.success(t("cancelSuccess"));
    } else {
      toast.error(
        (result.data as { message?: string })?.message || t("cancelError"),
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const dnsConfigMessage = request ? getLatestDnsConfigMessage(request) : null;
  const stepStates = request
    ? getStepStates(request.status, analyzing, analysisDone)
    : ([] as StepState[]);

  const showDnsBlock =
    request &&
    dnsConfigMessage &&
    (request.status === "awaiting_user" ||
      request.status === "user_confirmed" ||
      request.status === "completed");

  const waitingForDns =
    request?.status === "pending" && analysisDone && !dnsConfigMessage;

  return (
    <div className="mx-auto max-w-2xl space-y-6" dir={textDir}>
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <IoGlobeOutline className="text-primary" />
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t("description")}
        </p>
      </div>

      {!request ? (
        <CardDashBoard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="domainUrl"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("domainLabel")}
              </label>
              <input
                id="domainUrl"
                type="text"
                value={domainUrl}
                onChange={(e) => setDomainUrl(e.target.value)}
                placeholder={t("domainPlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                dir="ltr"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t("domainHint")}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting || !domainUrl.trim()}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </form>
        </CardDashBoard>
      ) : (
        <div className="space-y-4">
          <CardDashBoard>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("domainLabel")}
                </p>
                <p
                  className="font-mono font-semibold text-slate-900 dark:text-white"
                  dir="ltr"
                >
                  {request.domainUrl}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  request.status === "completed"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : request.status === "user_confirmed"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : request.status === "awaiting_user"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {t(`status.${request.status}`)}
              </span>
            </div>

            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
              <IoHardwareChipOutline />
              <span>{t("automatedProcess")}</span>
              <span>·</span>
              <span>
                {t("submittedAt", {
                  date: formatDateTime(request.createdAt, locale),
                })}
              </span>
            </div>

            <TimelineStep
              title={t("steps.received.title")}
              description={t("steps.received.description")}
              state={stepStates[0]}
              icon={IoCheckmarkCircleOutline}
            />
            <TimelineStep
              title={t("steps.analyzing.title")}
              description={
                analyzing
                  ? t("steps.analyzing.active")
                  : t("steps.analyzing.description")
              }
              state={stepStates[1]}
              icon={IoRefreshOutline}
            />
            <TimelineStep
              title={t("steps.dns.title")}
              description={
                waitingForDns
                  ? t("steps.dns.waiting")
                  : showDnsBlock
                    ? t("steps.dns.description")
                    : t("steps.dns.pending")
              }
              state={stepStates[2]}
              icon={IoLinkOutline}
            />
            <TimelineStep
              title={t("steps.verify.title")}
              description={
                request.status === "user_confirmed"
                  ? t("steps.verify.active")
                  : t("steps.verify.description")
              }
              state={stepStates[3]}
              icon={IoShieldCheckmarkOutline}
            />
            <TimelineStep
              title={t("steps.complete.title")}
              description={
                request.status === "completed"
                  ? t("steps.complete.active")
                  : t("steps.complete.description")
              }
              state={stepStates[4]}
              icon={IoGlobeOutline}
              isLast
            />
          </CardDashBoard>

          {waitingForDns && (
            <CardDashBoard>
              <div className="flex items-center gap-3 py-2">
                <IoRefreshOutline className="animate-spin text-xl text-primary" />
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {t("waitingForDns")}
                </p>
              </div>
            </CardDashBoard>
          )}

          {showDnsBlock && dnsConfigMessage && (
            <CardDashBoard className="border-primary/20 bg-primary/[0.02]">
              <div className="mb-3 flex items-center gap-2">
                <IoHardwareChipOutline className="text-primary" />
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t("dnsConfigTitle")}
                </h2>
              </div>
              <div className="rounded-xl bg-white/80 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                {dnsConfigMessage.message}
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {t("dnsNote")}
              </p>

              {request.status === "awaiting_user" && (
                <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    {t("confirmPrompt")}
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleConfirm()}
                    disabled={confirming}
                    className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {confirming ? t("confirming") : t("confirmDone")}
                  </button>
                </div>
              )}
            </CardDashBoard>
          )}

          {request.status === "completed" && (
            <CardDashBoard>
              <div className="flex flex-col items-center gap-3 py-2 text-center">
                <IoCheckmarkCircleOutline className="text-5xl text-emerald-500" />
                <p className="text-lg font-medium text-emerald-700 dark:text-emerald-400">
                  {t("completedMessage", { domain: request.domainUrl })}
                </p>
              </div>
            </CardDashBoard>
          )}

          <CardDashBoard className="border-red-100 dark:border-red-900/30">
            {!showCancelConfirm ? (
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-2 text-sm font-medium text-red-600 transition hover:text-red-700 dark:text-red-400"
              >
                <IoCloseCircleOutline className="text-lg" />
                {t("cancelRequest")}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {t("cancelConfirm")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleCancel()}
                    disabled={cancelling}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelling ? t("cancelling") : t("confirmCancel")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelling}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {t("cancelDismiss")}
                  </button>
                </div>
              </div>
            )}
          </CardDashBoard>
        </div>
      )}

      <DomainTransferHistory history={history} />
    </div>
  );
}
