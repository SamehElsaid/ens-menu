"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { useLocale, useTranslations } from "next-intl";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiShield, FiX } from "react-icons/fi";
import { cn } from "@/lib/cn";

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

    const openModal = useCallback(() => {
      if (status !== "verified") {
        setStatus("boot");
      }
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

    if (isDev) {
      return null;
    }

    if (mode === "on-demand") {
      return (
        <div
          className={cn(silent ? "sr-only" : "w-full", className)}
          aria-hidden={silent}
        >
          {!silent &&
            (isVerified ? (
              <div className="register-recaptcha-trust register-recaptcha-trust--verified inline-flex items-center gap-2 rounded-lg border border-emerald-200/70 bg-emerald-50/80 px-3 py-2 text-[12px] font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                <FiCheck size={14} strokeWidth={2.5} aria-hidden />
                {t("auth.recaptchaVerifiedHint")}
              </div>
            ) : (
              <p className="register-recaptcha-trust inline-flex items-center gap-2 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                <FiShield size={13} strokeWidth={2} aria-hidden />
                {t("auth.recaptchaOnSubmit")}
              </p>
            ))}

          {mounted &&
            modalOpen &&
            createPortal(
              <div
                className={cn(
                  "recaptcha-modal fixed inset-0 z-[250] flex items-center justify-center p-4",
                  modalVisible
                    ? "recaptcha-modal--visible"
                    : "recaptcha-modal--hidden",
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="recaptcha-modal-title"
              >
                <button
                  type="button"
                  className="recaptcha-modal__backdrop absolute inset-0 bg-slate-950/55 backdrop-blur-[3px]"
                  aria-label={t("auth.recaptchaModalClose")}
                  onClick={() => {
                    closeModal();
                    resolvePending(false);
                  }}
                />

                <div className="recaptcha-modal__panel relative z-1 w-full max-w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.35)] dark:border-slate-700/60 dark:bg-slate-900">
                  <button
                    type="button"
                    className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label={t("auth.recaptchaModalClose")}
                    onClick={() => {
                      closeModal();
                      resolvePending(false);
                    }}
                  >
                    <FiX size={18} />
                  </button>

                  <div className="pe-8 text-start">
                    <p
                      id="recaptcha-modal-title"
                      className="text-[15px] font-semibold text-slate-900 dark:text-white"
                    >
                      {t("auth.recaptchaModalTitle")}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {t("auth.recaptchaModalSubtitle")}
                    </p>
                  </div>

                  <div
                    className="relative mt-4 flex justify-center rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50"
                    onPointerDown={() => {
                      if (status === "idle") setLoading(true);
                    }}
                  >
                    {widget}
                    {(isBoot || loading) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 rounded-xl bg-white/95 backdrop-blur-[2px] dark:bg-slate-950/92">
                        <span className="recaptcha-modal__loader rounded-full border-[3px] border-purple-200 border-t-purple-600 dark:border-purple-900 dark:border-t-purple-400" />
                        <p className="px-4 text-center text-[13px] font-semibold text-purple-700 dark:text-purple-300">
                          {isBoot
                            ? t("auth.recaptchaBoot")
                            : t("auth.recaptchaVerifying")}
                        </p>
                      </div>
                    )}
                  </div>

                  {isRejected && (
                    <p className="mt-3 text-center text-[12px] font-medium text-red-600 dark:text-red-400">
                      {t("auth.recaptchaRejectedHint")}
                    </p>
                  )}
                </div>
              </div>,
              document.body,
            )}
        </div>
      );
    }

    const title = isVerified
      ? t("auth.recaptchaVerified")
      : isRejected
        ? t("auth.recaptchaRejected")
        : loading
          ? t("auth.recaptchaVerifying")
          : t("auth.recaptchaLabel");

    const hint = isVerified
      ? t("auth.recaptchaVerifiedHint")
      : isRejected
        ? t("auth.recaptchaRejectedHint")
        : loading
          ? t("auth.recaptchaVerifyingHint")
          : t("auth.recaptchaHint");

    return (
      <div className={cn("w-full", className)}>
        <div
          className={cn(
            "relative w-full rounded-xl border transition-all duration-300",
            !isVerified && "min-h-[5.5rem] overflow-hidden",
            isVerified && "overflow-hidden",
            isVerified
              ? "border-emerald-400/70 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-950/20"
              : isRejected
                ? "border-red-300/80 bg-red-50/80 dark:border-red-500/30 dark:bg-red-950/20"
                : "border-slate-200/80 bg-white/80 hover:border-purple-200/80 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-purple-500/25",
            status === "idle" &&
              !isVerified &&
              "cursor-pointer active:scale-[0.995]",
          )}
        >
          <div className="pointer-events-none relative z-[1] flex items-center gap-3 px-3.5 py-3 select-none">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all duration-300",
                isVerified
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : isRejected
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800",
              )}
            >
              {isVerified ? (
                <FiCheck size={14} strokeWidth={2.5} />
              ) : (
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-200 dark:bg-slate-600" />
              )}
            </div>

            <div className="min-w-0 flex-1 text-start">
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                {title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {hint}
              </p>
            </div>

            <FiShield
              size={16}
              className={cn(
                "shrink-0",
                isVerified
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-purple-500 dark:text-purple-400",
              )}
              aria-hidden
            />
          </div>

          {!isVerified && (
            <div
              className={cn(
                "absolute inset-0 z-10 overflow-hidden",
                isRejected ? "pointer-events-none" : "cursor-pointer",
              )}
              onPointerDown={() => {
                if (status === "idle") setLoading(true);
              }}
              aria-hidden
            >
              <div className="flex h-full w-full items-center justify-center px-2">
                <div className="pointer-events-auto w-full max-w-[304px]">
                  {widget}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

CustomRecaptcha.displayName = "CustomRecaptcha";

export default CustomRecaptcha;
