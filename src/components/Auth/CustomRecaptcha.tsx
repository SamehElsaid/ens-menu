"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { useLocale, useTranslations } from "next-intl";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiRotateCcw, FiShield, FiX } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { SiteButton, SiteSpinner } from "@/components/site/Button";
import { Alert } from "@/components/site/Form";
import { Badge, Card, Ticket } from "@/components/site/primitives";

const RECAPTCHA_SITE_KEY = "6LfZunYsAAAAAChMIIbG-lhkDy6uMnAgm9cfZnrN";
const RECAPTCHA_WIDTH = 304;
const REJECT_RESET_MS = 2500;

type RecaptchaStatus = "boot" | "idle" | "verified" | "rejected";

export type RecaptchaGateHandle = {
  promptVerification: () => Promise<boolean>;
  reset: () => void;
};

interface CustomRecaptchaProps {
  onVerifiedChange: (verified: boolean) => void;
  className?: string;
  /** inline = legacy checkbox row; on-demand = modal at submit (recommended for signup) */
  mode?: "inline" | "on-demand";
  /** Hide idle/verified hints — captcha UI only appears in the modal (login flow) */
  silent?: boolean;
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.classList.add("recaptcha-modal-open");

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.classList.remove("recaptcha-modal-open");
    };
  }, [locked]);
}

/**
 * The status stamp on the stub's header rule.
 *
 * Four states, and none of them is a hue on its own (DESIGN.md §3): each one
 * carries a glyph and a word, so the stamp still reads in greyscale and for
 * anyone who cannot separate the brand purple from the positive green.
 */
function StatusStamp({
  state,
  label,
}: {
  state: "pending" | "checking" | "passed" | "failed";
  label: string;
}) {
  const glyph: ReactNode =
    state === "passed" ? (
      <FiCheck className="size-3.5 shrink-0" aria-hidden />
    ) : state === "failed" ? (
      <FiX className="size-3.5 shrink-0" aria-hidden />
    ) : state === "checking" ? (
      <SiteSpinner />
    ) : (
      <FiShield className="size-3.5 shrink-0" aria-hidden />
    );

  return (
    <Badge
      tone={
        state === "passed"
          ? "positive"
          : state === "failed"
            ? "critical"
            : "neutral"
      }
      className="shrink-0"
    >
      {glyph}
      {label}
    </Badge>
  );
}

