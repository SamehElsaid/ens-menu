"use client";

import { Controller, useForm } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import CustomBtn from "@/components/Custom/CustomBtn";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost } from "@/shared/axiosCall";
import { encryptData } from "@/shared/encryption";
import Cookies from "js-cookie";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import LinkTo from "@/components/Global/LinkTo";
import { FaEnvelope } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { IoRestaurantOutline } from "react-icons/io5";

type StaffLoginFormValues = {
  menuSlug: string;
  email: string;
  password: string;
};

type StaffLoginApiResponse = {
  message?: string;
  accessToken?: string;
  refreshToken?: string | null;
  staff?: {
    name?: string;
    email?: string;
    role?: string;
  };
  menu?: { id?: number; slug?: string };
};

function normalizeStaffJobRole(role: unknown): string {
  const s = String(role ?? "")
    .trim()
    .toLowerCase();
  if (s === "casher") return "cashier";
  return s;
}

export default function StaffLoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffLoginFormValues>({
    defaultValues: { menuSlug: "", email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: StaffLoginFormValues) => {
    setLoading(true);
    setApiError(null);

    const result = await axiosPost<
      { email: string; password: string; menuSlug: string },
      StaffLoginApiResponse
    >(
      "/staff-auth/login",
      locale,
      {
        email: data.email.trim(),
        password: data.password,
        menuSlug: data.menuSlug.trim().toLowerCase(),
      },
      false,
      true,
    );

    if (!result.status || !result.data?.accessToken || !result.data?.menu?.id) {
      const msg =
        (result.data as { message?: string })?.message ||
        t("staffLoginFailed");
      setApiError(msg);
      setLoading(false);
      return;
    }

    const { accessToken, refreshToken, staff, menu } = result.data;
    const job = normalizeStaffJobRole(staff?.role);

    if (job !== "cashier") {
      setApiError(t("staffOnlyCashierDashboard"));
      setLoading(false);
      return;
    }

    const saveTokens = {
      token: accessToken,
      refreshToken: refreshToken ?? "",
      role: "staff",
      staffJobRole: job,
      /** Lets the header link back to the cashier dashboard from any page (e.g. home). */
      menuId: menu.id,
    };

    Cookies.set("sub", encryptData(saveTokens), {
      expires: 3,
      sameSite: "Strict",
      secure: true,
      path: "/",
    });

    dispatch(
      SET_ACTIVE_USER({
        user: {
          email: staff?.email ?? "",
          name: staff?.name ?? "",
          role: "staff",
          profileImage: "",
        },
      }),
    );

    router.push(`/dashboard/${menu.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {apiError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {apiError}
        </p>
      )}

      <Controller
        control={control}
        name="menuSlug"
        rules={{ required: t("menuSlugRequired") }}
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="text"
            placeholder={t("menuSlugPlaceholder")}
            id="menuSlug"
            icon={<IoRestaurantOutline />}
            label={t("menuSlug")}
            error={errors.menuSlug?.message}
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
        name="email"
        rules={{ required: t("emailRequired") }}
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="email"
            placeholder={t("email")}
            id="email"
            icon={<FaEnvelope />}
            label={t("email")}
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
        rules={{ required: t("passwordRequired") }}
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="password"
            placeholder={t("password")}
            id="password"
            icon={<TbLockPassword />}
            label={t("password")}
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

      <CustomBtn type="submit" loading={loading} disabled={loading}>
        {t("staffLoginSubmit")}
      </CustomBtn>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
        <LinkTo href="/auth/login" className="text-primary font-medium">
          {t("ownerLoginLink")}
        </LinkTo>
      </p>
    </form>
  );
}
