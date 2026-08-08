"use client";

import { Controller, useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui";
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
import { getMenuDashboardRef } from "@/lib/menuDashboardPath";

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
    roleId?: number | null;
    roleName?: string | null;
  };
  role?: { id?: number; name?: string | null } | null;
  permissions?: string[];
  menu?: { id?: number; uuid?: string; slug?: string };
};

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

    if (!result.status || !result.data?.accessToken || !result.data?.menu) {
      const msg =
        (result.data as { message?: string })?.message ||
        t("staffLoginFailed");
      setApiError(msg);
      setLoading(false);
      return;
    }

    const { accessToken, refreshToken, staff, menu } = result.data;
    const permissions = Array.isArray(result.data.permissions)
      ? result.data.permissions.filter((p): p is string => typeof p === "string")
      : [];

    // Only a display hint now: access comes from menu grants, so a staff member
    // without an anchor menu still signs in and simply sees an empty menu list.
    const menuRef =
      getMenuDashboardRef(menu as { id?: number; uuid?: string }) || undefined;

    const roleName =
      result.data.role?.name ?? staff?.roleName ?? undefined;

    const saveTokens = {
      token: accessToken,
      refreshToken: refreshToken ?? "",
      role: "staff",
      permissions,
      staffRoleId: result.data.role?.id ?? staff?.roleId ?? undefined,
      roleName,
      menuUuid: menuRef,
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

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {apiError && <Alert tone="danger">{apiError}</Alert>}

      <Controller
        control={control}
        name="menuSlug"
        rules={{ required: t("menuSlugRequired") }}
        render={({ field: { value, onChange } }) => (
          <Field label={t("menuSlug")} error={errors.menuSlug?.message}>
            <Input
              type="text"
              inputSize="md"
              startIcon={<IoRestaurantOutline size={14} />}
              placeholder={t("menuSlugPlaceholder")}
              value={value}
              onChange={(e) => {
                setApiError(null);
                onChange(e);
              }}
            />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="email"
        rules={{ required: t("emailRequired") }}
        render={({ field: { value, onChange } }) => (
          <Field label={t("email")} error={errors.email?.message}>
            <Input
              type="email"
              inputSize="md"
              startIcon={<FaEnvelope size={14} />}
              placeholder={t("email")}
              autoComplete="email"
              value={value}
              onChange={(e) => {
                setApiError(null);
                onChange(e);
              }}
            />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: t("passwordRequired") }}
        render={({ field: { value, onChange } }) => (
          <Field label={t("password")} error={errors.password?.message}>
            <Input
              type="password"
              inputSize="md"
              startIcon={<TbLockPassword size={15} />}
              placeholder={t("password")}
              autoComplete="current-password"
              value={value}
              onChange={(e) => {
                setApiError(null);
                onChange(e);
              }}
            />
          </Field>
        )}
      />

      <Button type="submit" loading={loading} fullWidth size="lg" className="mt-1">
        {t("staffLoginSubmit")}
      </Button>

      <p className="pt-2 text-center text-[13px] text-fg-muted">
        <LinkTo
          href="/auth/login"
          className="rounded-sm font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t("ownerLoginLink")}
        </LinkTo>
      </p>
    </form>
  );
}
