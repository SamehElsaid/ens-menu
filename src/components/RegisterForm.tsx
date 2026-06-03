"use client";
import { Controller, Resolver, useForm } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import { FaEnvelope, FaUser, FaPhone, FaStore } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { registerSchema, RegisterSchema } from "@/schemas/registerSchema";
import LinkTo from "./Global/LinkTo";
import CustomBtn from "./Custom/CustomBtn";
import CustomRecaptcha from "@/components/Auth/CustomRecaptcha";
import { useCallback, useState } from "react";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { pushSignUpEvent } from "@/shared/gtmEvents";
import { toast } from "react-toastify";
import { encryptData } from "@/shared/encryption";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { LoginResponse } from "@/types/LoginResponse";
import { syncFcmToken } from "@/shared/syncFcmToken";
import { useRouter } from "@/i18n/navigation";

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
      resturantName: "",
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
    resturantName: t("auth.resturantName"),
    email: t("auth.email"),
    phone: t("auth.phone"),
    password: t("auth.password"),
    confirmPassword: t("auth.confirmPassword"),
    register: t("auth.register"),
  };

  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const onSubmit = async (data: RegisterSchema) => {
    if (!recaptchaVerified) {
      // يمكنك هنا إضافة توست / رسالة خطأ لو حابب
      return;
    }

    setLoading(true);
    // TODO: اربط هنا API التسجيل
    const dataSend = {
      name: data.fullName,
      restaurantName: data.resturantName,
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
      pushSignUpEvent();
      toast.success(t("auth.registerSuccess"));

      const loginResponse = await axiosPost<
        { email: string; password: string },
        LoginResponse & { message?: string }
      >(
        "/auth/login",
        locale,
        { email: data.email, password: data.password },
        false,
        true,
      );

      if (loginResponse.status && loginResponse.data) {
        const { accessToken, refreshToken, user } = loginResponse.data;
        const encryptedData = encryptData({
          token: accessToken ?? "",
          refreshToken: refreshToken ?? "",
          role: user?.role ?? "",
        });
        Cookies.set("sub", encryptedData, {
          expires: 3,
          sameSite: "Lax",
          secure: true,
          path: "/",
        });
        void syncFcmToken(locale);
        if (user) {
          dispatch(SET_ACTIVE_USER({ user }));
        }
        window.location.href = `/${locale}${user?.role === "admin" ? "/admin" : "/dashboard"}`;
        return;
      }

      router.push("/auth/login");
      setLoading(false);
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
        name="resturantName"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="text"
            placeholder={messages.resturantName}
            id="resturantName"
            icon={<FaStore />}
            label={messages.resturantName}
            error={errors.resturantName?.message}
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

      <CustomRecaptcha
        className="mt-10"
        onVerifiedChange={setRecaptchaVerified}
      />

      <div className="flex w-full mt-3">
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
