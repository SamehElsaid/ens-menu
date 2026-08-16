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
import {
  Alert,
  Badge,
  Button,
  Card,
  CardFooter,
  ConfirmDialog,
  Field,
  Input,
  LoadingBlock,
  PageShell,
  SectionHeader,
  Spinner,
} from "@/components/ui";
import DomainTransferHistory from "@/components/Dashboard/DomainTransferHistory";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { getLatestDnsConfigMessage } from "@/lib/domainTransfer";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import type { DomainTransferRequest } from "@/types/DomainTransfer";
import type { StatusTone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { toast } from "react-toastify";
import { resolveApiErrorMessage } from "@/api/apiError";
import { formatMediumDateTime } from "@/lib/formatDateTime";

const ANALYSIS_MS = 2800;
const POLL_MS = 5000;

type StepState = "done" | "active" | "pending";

function getStepStates(
  status: DomainTransferRequest["status"],
  analyzing: boolean,
  analysisDone: boolean,
): StepState[] {
  const step2: StepState = analyzing
    ? "active"
    : analysisDone || status !== "pending"
      ? "done"
      : "pending";

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

const STATUS_TONE: Record<DomainTransferRequest["status"], StatusTone> = {
  pending: "neutral",
  awaiting_user: "warning",
  user_confirmed: "info",
  completed: "success",
  cancelled: "danger",
};

/**
 * One stage of the connection, as a ruled ticket row.
 *
 * The mono ordinal is what makes the flow legible: a five-step process drawn as
 * circles joined by a line reads as decoration, while `01`…`05` down the inline
 * start says how far along you are and how much is left. State is carried by the
 * glyph as well as the tone, so a done step is not distinguished from a pending
 * one by colour alone.
 */
function StepRow({
  index,
  title,
  description,
  state,
  icon: Icon,
}: {
  index: number;
  title: string;
  description?: string;
  state: StepState;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <li
      className={cn(
        "relative flex gap-3 px-3 py-2.5",
        state === "active" &&
          "before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:bg-accent before:content-['']",
      )}
      aria-current={state === "active" ? "step" : undefined}
    >
      <span className="ui-figure w-5 shrink-0 pt-px text-[11px] text-fg-subtle">
        {String(index).padStart(2, "0")}
      </span>

      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-lg border",
          state === "done" &&
            "border-success-line bg-success-soft text-success",
          state === "active" && "border-accent-line bg-accent-soft text-accent",
          state === "pending" && "border-line bg-surface-2 text-fg-subtle",
        )}
        aria-hidden
      >
        {state === "done" ? (
          <IoCheckmarkCircle className="size-3.5" />
        ) : (
          <Icon className="size-3.5" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] font-semibold",
            state === "pending" ? "text-fg-subtle" : "text-fg",
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
            {description}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export default function DomainTransferPageContent() {
  const locale = useLocale();
  const t = useTranslations("domainTransfer");

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

  const loadRequest = useCallback(async () => {
    const result = await axiosGet<{
      request: DomainTransferRequest | null;
      history: DomainTransferRequest[];
    }>("/user/domain-transfer", locale);
    if (result.status && result.data) {
      setRequest(result.data.request);
      setHistory(result.data.history ?? []);
      if (
        result.data.request?.status === "pending" &&
        result.data.request.id
      ) {
        runAnalysisAnimation(result.data.request.id);
      } else {
        setAnalysisDone(true);
        setAnalyzing(false);
      }
    }
    setLoading(false);
    return result.data?.request ?? null;
  }, [locale, runAnalysisAnimation]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRequest(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRequest]);

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
        resolveApiErrorMessage(result.data, locale, t("submitError")),
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
        resolveApiErrorMessage(result.data, locale, t("confirmError")),
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
        resolveApiErrorMessage(result.data, locale, t("cancelError")),
      );
    }
  };

  if (loading) {
    return <LoadingBlock className="min-h-[40vh]" />;
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
    /* A single request at a time, five status steps and one input: this is a
       form-measure page, and past requests are supporting material rather than
       part of the flow. */
    <PageShell
      kind="form"
      header={
        <PageTitleWithHelp
          eyebrow={t("automatedProcess")}
          title={t("title")}
          description={t("description")}
          meta={
            request ? (
              <Badge tone={STATUS_TONE[request.status]} dot>
                {t(`status.${request.status}`)}
              </Badge>
            ) : undefined
          }
        />
      }
      aside={<DomainTransferHistory history={history} />}
    >
      {!request ? (
        <Card as="form" onSubmit={handleSubmit}>
          <SectionHeader ruled title={t("domainLabel")} />

          <div className="mt-3.5 max-w-md">
            <Field
              label={t("domainLabel")}
              hint={t("domainHint")}
              htmlFor="domainUrl"
            >
              <Input
                id="domainUrl"
                type="text"
                value={domainUrl}
                onChange={(e) => setDomainUrl(e.target.value)}
                placeholder={t("domainPlaceholder")}
                dir="ltr"
                startIcon={<IoGlobeOutline className="size-4" />}
              />
            </Field>
          </div>

          <CardFooter className="justify-end">
            <Button
              type="submit"
              loading={submitting}
              disabled={!domainUrl.trim()}
            >
              {submitting ? t("submitting") : t("submit")}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <Card as="section">
            {/* The domain is the subject of this whole page, so it is the one
                figure on it — mono, LTR, and larger than its own caption. */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="ui-label">{t("domainLabel")}</p>
                <p
                  className="ui-figure mt-0.5 truncate text-[15px] text-fg"
                  dir="ltr"
                >
                  {request.domainUrl}
                </p>
              </div>
              <Badge tone={STATUS_TONE[request.status]} dot>
                {t(`status.${request.status}`)}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2.5">
              <span className="ui-label inline-flex items-center gap-1.5">
                <IoHardwareChipOutline className="size-3.5" aria-hidden />
                {t("automatedProcess")}
              </span>
              <span className="ui-figure text-[11px] text-fg-muted">
                {t("submittedAt", {
                  date: formatMediumDateTime(request.createdAt, locale),
                })}
              </span>
            </div>

            <CardFooter>
              <Button
                variant="dangerGhost"
                size="sm"
                onClick={() => setShowCancelConfirm(true)}
                startIcon={<IoCloseCircleOutline className="size-4" />}
              >
                {t("cancelRequest")}
              </Button>
            </CardFooter>
          </Card>

          <Card as="section" padded="none">
            <div className="p-3 sm:p-4">
              <SectionHeader title={t("statusLabel")} />
            </div>
            {/* `aria-live` on the ledger rather than each row: the flow polls
                every few seconds and only the changed step should be spoken. */}
            <ol
              className="divide-y divide-line border-t border-line"
              aria-live="polite"
            >
              <StepRow
                index={1}
                title={t("steps.received.title")}
                description={t("steps.received.description")}
                state={stepStates[0]}
                icon={IoCheckmarkCircleOutline}
              />
              <StepRow
                index={2}
                title={t("steps.analyzing.title")}
                description={
                  analyzing
                    ? t("steps.analyzing.active")
                    : t("steps.analyzing.description")
                }
                state={stepStates[1]}
                icon={IoRefreshOutline}
              />
              <StepRow
                index={3}
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
              <StepRow
                index={4}
                title={t("steps.verify.title")}
                description={
                  request.status === "user_confirmed"
                    ? t("steps.verify.active")
                    : t("steps.verify.description")
                }
                state={stepStates[3]}
                icon={IoShieldCheckmarkOutline}
              />
              <StepRow
                index={5}
                title={t("steps.complete.title")}
                description={
                  request.status === "completed"
                    ? t("steps.complete.active")
                    : t("steps.complete.description")
                }
                state={stepStates[4]}
                icon={IoGlobeOutline}
              />
            </ol>
          </Card>

          {waitingForDns && (
            <Alert
              tone="info"
              icon={<Spinner size="sm" />}
              title={t("waitingForDns")}
            />
          )}

          {showDnsBlock && dnsConfigMessage && (
            <Card as="section">
              <SectionHeader ruled eyebrow="03" title={t("dnsConfigTitle")} />

              {/* The DNS record is transcribed by hand into a registrar panel,
                  so it is set in mono on a sunken surface and never wrapped. */}
              <pre className="ui-figure mt-3.5 overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 text-xs leading-relaxed whitespace-pre-wrap text-fg">
                {dnsConfigMessage.message}
              </pre>
              <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                {t("dnsNote")}
              </p>

              {request.status === "awaiting_user" && (
                <>
                  <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-fg-muted">
                    {t("confirmPrompt")}
                  </p>
                  <CardFooter className="justify-end">
                    <Button
                      type="button"
                      onClick={() => void handleConfirm()}
                      loading={confirming}
                      startIcon={
                        <IoShieldCheckmarkOutline className="size-4" />
                      }
                    >
                      {confirming ? t("confirming") : t("confirmDone")}
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          )}

          {request.status === "completed" && (
            <Alert
              tone="success"
              icon={<IoCheckmarkCircleOutline className="size-4" />}
              title={t("completedMessage", { domain: request.domainUrl })}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title={t("cancelRequest")}
        description={t("cancelConfirm")}
        confirmLabel={t("confirmCancel")}
        cancelLabel={t("cancelDismiss")}
        loading={cancelling}
        icon={<IoCloseCircleOutline className="size-4.5" />}
      />
    </PageShell>
  );
}
