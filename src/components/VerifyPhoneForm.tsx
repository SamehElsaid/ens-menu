"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

import OtpInput from "@/components/Custom/OtpInput";
import CustomBtn from "@/components/Custom/CustomBtn";
import LinkTo from "@/components/Global/LinkTo";
import { axiosPost } from "@/shared/axiosCall";
import { useRouter } from "@/i18n/navigation";
import {
  verifyPhoneSchema,
  VerifyPhoneSchema,
} from "@/schemas/verifyPhoneSchema";
import { patchAuthCookie, readAuthCookie } from "@/shared/authCookie";

type VerifyPhonePayload = {
  phoneNumber: string;
  code: string;
};

type ResendPayload = {
  phoneNumber: string;
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

export default function VerifyPhoneForm() {
  const t = useTranslations("");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromQuery = searchParams.get("phone")?.trim() || "";

  const [phoneNumber, setPhoneNumber] = useState(phoneFromQuery);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (phoneFromQuery) {
      setPhoneNumber(phoneFromQuery);
      return;
    }
    const stored = sessionStorage.getItem("pendingPhoneVerification");
    if (stored) setPhoneNumber(stored);
  }, [phoneFromQuery]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyPhoneSchema>({
    defaultValues: { code: "" },
    resolver: yupResolver(
      verifyPhoneSchema(t),
    ) as unknown as Resolver<VerifyPhoneSchema>,
    mode: "onChange",
  });

  const codeValue = watch("code");

  const onSubmit = async (data: VerifyPhoneSchema) => {
    if (!phoneNumber) {
      toast.error(t("auth.phoneRequired"));
      return;
    }

    setLoading(true);
    const payload: VerifyPhonePayload = {
      phoneNumber,
      code: data.code,
    };
    const response = await axiosPost<VerifyPhonePayload, unknown>(
      "/auth/verify-phone",
      locale,
      payload,
      false,
      true,
    );
    setLoading(false);

    if (response.status) {
      sessionStorage.removeItem("pendingPhoneVerification");
      toast.success(t("auth.phoneVerifiedSuccess"));

      const auth = readAuthCookie();
      if (auth?.token) {
        patchAuthCookie({
          phoneVerified: true,
          phoneNumber,
        });
        router.push(auth.role === "admin" ? "/admin" : "/dashboard");
      } else {
        router.push("/auth/login");
      }
      return;
    }

    const apiMessage = getApiErrorMessage(response.data);
    if (apiMessage) toast.error(apiMessage);
  };

  const onResend = async () => {
    if (!phoneNumber || cooldown > 0) return;

    setResending(true);
    const payload: ResendPayload = { phoneNumber, locale };
    const response = await axiosPost<ResendPayload, unknown>(
      "/auth/resend-phone-verification",
      locale,
      payload,
      false,
      true,
    );
    setResending(false);

    if (response.status) {
      toast.success(t("auth.verificationCodeSent"));
      setCooldown(60);
      return;
    }

    const apiMessage = getApiErrorMessage(response.data);
    if (apiMessage) toast.error(apiMessage);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 text-slate-800 dark:text-slate-100"
    >
      {phoneNumber ? (
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-4">
          {t("auth.verifyPhoneHint", { phone: phoneNumber })}
        </p>
      ) : null}

      <Controller
        control={control}
        name="code"
        render={({ field: { value, onChange } }) => (
          <OtpInput
            value={value}
            onChange={onChange}
            label={t("auth.verificationCode")}
            error={errors.code?.message}
            disabled={loading}
          />
        )}
      />

      <div className="flex w-full mt-8">
        <CustomBtn
          text={t("auth.verifyPhone")}
          type="submit"
          loading={loading}
          disabled={!phoneNumber || codeValue.length !== 6}
        />
      </div>

      <div className="flex flex-col items-center gap-3 mt-4">
        <button
          type="button"
          onClick={onResend}
          disabled={!phoneNumber || resending || cooldown > 0}
          className="text-sm font-medium text-accent-purple dark:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cooldown > 0
            ? t("auth.resendCodeIn", { seconds: cooldown })
            : t("auth.resendCode")}
        </button>
      </div>

      <div className="flex items-center justify-center mt-6">
        <LinkTo
          href="/auth/login"
          className="text-sm font-medium text-center text-slate-700 dark:text-slate-300 hover:text-accent-purple/80 dark:hover:text-purple-400 transition-all duration-200"
        >
          {t("auth.backToLogin")}
        </LinkTo>
      </div>
    </form>
  );
}
