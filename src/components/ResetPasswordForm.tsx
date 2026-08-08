"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FiMail } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useState } from "react";

import { Alert, Field, Input, PasswordInput } from "@/components/site/Form";
import { SiteButton } from "@/components/site/Button";
import LinkTo from "@/components/Global/LinkTo";
import { axiosPost } from "@/shared/axiosCall";
import { useRouter } from "@/i18n/navigation";
import {
  forgotPasswordSchema,
  ForgotPasswordSchema,
  resetPasswordSchema,
  ResetPasswordSchema,
} from "@/schemas/resetPasswordSchema";

type ForgotPasswordPayload = {
  email: string;
  locale: string;
};

type ResetPasswordPayload = {
  token: string;
  newPassword: string;
  locale: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

function getApiErrorMessage(data: unknown) {
  const payload = data as ApiErrorResponse;
  return payload?.error || payload?.message || null;
}

/** Both branches of this screen end the same way; only the label differs. */
function SubmitAndReturn({
  label,
  backLabel,
  loading,
}: {
  label: string;
  backLabel: string;
  loading: boolean;
}) {
  return (
    <>
      <SiteButton
        type="submit"
        loading={loading}
        block
        size="lg"
        className="mt-6"
      >
        {label}
      </SiteButton>

      <div className="mt-5 text-center">
        <LinkTo
          href="/auth/login"
          className="text-site-sm text-site-muted underline underline-offset-4 hover:text-site-ink"
        >
          {backLabel}
        </LinkTo>
      </div>
    </>
  );
}

export default function ResetPasswordForm() {
  const t = useTranslations("");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const forgotForm = useForm<ForgotPasswordSchema>({
    defaultValues: { email: "" },
    resolver: yupResolver(
      forgotPasswordSchema(t),
    ) as unknown as Resolver<ForgotPasswordSchema>,
    mode: "onChange",
  });

  const resetForm = useForm<ResetPasswordSchema>({
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
    resolver: yupResolver(
      resetPasswordSchema(t),
    ) as unknown as Resolver<ResetPasswordSchema>,
    mode: "onChange",
  });

  const onSubmitForgotPassword = async (data: ForgotPasswordSchema) => {
    setLoading(true);
    const payload: ForgotPasswordPayload = {
      email: data.email,
      locale,
    };
    const response = await axiosPost<ForgotPasswordPayload, unknown>(
      "/auth/forgot-password",
      locale,
      payload,
      false,
      true,
    );
    setLoading(false);

    if (response.status) {
      setLinkSent(true);
      toast.success(t("auth.resetLinkSent"));
      return;
    }

    const apiMessage = getApiErrorMessage(response.data);
    if (apiMessage) toast.error(apiMessage);
  };

  const onSubmitResetPassword = async (data: ResetPasswordSchema) => {
    if (!token) {
      toast.error(t("auth.invalidResetToken"));
      return;
    }

    setLoading(true);
    const payload: ResetPasswordPayload = {
      token,
      newPassword: data.newPassword,
      locale,
    };
    const response = await axiosPost<ResetPasswordPayload, unknown>(
      "/auth/reset-password",
      locale,
      payload,
      false,
      true,
    );
    setLoading(false);

    if (response.status) {
      toast.success(t("auth.resetPasswordSuccess"));
      router.push("/auth/login");
      return;
    }

    const apiMessage = getApiErrorMessage(response.data);
    if (apiMessage) toast.error(apiMessage);
  };

  if (token) {
    return (
      <form
        onSubmit={resetForm.handleSubmit(onSubmitResetPassword)}
        noValidate
        className="space-y-4"
      >
        <Controller
          control={resetForm.control}
          name="newPassword"
          render={({ field: { value, onChange } }) => (
            <Field
              label={t("auth.newPassword")}
              error={resetForm.formState.errors.newPassword?.message}
              htmlFor="new-password"
            >
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                invalid={Boolean(resetForm.formState.errors.newPassword)}
                showLabel={t("auth.showPassword")}
                hideLabel={t("auth.hidePassword")}
                value={value}
                onChange={onChange}
              />
            </Field>
          )}
        />

        <Controller
          control={resetForm.control}
          name="confirmNewPassword"
          render={({ field: { value, onChange } }) => (
            <Field
              label={t("auth.confirmNewPassword")}
              error={resetForm.formState.errors.confirmNewPassword?.message}
              htmlFor="confirm-new-password"
            >
              <PasswordInput
                id="confirm-new-password"
                autoComplete="new-password"
                invalid={Boolean(resetForm.formState.errors.confirmNewPassword)}
                showLabel={t("auth.showPassword")}
                hideLabel={t("auth.hidePassword")}
                value={value}
                onChange={onChange}
              />
            </Field>
          )}
        />

        <SubmitAndReturn
          label={t("auth.resetPasswordSubmit")}
          backLabel={t("auth.backToLogin")}
          loading={loading}
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={forgotForm.handleSubmit(onSubmitForgotPassword)}
      noValidate
      className="space-y-4"
    >
      <Controller
        control={forgotForm.control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <Field
            label={t("auth.email")}
            error={forgotForm.formState.errors.email?.message}
            htmlFor="forgot-email"
          >
            <Input
              id="forgot-email"
              type="email"
              inputMode="email"
              startIcon={<FiMail className="size-4" />}
              autoComplete="email"
              invalid={Boolean(forgotForm.formState.errors.email)}
              value={value}
              onChange={onChange}
            />
          </Field>
        )}
      />

      {linkSent ? (
        <Alert tone="positive">{t("auth.resetLinkSent")}</Alert>
      ) : null}

      <SubmitAndReturn
        label={t("auth.sendResetLink")}
        backLabel={t("auth.backToLogin")}
        loading={loading}
      />
    </form>
  );
}
