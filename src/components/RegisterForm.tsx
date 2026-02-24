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
import ReCAPTCHA from "react-google-recaptcha";
import { useCallback, useState } from "react";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/Auth/GoogleSignInButton";
import Loader from "./Global/Loader";

let emailCheckTimeout: ReturnType<typeof setTimeout> | null = null;
let lastCheckedAvailableEmail: string | null = null;
let phoneCheckTimeout: ReturnType<typeof setTimeout> | null = null;
let lastCheckedAvailablePhone: string | null = null;

export default function RegisterForm() {
  const t = useTranslations("");
  const locale = useLocale();

  const checkEmailAvailableDebounced = useCallback(
    (email: string): Promise<boolean> =>
      new Promise((resolve) => {
        if (emailCheckTimeout) clearTimeout(emailCheckTimeout);
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          resolve(true);
          return;
        }
        if (lastCheckedAvailableEmail === email) {
          resolve(true);
          return;
        }
        emailCheckTimeout = setTimeout(async () => {
          emailCheckTimeout = null;
          const res = await axiosGet<{ isAvailable?: boolean }>(
            "/auth/check-availability",
            locale,
            undefined,
            { email },
            true
          );
          const available =
            res.status === true && res.data?.isAvailable === true;
          if (available) lastCheckedAvailableEmail = email;
          resolve(available);
        }, 400);
      }),
    [locale]
  );

  const checkPhoneAvailableDebounced = useCallback(
    (phone: string): Promise<boolean> =>
      new Promise((resolve) => {
        if (phoneCheckTimeout) clearTimeout(phoneCheckTimeout);
        if (!phone || !/^\+?[0-9]{8,15}$/.test(phone)) {
          resolve(true);
          return;
        }
        if (lastCheckedAvailablePhone === phone) {
          resolve(true);
          return;
        }
        phoneCheckTimeout = setTimeout(async () => {
          phoneCheckTimeout = null;
          const res = await axiosGet<{ isAvailable?: boolean }>(
            "/auth/check-availability",
            locale,
            undefined,
            { phoneNumber: phone },
            true
          );
          const available =
            res.status === true && res.data?.isAvailable === true;
          if (available) lastCheckedAvailablePhone = phone;
          resolve(available);
        }, 400);
      }),
    [locale]
  );

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
    resolver: yupResolver(
      registerSchema(t, {
        checkEmailAvailable: checkEmailAvailableDebounced,
        checkPhoneAvailable: checkPhoneAvailableDebounced,
      }),
    ) as unknown as Resolver<RegisterSchema>,
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

  const [loading, setLoading] = useState(false);
  const [loadingLoader, setLoadingLoader] = useState(true);
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
    const response = await axiosPost<typeof dataSend, unknown>(
      "/auth/signup",
      locale,
      dataSend,
      false,
      true,
    );
    if (response.status) {
      toast.success(t("auth.registerSuccess"));
      router.push("/auth/login");
    } else {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 text-slate-800 dark:text-slate-100"
    >
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
        <div className="h-[78px] relative">
          {loadingLoader && <div className="absolute z- inset-0 flex items-center justify-center"><Loader /></div>}

          <div className={`${loadingLoader ? "opacity-0" : "opacity-100"} transition-all duration-300`}>
            <ReCAPTCHA
              onLoadCapture={() => {
                setLoadingLoader(false);
              }}
              sitekey="6LfZunYsAAAAAChMIIbG-lhkDy6uMnAgm9cfZnrN"
              hl={locale}
              onChange={(token: string | null) => {
                setRecaptchaVerified(!!token);
              }}
              onExpired={() => {
                setRecaptchaVerified(false);
              }}
              onErrored={() => {
                setRecaptchaVerified(false);
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full mt-8">
        <CustomBtn
          text={messages.register}
          type="submit"
          disabled={!recaptchaVerified}
          loading={loading}
        />
      </div>

      <div className="mt-12 flex flex-col items-center justify-center">
        <GoogleSignInButton dividerLabel="auth.orRegisterWith" />
      </div>

      <div className="flex items-center justify-center mt-6">
        <LinkTo
          href="/auth/login"
          className="text-sm font-medium text-center text-slate-700 dark:text-slate-300 hover:text-accent-purple/80 dark:hover:text-purple-400 transition-all duration-200"
        >
          {t("auth.haveAccount")}{" "}
          <span className="font-bold underline text-accent-purple dark:text-purple-400">
            {t("auth.login")}
          </span>
        </LinkTo>
      </div>
    </form>
  );
}