const CustomRecaptcha = forwardRef<RecaptchaGateHandle, CustomRecaptchaProps>(
  function CustomRecaptcha(
    { onVerifiedChange, className = "", mode = "inline", silent = false },
    ref,
  ) {
    const t = useTranslations("");
    const locale = useLocale();
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const widgetWrapRef = useRef<HTMLDivElement>(null);
    const rejectTimeoutRef = useRef<number | null>(null);
    const pendingResolveRef = useRef<((value: boolean) => void) | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const headingId = useId();
    const descriptionId = useId();

    const [status, setStatus] = useState<RecaptchaStatus>("boot");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [widgetScale, setWidgetScale] = useState(1);

    const isDev =
      process.env.NEXT_PUBLIC_DEV === "dev" ||
      process.env.NEXT_PUBLIC_DEV === "true";

    useBodyScrollLock(mode === "on-demand" && modalOpen);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (isDev) {
        onVerifiedChange(true);
        setStatus("verified");
      }
    }, [isDev, onVerifiedChange]);

    const clearRejectTimeout = useCallback(() => {
      if (rejectTimeoutRef.current !== null) {
        window.clearTimeout(rejectTimeoutRef.current);
        rejectTimeoutRef.current = null;
      }
    }, []);

    useEffect(() => () => clearRejectTimeout(), [clearRejectTimeout]);

    const resolvePending = useCallback((value: boolean) => {
      pendingResolveRef.current?.(value);
      pendingResolveRef.current = null;
    }, []);

    const closeModal = useCallback(() => {
      setModalVisible(false);
      window.setTimeout(() => {
        setModalOpen(false);
        setLoading(false);
      }, 220);
    }, []);

    const handleVerified = useCallback(
      (token: string | null) => {
        setLoading(false);
        clearRejectTimeout();

        if (token) {
          setStatus("verified");
          onVerifiedChange(true);
          if (mode === "on-demand") {
            closeModal();
            resolvePending(true);
          }
          return;
        }

        setStatus("rejected");
        onVerifiedChange(false);
        recaptchaRef.current?.reset();

        if (mode === "on-demand") {
          resolvePending(false);
        }

        rejectTimeoutRef.current = window.setTimeout(() => {
          setStatus((s) => (s === "rejected" ? "idle" : s));
          rejectTimeoutRef.current = null;
        }, REJECT_RESET_MS);
      },
      [clearRejectTimeout, closeModal, mode, onVerifiedChange, resolvePending],
    );

    const handleExpired = useCallback(() => {
      setLoading(false);
      clearRejectTimeout();
      setStatus("rejected");
      onVerifiedChange(false);
      recaptchaRef.current?.reset();
      if (mode === "on-demand") resolvePending(false);

      rejectTimeoutRef.current = window.setTimeout(() => {
        setStatus((s) => (s === "rejected" ? "idle" : s));
        rejectTimeoutRef.current = null;
      }, REJECT_RESET_MS);
    }, [clearRejectTimeout, mode, onVerifiedChange, resolvePending]);

    const handleError = useCallback(() => {
      setLoading(false);
      clearRejectTimeout();
      setStatus("idle");
      onVerifiedChange(false);
      recaptchaRef.current?.reset();
      if (mode === "on-demand") resolvePending(false);
    }, [clearRejectTimeout, mode, onVerifiedChange, resolvePending]);

    /** Hands the challenge back after a failure, without waiting out the
     *  auto-reset. The affordance is a real button so it is reachable by keyboard
     *  and announced, rather than the previous "tap the card anywhere" hint. */
    const handleRetry = useCallback(() => {
      clearRejectTimeout();
      recaptchaRef.current?.reset();
      setStatus("idle");
      setLoading(false);
      onVerifiedChange(false);
    }, [clearRejectTimeout, onVerifiedChange]);

    const openModal = useCallback(() => {
      if (status !== "verified") {
        setStatus("boot");
      }
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setModalOpen(true);
      requestAnimationFrame(() => setModalVisible(true));
    }, [status]);

    useImperativeHandle(
      ref,
      () => ({
        promptVerification: () =>
          new Promise<boolean>((resolve) => {
            if (isDev) {
              resolve(true);
              return;
            }
            if (status === "verified") {
              resolve(true);
              return;
            }
            pendingResolveRef.current = resolve;
            openModal();
          }),
        reset: () => {
          if (isDev) return;
          recaptchaRef.current?.reset();
          setStatus("idle");
          setLoading(false);
          onVerifiedChange(false);
          closeModal();
          resolvePending(false);
        },
      }),
      [closeModal, onVerifiedChange, openModal, resolvePending, status, isDev],
    );

    useEffect(() => {
      if (!modalOpen || mode !== "on-demand") return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && status !== "verified") {
          closeModal();
          resolvePending(false);
        }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [closeModal, modalOpen, mode, resolvePending, status]);

    /* Focus moves into the panel on open and back to whatever opened it on
       close, so a keyboard submit does not leave focus stranded on a control
       behind the overlay.

       There is deliberately no focus trap and no `aria-modal`: when the checkbox
       needs a picture challenge, Google renders it in its own overlay appended to
       `document.body`, outside this node. Trapping focus here — or telling a
       screen reader that everything outside this node is inert — would lock the
       user out of the challenge they have to solve. Escape and the close button
       are the ways out. */
    useEffect(() => {
      if (!modalOpen || mode !== "on-demand") return;

      panelRef.current?.focus({ preventScroll: true });

      return () => {
        returnFocusRef.current?.focus({ preventScroll: true });
      };
    }, [modalOpen, mode]);

    useEffect(() => {
      const node = widgetWrapRef.current;
      if (!node) return;

      const updateScale = () => {
        const available = node.getBoundingClientRect().width;
        setWidgetScale(
          available > 0 && available < RECAPTCHA_WIDTH
            ? available / RECAPTCHA_WIDTH
            : 1,
        );
      };

      updateScale();
      const observer = new ResizeObserver(updateScale);
      observer.observe(node);
      return () => observer.disconnect();
    }, [modalOpen, mode]);

    const isVerified = status === "verified";
    const isRejected = status === "rejected";
    const isBoot = status === "boot";
    const isBusy = isBoot || loading;

    const stampState = isVerified
      ? "passed"
      : isRejected
        ? "failed"
        : isBusy
          ? "checking"
          : "pending";

    const stampLabel = isVerified
      ? t("auth.recaptchaStatusPassed")
      : isRejected
        ? t("auth.recaptchaStatusFailed")
        : isBusy
          ? t("auth.recaptchaStatusChecking")
          : t("auth.recaptchaStatusPending");

    /* The live sentence. Empty while rejected, because the critical-tone `Alert`
       below the challenge carries that state and owns its own announcement — two
       live regions saying the same thing read it twice. */
    const liveSentence = isRejected
      ? ""
      : isVerified
        ? t("auth.recaptchaVerifiedHint")
        : isBoot
          ? t("auth.recaptchaBoot")
          : loading
            ? t("auth.recaptchaVerifyingHint")
            : t("auth.recaptchaHint");

    /** Google's own checkbox, kept as the focal element of the stub. It scales
     *  down rather than clipping, because the widget has a fixed 304px width and
     *  the auth panel is narrower than that on a small phone. */
    const widget = (
      <div
        ref={widgetWrapRef}
        className="recaptcha-widget-wrap flex min-h-[78px] justify-center overflow-hidden"
      >
        <div
          style={{
            transform: widgetScale < 1 ? `scale(${widgetScale})` : undefined,
            transformOrigin: "top center",
            width: widgetScale < 1 ? RECAPTCHA_WIDTH * widgetScale : undefined,
            height: widgetScale < 1 ? Math.ceil(78 * widgetScale) : undefined,
          }}
        >
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            hl={locale}
            onLoadCapture={() => setStatus("idle")}
            onChange={handleVerified}
            onExpired={handleExpired}
            onErrored={handleError}
          />
        </div>
      </div>
    );

    /** The challenge, sunk into a soft well with the boot/verifying state laid
     *  over it. A well rather than a bare row: the widget is third-party chrome
     *  in its own typeface, and the inset is what says where the app stops. */
    const challengeWell = (
      <div
        className="relative rounded-site-card border border-site-line bg-site-tint p-3"
        onPointerDown={() => {
          if (status === "idle") setLoading(true);
        }}
      >
        {widget}
        {isBusy ? (
          <div className="absolute inset-0 z-1 flex flex-col items-center justify-center gap-2.5 bg-site-bg/95 px-4">
            <SiteSpinner className="text-site-brand" />
            <p className="s-ticket text-center text-site-muted">
              {isBoot ? t("auth.recaptchaBoot") : t("auth.recaptchaVerifying")}
            </p>
          </div>
        ) : null}
      </div>
    );

    const failureAlert = isRejected ? (
      <Alert tone="critical" className="mt-3">
        {t("auth.recaptchaRejectedHint")}
      </Alert>
    ) : null;

    const retryButton = isRejected ? (
      <SiteButton variant="secondary" size="md" onClick={handleRetry}>
        <FiRotateCcw className="size-4" aria-hidden />
        {t("auth.recaptchaRetry")}
      </SiteButton>
    ) : null;

    /** The stub's header rule: what this block is, and where it stands. */
    const stubHeader = (
      <div className="flex items-center justify-between gap-3 border-b border-site-line px-3.5 py-2.5">
        <Ticket>{t("auth.recaptchaTicketLabel")}</Ticket>
        <StatusStamp state={stampState} label={stampLabel} />
      </div>
    );

    /** The stub's foot: the state in a sentence, announced, plus the recovery. */
    const stubFooter = (
      <div className="flex items-center justify-between gap-3 border-t border-site-line bg-site-tint px-3.5 py-2.5">
        <p
          role="status"
          aria-live="polite"
          className="min-w-0 text-site-xs text-site-fg"
        >
          {liveSentence}
        </p>
        {retryButton}
      </div>
    );

    if (isDev) {
      return null;
    }

    if (mode === "on-demand") {
      return (
        <div
          className={cn(silent ? "sr-only" : "w-full", className)}
          aria-hidden={silent}
        >
          {/* The stub before the challenge exists: a quiet tinted card saying a
              check is pending, so the form does not spring a modal on submit
              with no warning. */}
          {!silent ? (
            <Card tone="tint" className="px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <Ticket>{t("auth.recaptchaTicketLabel")}</Ticket>
                <StatusStamp
                  state={isVerified ? "passed" : "pending"}
                  label={
                    isVerified
                      ? t("auth.recaptchaStatusPassed")
                      : t("auth.recaptchaStatusPending")
                  }
                />
              </div>
              <p
                role="status"
                aria-live="polite"
                className="mt-2 text-site-xs text-site-fg"
              >
                {isVerified
                  ? t("auth.recaptchaVerifiedHint")
                  : t("auth.recaptchaOnSubmit")}
              </p>
            </Card>
          ) : null}

          {mounted &&
            modalOpen &&
            createPortal(
              /* `public-world` on the portal root: the `--s-*` tokens are scoped
                 to that class and this subtree hangs off `document.body`, outside
                 the shell that carries it. `bg-transparent` cancels the ground
                 colour the class also sets, which would otherwise paint the whole
                 viewport in the public page ground. */
              <div
                className={cn(
                  "recaptcha-modal public-world fixed inset-0 z-[250] flex items-center justify-center bg-transparent p-4",
                  modalVisible
                    ? "recaptcha-modal--visible"
                    : "recaptcha-modal--hidden",
                )}
              >
                {/* The scrim is keyed to the deep *ground* rather than to
                    `--s-ink`, which inverts to near-white in dark mode and would
                    put a bright wash over a dark page. */}
                <button
                  type="button"
                  className="recaptcha-modal__backdrop absolute inset-0 bg-site-ink-bg/70"
                  aria-label={t("auth.recaptchaModalClose")}
                  onClick={() => {
                    closeModal();
                    resolvePending(false);
                  }}
                />

                <div
                  ref={panelRef}
                  tabIndex={-1}
                  role="dialog"
                  aria-labelledby={headingId}
                  aria-describedby={descriptionId}
                  className="recaptcha-modal__panel relative z-1 w-full max-w-[min(24rem,calc(100vw-2rem))] rounded-site-card border border-site-line-strong bg-site-bg shadow-site-lg"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-site-line px-3.5 py-2.5">
                    <Ticket>{t("auth.recaptchaTicketLabel")}</Ticket>
                    <div className="flex items-center gap-2">
                      <StatusStamp state={stampState} label={stampLabel} />
                      <button
                        type="button"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-site-line text-site-muted transition-colors hover:border-site-brand-line hover:bg-site-brand-tint hover:text-site-brand-text sm:size-9"
                        aria-label={t("auth.recaptchaModalClose")}
                        onClick={() => {
                          closeModal();
                          resolvePending(false);
                        }}
                      >
                        <FiX className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="px-3.5 py-4 text-start sm:px-5">
                    <h2 id={headingId} className="text-site-h4 text-site-ink">
                      {t("auth.recaptchaModalTitle")}
                    </h2>
                    <p
                      id={descriptionId}
                      className="mt-1.5 text-site-sm text-site-fg"
                    >
                      {t("auth.recaptchaModalSubtitle")}
                    </p>

                    <div className="mt-4">{challengeWell}</div>
                    {failureAlert}
                  </div>

                  {stubFooter}
                </div>
              </div>,
              document.body,
            )}
        </div>
      );
    }

    /* Inline mode: the same stub, with the challenge in the body instead of
       behind a modal. The previous version painted a fake checkbox row and hid
       the real widget under it as a full-bleed overlay, which meant the control
       the user pointed at was not the control that was labelled. The widget is
       now the focal element of the block and states its own name. */
    return (
      <Card className={cn("w-full", className)}>
        {stubHeader}
        <div className="px-3 py-3.5 sm:px-3.5">
          {challengeWell}
          {failureAlert}
        </div>
        {stubFooter}
      </Card>
    );
  },
);

CustomRecaptcha.displayName = "CustomRecaptcha";

export default CustomRecaptcha;
