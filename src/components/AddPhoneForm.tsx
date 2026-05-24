"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useState } from "react";
import { FaPhone } from "react-icons/fa";

import CustomInput from "@/components/Custom/CustomInput";
import CustomBtn from "@/components/Custom/CustomBtn";
import LinkTo from "@/components/Global/LinkTo";
import { axiosPost } from "@/shared/axiosCall";
import { useRouter } from "@/i18n/navigation";
import { addPhoneSchema, AddPhoneSchema } from "@/schemas/addPhoneSchema";
import { patchAuthCookie } from "@/shared/authCookie";

type AddPhonePayload = {
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

export default function AddPhoneForm() {
  const t = useTranslations("");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPhoneSchema>({
    defaultValues: { phone: "" },
    resolver: yupResolver(
      addPhoneSchema(t),
    ) as unknown as Resolver<AddPhoneSchema>,
    mode: "onChange",
  });

  const onSubmit = async (data: AddPhoneSchema) => {
    setLoading(true);
    const payload: AddPhonePayload = {
      phoneNumber: data.phone,
      locale,
    };
    const response = await axiosPost<AddPhonePayload, unknown>(
      "/auth/add-phone",
      locale,
      payload,
      false,
      false,
    );
    setLoading(false);

    if (response.status) {
      sessionStorage.setItem("pendingPhoneVerification", data.phone);
      patchAuthCookie({
        phoneNumber: data.phone,
        phoneVerified: false,
      });
      toast.success(t("auth.verificationCodeSent"));
      router.push(`/auth/verify-phone?phone=${encodeURIComponent(data.phone)}`);
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
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-4">
        {t("auth.addPhoneHint")}
      </p>

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="tel"
            placeholder={t("auth.phone")}
            id="phone"
            icon={<FaPhone />}
            label={t("auth.phone")}
            error={errors.phone?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <div className="flex w-full mt-8">
        <CustomBtn
          text={t("auth.sendVerificationCode")}
          type="submit"
          loading={loading}
        />
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
