"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiMail,
} from "react-icons/fi";
import LinkTo from "@/components/Global/LinkTo";
import CustomBtn from "@/components/Custom/CustomBtn";
import { localizeHref } from "@/i18n/routing";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { cn } from "@/lib/cn";
import { toast } from "react-toastify";

type VerifyState = "loading" | "success" | "error" | "missing";

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

type StatusVariant = "loading" | "success" | "error";

function getApiErrorMessage(data: unknown) {
  const payload = data as ApiErrorResponse;
  return payload?.error || payload?.message || null;
}

function StatusIcon({
  variant,
  className,
}: {
  variant: StatusVariant;
  className?: string;
}) {
  const shellClass = cn(
    "relative flex size-[72px] items-center justify-center rounded-2xl ring-1",
    variant === "loading" &&
      "bg-purple-50 text-royal-purple ring-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:ring-purple-500/25",
    variant === "success" &&
      "bg-emerald-50 text-emerald-600 ring-emerald-200/80 dark:bg-emerald-950/35 dark:text-emerald-400 dark:ring-emerald-500/25",
    variant === "error" &&
      "bg-red-50 text-red-600 ring-red-200/80 dark:bg-red-950/35 dark:text-red-400 dark:ring-red-500/25",
    className,
  );

  if (variant === "loading") {
    return (
      <div className={shellClass} aria-hidden>
        <FiMail className="size-8" />
        <span className="absolute -inset-1 rounded-2xl border-2 border-purple-400/30 border-t-purple-600 animate-spin dark:border-purple-500/20 dark:border-t-purple-400" />
      </div>
    );
  }

  if (variant === "success") {
    return (
      <div className={shellClass} aria-hidden>
        <FiCheck className="size-9 stroke-[2.5]" />
      </div>
    );
  }

  return (
    <div className={shellClass} aria-hidden>
      <FiAlertCircle className="size-8" />
    </div>
  );
}

function VerifyStatusPanel({
  isRtl,
  variant,
  title,
  description,
  children,
}: {
  isRtl: boolean;
  variant: StatusVariant;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "verify-email-status w-full rounded-2xl border px-5 py-8 text-center sm:px-6",
        variant === "loading" &&
          "border-purple-200/70 bg-linear-to-b from-purple-50/80 to-white dark:border-purple-500/20 dark:from-purple-950/25 dark:to-[#0d1117]",
        variant === "success" &&
          "border-emerald-200/70 bg-linear-to-b from-emerald-50/80 to-white dark:border-emerald-500/20 dark:from-emerald-950/20 dark:to-[#0d1117]",
        variant === "error" &&
          "border-red-200/70 bg-linear-to-b from-red-50/70 to-white dark:border-red-500/20 dark:from-red-950/20 dark:to-[#0d1117]",
      )}
    >
      <div className="mx-auto flex max-w-sm flex-col items-center gap-5">
        <StatusIcon variant={variant} />

        <div className="space-y-2">
          <h3
            className={cn(
              "text-lg font-bold tracking-tight",
              variant === "loading" && "text-royal-purple dark:text-purple-300",
              variant === "success" &&
                "text-emerald-700 dark:text-emerald-300",
              variant === "error" && "text-red-700 dark:text-red-300",
            )}
          >
            {title}
          </h3>
          <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        {children ? (
          <div className="flex w-full flex-col items-stretch gap-3 pt-1">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function VerifyEmailForm() {
  const t = useTranslations("");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";

  const [state, setState] = useState<VerifyState>(
    token ? "loading" : "missing",
  );
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const verify = async () => {
      const response = await axiosGet<{ message?: string }>(
        `/auth/verify-email?token=${encodeURIComponent(token)}`,
        locale,
        undefined,
        undefined,
        true,
      );

      if (cancelled) return;

      setState(response.status ? "success" : "error");
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token, locale]);

  const handleResend = async () => {
    if (!email) {
      toast.info(t("auth.verifyEmailMissingToken"));
      return;
    }

    setResending(true);
    const response = await axiosPost<{ email: string; locale: string }, unknown>(
      "/auth/resend-verification",
      locale,
      { email, locale },
      false,
      true,
    );
    setResending(false);

    if (response.status) {
      toast.success(t("auth.resendVerificationSuccess"));
      return;
    }

    toast.error(getApiErrorMessage(response.data) || t("auth.verifyEmailFailed"));
  };

  const BackToLoginLink = () => {
    const Arrow = isRtl ? FiArrowLeft : FiArrowRight;

    return (
      <LinkTo
        href="/auth/login"
        className="inline-flex items-center justify-center gap-2 text-[13px] font-medium text-slate-600 transition-colors hover:text-royal-purple dark:text-slate-400 dark:hover:text-purple-300"
      >
        <Arrow className="size-4 shrink-0 rtl:rotate-180" aria-hidden />
        <span>{t("auth.backToLogin")}</span>
      </LinkTo>
    );
  };

  if (state === "loading") {
    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="verify-email-status w-full rounded-2xl border border-purple-200/70 bg-linear-to-b from-purple-50/80 to-white px-5 py-10 text-center dark:border-purple-500/20 dark:from-purple-950/25 dark:to-[#0d1117] sm:px-6"
      >
        <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
          <StatusIcon variant="loading" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-royal-purple dark:text-purple-300">
              {t("auth.verifyEmailTitle")}
            </h3>
            <p className="text-[14px] font-medium text-slate-700 dark:text-slate-300">
              {t("auth.verifyEmailLoading")}
            </p>
            <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              {t("auth.verifyEmailDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <VerifyStatusPanel
        isRtl={isRtl}
        variant="success"
        title={t("auth.verifyEmailSuccessTitle")}
        description={t("auth.verifyEmailSuccess")}
      >
        <CustomBtn
          type="button"
          onClick={() => {
            window.location.href = localizeHref("/auth/login", locale);
          }}
          text={t("auth.login")}
          className="w-full"
        />
      </VerifyStatusPanel>
    );
  }

  return (
    <VerifyStatusPanel
      isRtl={isRtl}
      variant="error"
      title={t("auth.verifyEmailErrorTitle")}
      description={
        state === "missing"
          ? t("auth.verifyEmailMissingToken")
          : t("auth.verifyEmailFailed")
      }
    >
      {email ? (
        <CustomBtn
          type="button"
          onClick={handleResend}
          loading={resending}
          disabled={resending}
          text={t("auth.resendVerification")}
          className="w-full"
        />
      ) : null}
      <BackToLoginLink />
    </VerifyStatusPanel>
  );
}
