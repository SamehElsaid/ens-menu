"use client";
import { Controller, Resolver, useForm } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import { FaEnvelope, FaGoogle } from "react-icons/fa";
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
  
  const onSubmit = async (data: LoginSchema) => {
    console.log(data);
    setLoading(true);

    const response = await axiosPost<LoginSchema, LoginResponse>(
      "/auth/login",
      locale,
      data,
      false,
      true,
    );
    if (response.status) {
      console.log(response.data);
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
            onChange={onChange}
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
            onChange={onChange}
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

      <div className="flex w-full mt-8">
        <CustomBtn text={t("auth.login")} type="submit" loading={loading} />
      </div>
      <div className="mt-12 flex flex-col items-center">
        <div className="flex items-center gap-4 w-full mb-4">
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t("auth.orLoginWith")}
          </span>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
        </div>
        <div className="flex gap-6">
          <button className="w-14 h-14 text-xl hover:bg-accent-purple/10! dark:hover:bg-accent-purple/20! rounded-full glass-input flex items-center justify-center transition-all shadow-sm dark:border dark:border-slate-700">
            <FaGoogle className="text-accent-purple" />
          </button>
        </div>
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
