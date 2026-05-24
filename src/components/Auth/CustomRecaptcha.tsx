"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaCheck, FaShieldAlt, FaSpinner, FaTimes } from "react-icons/fa";
import Loader from "@/components/Global/Loader";

const RECAPTCHA_SITE_KEY = "6LfZunYsAAAAAChMIIbG-lhkDy6uMnAgm9cfZnrN";
const REJECT_RESET_MS = 2500;

type RecaptchaStatus = "boot" | "idle" | "verified" | "rejected";

interface CustomRecaptchaProps {
  onVerifiedChange: (verified: boolean) => void;
  className?: string;
}

export default function CustomRecaptcha({
  onVerifiedChange,
  className = "",
}: CustomRecaptchaProps) {
  const t = useTranslations("");
  const locale = useLocale();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const rejectTimeoutRef = useRef<number | null>(null);

  const [status, setStatus] = useState<RecaptchaStatus>("boot");
  const [loading, setLoading] = useState(false);

  const clearRejectTimeout = useCallback(() => {
    if (rejectTimeoutRef.current !== null) {
      window.clearTimeout(rejectTimeoutRef.current);
      rejectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearRejectTimeout(), [clearRejectTimeout]);

  const handleChange = (token: string | null) => {
    setLoading(false);
    clearRejectTimeout();

    if (token) {
      setStatus("verified");
      onVerifiedChange(true);
      return;
    }

    setStatus("rejected");
    onVerifiedChange(false);
    recaptchaRef.current?.reset();

    rejectTimeoutRef.current = window.setTimeout(() => {
      setStatus((s) => (s === "rejected" ? "idle" : s));
      rejectTimeoutRef.current = null;
    }, REJECT_RESET_MS);
  };

  const handleExpired = () => {
    setLoading(false);
    clearRejectTimeout();
    setStatus("rejected");
    onVerifiedChange(false);
    recaptchaRef.current?.reset();

    rejectTimeoutRef.current = window.setTimeout(() => {
      setStatus((s) => (s === "rejected" ? "idle" : s));
      rejectTimeoutRef.current = null;
    }, REJECT_RESET_MS);
  };

  const handleError = () => {
    setLoading(false);
    clearRejectTimeout();
    setStatus("idle");
    onVerifiedChange(false);
    recaptchaRef.current?.reset();
  };

  const handleClick = () => {
    if (status !== "idle") return;
    setLoading(true);
  };

  const isBoot = status === "boot";
  const isIdle = status === "idle";
  const isVerified = status === "verified";
  const isRejected = status === "rejected";

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
    <div className={`w-full ${className}`}>
      <div
        className={`relative w-full overflow-hidden rounded-2xl border transition-all duration-300 ${isVerified
            ? "border-emerald-400/70 bg-linear-to-r from-emerald-50/95 to-white shadow-inner shadow-emerald-500/15 dark:border-emerald-500/40 dark:from-emerald-950/30 dark:to-slate-900/40"
            : isRejected
              ? "border-red-300/80 bg-linear-to-r from-red-50/90 to-white shadow-inner shadow-red-500/10 dark:border-red-500/40 dark:from-red-950/25 dark:to-slate-900/50"
              : loading
                ? "border-accent-purple/50 bg-linear-to-r from-violet-50/90 to-white shadow-inner shadow-accent-purple/10 dark:border-purple-500/40 dark:from-purple-950/25 dark:to-slate-900/50"
                : "border-slate-200/90 bg-linear-to-r from-white/95 to-slate-50/80 shadow-inner shadow-slate-900/5 hover:border-accent-purple/35 hover:shadow-accent-purple/10 dark:border-slate-700 dark:from-slate-900/70 dark:to-slate-800/50 dark:hover:border-purple-500/35"
          } ${isIdle ? "cursor-pointer active:scale-[0.99]" : ""}`}
      >
        {/* Boot loader */}
        {isBoot && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white backdrop-blur-[1px] dark:bg-slate-900">
            <Loader />
          </div>
        )}

        {/* Card content */}
        <div className="pointer-events-none relative z-[1] flex items-center gap-3 px-4 py-4 select-none">
          {/* Checkbox */}
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ${isVerified
                ? "scale-105 border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                : isRejected
                  ? "border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/25"
                  : loading
                    ? "border-accent-purple/50 bg-white dark:border-purple-500/50 dark:bg-slate-800"
                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
              }`}
          >
            {isVerified ? (
              <FaCheck className="h-3.5 w-3.5" />
            ) : isRejected ? (
              <FaTimes className="h-3.5 w-3.5" />
            ) : loading ? (
              <FaSpinner className="h-3.5 w-3.5 animate-spin text-accent-purple dark:text-purple-300" />
            ) : (
              <span className="h-3.5 w-3.5 rounded-sm bg-slate-100 dark:bg-slate-700" />
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-semibold transition-colors duration-300 ${isVerified
                  ? "text-emerald-700 dark:text-emerald-300"
                  : isRejected
                    ? "text-red-700 dark:text-red-300"
                    : loading
                      ? "text-accent-purple dark:text-purple-300"
                      : "text-slate-700 dark:text-slate-200"
                }`}
            >
              {title}
            </p>
            <p
              className={`text-xs transition-colors duration-300 ${isVerified
                  ? "text-emerald-600/80 dark:text-emerald-400/80"
                  : isRejected
                    ? "text-red-600/80 dark:text-red-400/80"
                    : loading
                      ? "text-accent-purple/80 dark:text-purple-300/80"
                      : "text-slate-500 dark:text-slate-400"
                }`}
            >
              {hint}
            </p>
          </div>

          {/* Icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${isVerified
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                : isRejected
                  ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                  : loading
                    ? "bg-accent-purple/15 text-accent-purple dark:bg-purple-500/20 dark:text-purple-300"
                    : "bg-accent-purple/10 text-accent-purple dark:bg-purple-500/15 dark:text-purple-300"
              }`}
          >
            {loading ? (
              <FaSpinner className="h-4 w-4 animate-spin" />
            ) : isRejected ? (
              <FaTimes className="h-4 w-4" />
            ) : (
              <FaShieldAlt className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Hidden reCAPTCHA overlay */}
        {!isVerified && (
          <div
            className={`absolute inset-0 z-10 opacity-[0.01] ${isRejected ? "pointer-events-none" : "cursor-pointer"}`}
            onPointerDown={handleClick}
            aria-hidden
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              <div className="min-h-[78px] min-w-[304px] scale-[2.8]">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  hl={locale}
                  onLoadCapture={() => setStatus("idle")}
                  onChange={handleChange}
                  onExpired={handleExpired}
                  onErrored={handleError}
                />
              </div>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="pointer-events-none absolute inset-0 hidden sm:block">
            <div className="absolute -top-8 -end-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
          </div>
        )}
      </div>
    </div>
  );
}
