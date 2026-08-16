"use client";

import { Controller, useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost } from "@/shared/axiosCall";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { SET_AUTH_SESSION_CACHE } from "@/store/authSlice/authSlice";
import { FiMail } from "react-icons/fi";
import { IoRestaurantOutline } from "react-icons/io5";
import { getMenuDashboardRef } from "@/lib/menuDashboardPath";
import { Alert, Field, Input, PasswordInput } from "@/components/site/Form";
import { SiteButton } from "@/components/site/Button";
import { writeAuthUiCookie } from "@/shared/authUiCookie";
import { storeCsrfTokenFromPayload } from "@/shared/csrfToken";

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

    if (!result.status || !result.data?.menu) {
      const msg =
        (result.data as { message?: string })?.message || t("staffLoginFailed");
      setApiError(msg);
      setLoading(false);
      return;
    }

    const { staff, menu } = result.data;
    const permissions = Array.isArray(result.data.permissions)
      ? result.data.permissions.filter(
          (p): p is string => typeof p === "string",
        )
      : [];

    // Only a display hint now: access comes from menu grants, so a staff member
    // without an anchor menu still signs in and simply sees an empty menu list.
    const menuRef =
      getMenuDashboardRef(menu as { id?: number; uuid?: string }) || undefined;

    const roleName = result.data.role?.name ?? staff?.roleName ?? undefined;

    const uiHints = {
      role: "staff",
      permissions,
      staffRoleId: result.data.role?.id ?? staff?.roleId ?? undefined,
      roleName,
      menuUuid: menuRef,
    };

    writeAuthUiCookie(uiHints);
    storeCsrfTokenFromPayload(result.data);

    dispatch(
      SET_AUTH_SESSION_CACHE({
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

  const clearError = (run: () => void) => {
    setApiError(null);
    run();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {apiError ? <Alert className="mb-5">{apiError}</Alert> : null}

      <div className="space-y-4">
        <Controller
          control={control}
          name="menuSlug"
          rules={{ required: t("menuSlugRequired") }}
          render={({ field: { value, onChange } }) => (
            <Field
              label={t("menuSlug")}
              error={errors.menuSlug?.message}
              htmlFor="staff-venue"
              hint={t("menuSlugPlaceholder")}
            >
              <Input
                id="staff-venue"
                type="text"
                dir="ltr"
                startIcon={<IoRestaurantOutline className="size-4" />}
                invalid={Boolean(errors.menuSlug)}
                value={value}
                onChange={(e) => clearError(() => onChange(e))}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="email"
          rules={{ required: t("emailRequired") }}
          render={({ field: { value, onChange } }) => (
            <Field
              label={t("email")}
              error={errors.email?.message}
              htmlFor="staff-email"
            >
              <Input
                id="staff-email"
                type="email"
                inputMode="email"
                startIcon={<FiMail className="size-4" />}
                autoComplete="email"
                invalid={Boolean(errors.email)}
                value={value}
                onChange={(e) => clearError(() => onChange(e))}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: t("passwordRequired") }}
          render={({ field: { value, onChange } }) => (
            <Field
              label={t("password")}
              error={errors.password?.message}
              htmlFor="staff-password"
            >
              <PasswordInput
                id="staff-password"
                autoComplete="current-password"
                invalid={Boolean(errors.password)}
                showLabel={t("showPassword")}
                hideLabel={t("hidePassword")}
                value={value}
                onChange={(e) => clearError(() => onChange(e))}
              />
            </Field>
          )}
        />
      </div>

      <SiteButton
        type="submit"
        loading={loading}
        block
        size="lg"
        className="mt-6"
      >
        {t("staffLoginSubmit")}
      </SiteButton>
    </form>
  );
}
