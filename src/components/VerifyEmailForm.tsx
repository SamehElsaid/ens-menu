"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FiAlertCircle, FiArrowRight, FiCheck, FiMail } from "react-icons/fi";
import LinkTo from "@/components/Global/LinkTo";
import { Button } from "@/components/ui/Button";
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

const TONE = {
  loading: {
    shell: "bg-brand-soft text-brand ring-brand-line",
    title: "text-fg",
  },
  success: {
    shell: "bg-success-soft text-success ring-success-line",
    title: "text-success-fg",
  },
  error: {
    shell: "bg-danger-soft text-danger ring-danger-line",
    title: "text-danger-fg",
  },
} as const;

function StatusIcon({ variant }: { variant: StatusVariant }) {
  const shellClass = cn(
    "relative flex size-16 items-center justify-center rounded-2xl ring-1",
    TONE[variant].shell,
  );

  if (variant === "loading") {
    return (
      <div className={shellClass} aria-hidden>
        <FiMail className="size-7" />
        <span className="absolute -inset-1 animate-spin rounded-2xl border-2 border-brand-line border-t-brand" />
      </div>
    );
  }

  return (
    <div className={shellClass} aria-hidden>
      {variant === "success" ? (
        <FiCheck className="size-8 stroke-[2.5]" />
      ) : (
        <FiAlertCircle className="size-7" />
      )}
    </div>
  );
}

/**
 * Single panel for all three verification outcomes. The result is announced
 * politely because it arrives after the page has already settled.
 */
function VerifyStatusPanel({
  variant,
  title,
  description,
  detail,
  children,
}: {
  variant: StatusVariant;
  title: string;
  description: string;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full text-center"
    >
      <div className="mx-auto flex max-w-sm flex-col items-center gap-5">
        <StatusIcon variant={variant} />

        <div className="space-y-1.5">
          <h2
            className={cn(
              "text-lg font-semibold tracking-[-0.014em]",
              TONE[variant].title,
            )}
          >
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-fg-muted">{description}</p>
          {detail ? (
            <p className="text-[13px] leading-relaxed text-fg-subtle">
              {detail}
            </p>
          ) : null}
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

  if (state === "loading") {
    return (
      <VerifyStatusPanel
        variant="loading"
        title={t("auth.verifyEmailTitle")}
        description={t("auth.verifyEmailLoading")}
        detail={t("auth.verifyEmailDescription")}
      />
    );
  }

  if (state === "success") {
    return (
      <VerifyStatusPanel
        variant="success"
        title={t("auth.verifyEmailSuccessTitle")}
        description={t("auth.verifyEmailSuccess")}
      >
        <Button
          onClick={() => {
            window.location.href = localizeHref("/auth/login", locale);
          }}
          fullWidth
        >
          {t("auth.login")}
        </Button>
      </VerifyStatusPanel>
    );
  }

  return (
    <VerifyStatusPanel
      variant="error"
      title={t("auth.verifyEmailErrorTitle")}
      description={
        state === "missing"
          ? t("auth.verifyEmailMissingToken")
          : t("auth.verifyEmailFailed")
      }
    >
      {email ? (
        <Button onClick={handleResend} loading={resending} fullWidth>
          {t("auth.resendVerification")}
        </Button>
      ) : null}
      <LinkTo
        href="/auth/login"
        className="inline-flex items-center justify-center gap-2 rounded-md py-1 text-[13px] font-medium text-fg-muted transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <FiArrowRight className="size-4 shrink-0 rtl:rotate-180" aria-hidden />
        <span>{t("auth.backToLogin")}</span>
      </LinkTo>
    </VerifyStatusPanel>
  );
}
