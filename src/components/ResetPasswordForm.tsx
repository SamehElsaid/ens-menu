"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaEnvelope } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useState } from "react";

import CustomInput from "@/components/Custom/CustomInput";
import CustomBtn from "@/components/Custom/CustomBtn";
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
        className="space-y-3"
      >
        <Controller
          control={resetForm.control}
          name="newPassword"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="password"
              placeholder={t("auth.newPassword")}
              id="newPassword"
              icon={<TbLockPassword />}
              label={t("auth.newPassword")}
              error={resetForm.formState.errors.newPassword?.message}
              value={value}
              onChange={onChange}
            />
          )}
        />

        <Controller
          control={resetForm.control}
          name="confirmNewPassword"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="password"
              placeholder={t("auth.confirmNewPassword")}
              id="confirmNewPassword"
              icon={<TbLockPassword />}
              label={t("auth.confirmNewPassword")}
              error={resetForm.formState.errors.confirmNewPassword?.message}
              value={value}
              onChange={onChange}
            />
          )}
        />

        <div className="flex w-full mt-8">
          <CustomBtn
            text={t("auth.resetPasswordSubmit")}
            type="submit"
            loading={loading}
          />
        </div>

        <div className="flex items-center justify-center mt-6">
          <LinkTo
            href="/auth/login"
            className="text-sm font-medium text-center text-slate-700 dark:text-slate-300 hover:text-accent-purple/80 transition-all duration-200"
          >
            {t("auth.backToLogin")}
          </LinkTo>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={forgotForm.handleSubmit(onSubmitForgotPassword)}
      className="space-y-3"
    >
      <Controller
        control={forgotForm.control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="email"
            placeholder={t("auth.email")}
            id="email"
            icon={<FaEnvelope />}
            label={t("auth.email")}
            error={forgotForm.formState.errors.email?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      {linkSent ? (
        <p className="text-sm text-green-600 dark:text-green-400">
          {t("auth.resetLinkSent")}
        </p>
      ) : null}

      <div className="flex w-full mt-8">
        <CustomBtn
          text={t("auth.sendResetLink")}
          type="submit"
          loading={loading}
        />
      </div>

      <div className="flex items-center justify-center mt-6">
        <LinkTo
          href="/auth/login"
          className="text-sm font-medium text-center text-slate-700 dark:text-slate-300 hover:text-accent-purple/80 transition-all duration-200"
        >
          {t("auth.backToLogin")}
        </LinkTo>
      </div>
    </form>
  );
}
