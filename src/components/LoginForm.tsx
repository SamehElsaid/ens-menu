"use client";
import { Controller, Resolver, useForm } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import { FaEnvelope } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { loginSchema, LoginSchema } from "@/schemas/loginSchema";
import { encryptData } from "@/shared/encryption";
import Cookies from "js-cookie";
import { useRouter } from "@/i18n/navigation";
import LinkTo from "./Global/LinkTo";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { useAppDispatch } from "@/store/hooks";
import CustomBtn from "./Custom/CustomBtn";
import { axiosPost } from "@/shared/axiosCall";
import { useState } from "react";
import { LoginResponse } from "@/types/LoginResponse";
import GoogleSignInButton from "@/components/Auth/GoogleSignInButton";

export default function LoginForm() {
  const t = useTranslations("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(loginSchema(t)) as unknown as Resolver<LoginSchema>,
    mode: "onChange",
  });

  const messages = {
    email: t("auth.email"),
    password: t("auth.password"),
    login: t("auth.login"),
  };

  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (data: LoginSchema) => {
    setLoading(true);
    setApiError(null);

    const response = await axiosPost<LoginSchema, LoginResponse & { message?: string }>(
      "/auth/login",
      locale,
      data,
      false,
      true,
    );
    if (response.status) {
      // toast.success(t("auth.loginSuccess"));

      const { accessToken, refreshToken, user } = response.data;

      const saveTokens = {
        token: accessToken ?? "",
        refreshToken: refreshToken ?? "",
        role: user?.role ?? "",
      };

      const encryptedData = encryptData(saveTokens);

      Cookies.set("sub", encryptedData, {
        expires: 3,
        sameSite: "Strict",
        secure: true,
        path: "/",
      });
      router.push(user?.role === "admin" ? "/admin" : "/dashboard");
      if (user) {
        dispatch(SET_ACTIVE_USER({ user }));
      }
    } else {
      const errorMessage =
        (response.data as { message?: string })?.message ||
        t("auth.invalidCredentials");
      setApiError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 ">
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
            onChange={(e) => {
              setApiError(null);
              onChange(e);
            }}
            className="bg-white/80 text-slate-900 placeholder:text-slate-400 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-700"
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
            onChange={(e) => {
              setApiError(null);
              onChange(e);
            }}
            className="bg-white/80 text-slate-900 placeholder:text-slate-400 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:border-slate-700"
          />
        )}
      />

      <h2 className="text-sm font-medium text-accent-purple dark:text-purple-400 text-end">
        <LinkTo
          href="/auth/reset-password"
          className="w-fit ms-auto block hover:text-accent-purple/80 transition-all duration-200"
        >
          {t("auth.forgotPassword")}
        </LinkTo>
      </h2>

      {apiError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-300"
        >
          <svg
            className="h-5 w-5 shrink-0 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          {apiError}
        </div>
      )}

      <div className="flex w-full mt-8">
        <CustomBtn text={t("auth.login")} type="submit" loading={loading} />
      </div>
      <div className="mt-12 flex flex-col items-center">
        <GoogleSignInButton dividerLabel="auth.orLoginWith" />
      </div>
      <div className="flex items-center justify-center mt-6">
        <LinkTo
          href="/auth/register"
          className="text-sm font-medium text-center text-slate-700 dark:text-slate-300 hover:text-accent-purple/80 transition-all duration-200"
        >
          {t("auth.dontHaveAccount")}{" "}
          <span className="font-bold underline text-accent-purple">
            {t("auth.register")}
          </span>
        </LinkTo>
      </div>
    </form>
  );
}
