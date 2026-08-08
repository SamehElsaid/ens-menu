"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FiAlertCircle, FiCheck, FiMail } from "react-icons/fi";
import LinkTo from "@/components/Global/LinkTo";
import { SiteButton, SiteSpinner } from "@/components/site/Button";
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

const TONE: Record<StatusVariant, string> = {
  loading: "bg-site-brand-tint text-site-brand ring-site-brand-line",
  success: "bg-site-positive-tint text-site-positive ring-site-positive/20",
  error: "bg-site-critical-tint text-site-critical ring-site-critical/20",
};

function StatusIcon({ variant }: { variant: StatusVariant }) {
  const shell = cn(
    "flex size-16 items-center justify-center rounded-site-lg ring-1 ring-inset",
    TONE[variant],
  );

  if (variant === "loading") {
    return (
      <div className={shell} aria-hidden>
        <FiMail className="size-7" />
      </div>
    );
  }

  return (
    <div className={shell} aria-hidden>
      {variant === "success" ? (
        <FiCheck className="size-8 stroke-[2.5]" />
      ) : (
        <FiAlertCircle className="size-7" />
      )}
    </div>
  );
}

/**
 * One panel for all three verification outcomes. The result arrives after the
 * page has settled, so it is announced politely rather than interrupting.
 */
function VerifyStatusPanel({
  variant,
  title,
  description,
  children,
}: {
  variant: StatusVariant;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" className="text-center">
      <div className="flex flex-col items-center gap-6">
        <StatusIcon variant={variant} />

        <div>
          <h1 className="text-site-h3">{title}</h1>
          <p className="mt-2.5 text-site-body text-site-fg">
            {description}
            {variant === "loading" ? (
              <SiteSpinner className="ms-2 inline-block align-[-0.2em]" />
            ) : null}
          </p>
        </div>

        {children ? (
          <div className="flex w-full flex-col items-stretch gap-3">
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
    const response = await axiosPost<
      { email: string; locale: string },
      unknown
    >("/auth/resend-verification", locale, { email, locale }, false, true);
    setResending(false);

    if (response.status) {
      toast.success(t("auth.resendVerificationSuccess"));
      return;
    }

    toast.error(
      getApiErrorMessage(response.data) || t("auth.verifyEmailFailed"),
    );
  };

  const backToLogin = (
    <LinkTo
      href="/auth/login"
      className="text-site-sm text-site-muted underline underline-offset-4 hover:text-site-ink"
    >
      {t("auth.backToLogin")}
    </LinkTo>
  );

  if (state === "loading") {
    return (
      <VerifyStatusPanel
        variant="loading"
        title={t("auth.verifyEmailTitle")}
        description={t("auth.verifyEmailLoading")}
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
        <SiteButton
          size="lg"
          block
          onClick={() => {
            window.location.href = localizeHref("/auth/login", locale);
          }}
        >
          {t("auth.login")}
        </SiteButton>
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
        <SiteButton size="lg" block onClick={handleResend} loading={resending}>
          {t("auth.resendVerification")}
        </SiteButton>
      ) : null}
      {backToLogin}
    </VerifyStatusPanel>
  );
}
