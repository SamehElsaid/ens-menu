"use client";
import { Controller, Resolver, useForm } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import { FaEnvelope, FaUser, FaPhone } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { registerSchema, RegisterSchema } from "@/schemas/registerSchema";
import LinkTo from "./Global/LinkTo";
import CustomBtn from "./Custom/CustomBtn";
import { useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const t = useTranslations("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(registerSchema(t)) as unknown as Resolver<RegisterSchema>,
    mode: "onChange",
  });

  const messages = {
    fullName: t("auth.fullName"),
    email: t("auth.email"),
    phone: t("auth.phone"),
    password: t("auth.password"),
    confirmPassword: t("auth.confirmPassword"),
    register: t("auth.register"),
  };

  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: RegisterSchema) => {
    if (!recaptchaVerified) {
      // يمكنك هنا إضافة توست / رسالة خطأ لو حابب
      return;
    }

    setLoading(true);
    // TODO: اربط هنا API التسجيل
    const dataSend = {
      name: data.fullName,
      email: data.email,
      phoneNumber: data.phone,
      password: data.password,
    };
    const response = await axiosPost<typeof dataSend, unknown>("/auth/signup", locale, dataSend, false, true);
    if (response.status) {
      toast.success(t("auth.registerSuccess"));
      router.push("/auth/login");
    } else {
      setLoading(false);
    }

  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Controller
        control={control}
        name="fullName"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="text"
            placeholder={messages.fullName}
            id="fullName"
            icon={<FaUser />}
            label={messages.fullName}
            error={errors.fullName?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="email"
            placeholder={messages.email}
            id="email"
            icon={<FaEnvelope />}
            label={messages.email}
            error={errors.email?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="tel"
            placeholder={messages.phone}
            id="phone"
            icon={<FaPhone />}
            label={messages.phone}
            error={errors.phone?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="password"
            placeholder={messages.password}
            id="password"
            icon={<TbLockPassword />}
            label={messages.password}
            error={errors.password?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="password"
            placeholder={messages.confirmPassword}
            id="confirmPassword"
            icon={<TbLockPassword />}
            label={messages.confirmPassword}
            error={errors.confirmPassword?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <div className="mt-4">
        <HCaptcha
          languageOverride={locale}
          sitekey="29aec278-e602-4efa-8578-f8144344a312"
          onVerify={() => {
            setRecaptchaVerified(true);
          }}
          onExpire={() => {
            setRecaptchaVerified(false);
          }}
          onError={() => {
            setRecaptchaVerified(false);
          }}
        />
      </div>

      <div className="flex w-full mt-8">
        <CustomBtn
          text={messages.register}
          type="submit"
          disabled={!recaptchaVerified}
          loading={loading}
        />
      </div>

      <div className="flex items-center justify-center mt-6">
        <LinkTo
          href="/auth/login"
          className="text-sm font-medium  text-center hover:text-accent-purple/80 transition-all duration-200"
        >
          {t("auth.haveAccount")}{" "}
          <span className="font-bold underline text-accent-purple">{t("auth.login")}</span>
        </LinkTo>
      </div>
    </form>
  );
}
