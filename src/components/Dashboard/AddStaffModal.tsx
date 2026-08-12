"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { MenuStaff } from "@/types/Menu";
import { useAccountStaffRoles } from "@/hooks/useAccountStaffRoles";
import {
  useDashboardMenus,
  localizedMenuName,
} from "@/hooks/useDashboardMenus";
import {
  roleDisplayName,
  isComingSoonStaffRole,
} from "@/shared/roleDisplayName";
import {
  IoEllipseSharp,
  IoCheckmarkCircle,
  IoRemoveCircle,
  IoAddCircleOutline,
  IoPeopleOutline,
  IoRestaurantOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import {
  Button,
  Field,
  Input,
  Modal,
  Spinner,
  focusRing,
} from "@/components/ui";
import { cn } from "@/lib/cn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AddStaffFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isActive: boolean;
  roleId: number | null;
  menuIds: number[];
}

interface AddStaffModalProps {
  staff?: MenuStaff | null;
  onClose: () => void;
  onRefresh?: () => void;
}

const STAFF_FORM_ID = "add-staff-form";

function buildStaffPayload(data: AddStaffFormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: data.name.trim(),
    isActive: data.isActive,
    menuIds: data.menuIds,
  };
  if (data.roleId != null) payload.roleId = data.roleId;
  const email = data.email.trim();
  if (email) payload.email = email;
  const password = data.password.trim();
  if (password) payload.password = password;
  return payload;
}

export default function AddStaffModal({
  staff = null,
  onClose,
  onRefresh,
}: AddStaffModalProps) {
  const t = useTranslations("Staff.addModal");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isEdit = Boolean(staff?.id);
  const [isSaving, setIsSaving] = useState(false);
  const { roles, loading: rolesLoading } = useAccountStaffRoles();
  const { menus, loading: menusLoading } = useDashboardMenus();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AddStaffFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      isActive: true,
      roleId: null,
      menuIds: [],
    },
    mode: "onChange",
  });

  const passwordValue = watch("password");

  useEffect(() => {
    if (staff) {
      reset({
        name: staff.name ?? "",
        email: staff.email ?? "",
        password: "",
        confirmPassword: "",
        isActive: staff.isActive ?? true,
        roleId: typeof staff.roleId === "number" ? staff.roleId : null,
        menuIds: staff.menuIds ?? [],
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        isActive: true,
        roleId: null,
        menuIds: [],
      });
    }
  }, [staff, reset]);

  const onSubmit = async (data: AddStaffFormData) => {
    try {
      setIsSaving(true);
      const payload = buildStaffPayload(data);

      if (isEdit && staff) {
        const result = await axiosPatch<
          Record<string, unknown>,
          { message?: string }
        >(`/dashboard/staff/${staff.id}`, locale, payload);
        if (result.status) {
          toast.success(t("editSuccess"));
          onClose();
          onRefresh?.();
        } else {
          toast.error(t("editError"));
        }
      } else {
        const result = await axiosPost<
          Record<string, unknown>,
          { message?: string; staff?: MenuStaff }
        >("/dashboard/staff", locale, payload);
        if (result.status) {
          toast.success(t("createSuccess"));
          onClose();
          onRefresh?.();
        } else {
          toast.error(t("createError"));
        }
      }
    } catch {
      toast.error(isEdit ? t("editError") : t("createError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? t("editTitle") : t("title")}
      description={t("subtitle")}
      icon={<IoPeopleOutline className="size-5" />}
      dismissible={!isSaving}
      closeLabel={tCommon("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={STAFF_FORM_ID}
            loading={isSaving}
            disabled={isSaving}
            startIcon={<IoAddCircleOutline className="size-4.5" />}
          >
            {isEdit ? t("save") : t("create")}
          </Button>
        </>
      }
    >
      <form
        id={STAFF_FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <section className="flex flex-col gap-4">
          <Field label={t("roleLabel")} required error={errors.roleId?.message}>
            <Controller
              name="roleId"
              control={control}
              rules={{
                validate: (v) => {
                  if (v == null || !Number.isFinite(v)) {
                    return t("roleRequired");
                  }
                  const role = roles.find((r) => r.id === v);
                  if (
                    role &&
                    isComingSoonStaffRole(role) &&
                    (!isEdit || staff?.roleId !== role.id)
                  ) {
                    return t("roleComingSoon");
                  }
                  return true;
                },
              }}
              render={({ field }) => {
                if (rolesLoading) {
                  return (
                    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-fg-muted">
                      <Spinner size="sm" />
                      {t("rolesLoading")}
                    </div>
                  );
                }
                if (roles.length === 0) {
                  return (
                    <p className="rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
                      {t("noRolesHint")}
                    </p>
                  );
                }
                return (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {roles.map((role) => {
                      const isSelected = field.value === role.id;
                      const isComingSoon = isComingSoonStaffRole(role);
                      return (
                        <button
                          key={role.id}
                          type="button"
                          disabled={isComingSoon}
                          aria-disabled={isComingSoon}
                          onClick={() => {
                            if (isComingSoon) return;
                            field.onChange(role.id);
                          }}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-start text-sm font-medium transition-colors duration-(--dur-settle)",
                            focusRing,
                            isComingSoon
                              ? "cursor-not-allowed border-dashed border-line bg-surface-2 text-fg-subtle opacity-80"
                              : isSelected
                                ? "border-brand bg-brand-soft font-semibold text-brand-soft-fg shadow-xs"
                                : "border-line text-fg-muted hover:border-brand-line hover:bg-brand-soft/40",
                          )}
                        >
                          <IoShieldCheckmarkOutline className="shrink-0 text-lg" />
                          <span className="min-w-0 flex-1 truncate">
                            {roleDisplayName(role, locale)}
                          </span>
                          {isComingSoon && (
                            <span className="ui-label shrink-0 rounded-full bg-surface-3 px-2 py-0.5 text-fg-subtle">
                              {t("roleComingSoon")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              }}
            />
          </Field>

          <Field
            label={t("menusLabel")}
            required
            hint={t("menusHint")}
            error={errors.menuIds?.message}
          >
            <Controller
              name="menuIds"
              control={control}
              rules={{
                validate: (v) => (v.length > 0 ? true : t("menusRequired")),
              }}
              render={({ field }) => {
                if (menusLoading) {
                  return (
                    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-fg-muted">
                      <Spinner size="sm" />
                      {t("menusLoading")}
                    </div>
                  );
                }
                if (menus.length === 0) {
                  return (
                    <p className="rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
                      {t("noMenusHint")}
                    </p>
                  );
                }
                return (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {menus.map((menu) => {
                      const isSelected = field.value.includes(menu.id);
                      return (
                        <button
                          key={menu.id}
                          type="button"
                          onClick={() =>
                            field.onChange(
                              isSelected
                                ? field.value.filter((id) => id !== menu.id)
                                : [...field.value, menu.id],
                            )
                          }
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-start text-sm font-medium transition-colors duration-(--dur-settle)",
                            focusRing,
                            isSelected
                              ? "border-brand/50 bg-brand-soft text-brand ring-1 ring-brand/20"
                              : "border-line text-fg-muted hover:border-line-strong hover:bg-surface-2",
                          )}
                        >
                          <IoRestaurantOutline className="shrink-0 text-lg" />
                          <span className="min-w-0 flex-1 truncate">
                            {localizedMenuName(menu, locale)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              }}
            />
          </Field>

          <Field label={t("name")} required error={errors.name?.message}>
            <Controller
              name="name"
              control={control}
              rules={{
                required: t("nameRequired"),
                maxLength: { value: 255, message: t("nameMax") },
              }}
              render={({ field }) => (
                <Input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  placeholder={t("namePlaceholder")}
                  data-autofocus
                />
              )}
            />
          </Field>

          <Field label={t("email")} required error={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: t("emailRequired"),
                validate: (v) => {
                  const s = v.trim();
                  if (!s) return t("emailRequired");
                  return EMAIL_RE.test(s) ? true : t("emailInvalid");
                },
              }}
              render={({ field }) => (
                <Input
                  type="email"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  placeholder={t("emailPlaceholder")}
                />
              )}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <p className="text-sm text-fg-muted">
            {isEdit ? t("passwordHintEdit") : t("passwordHintCreate")}
          </p>

          <Field
            label={t("password")}
            required={!isEdit}
            error={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              rules={{
                validate: (v) => {
                  const s = (v ?? "").trim();
                  if (!s) return isEdit ? true : t("passwordRequired");
                  if (s.length < 8) return t("passwordMin");
                  if (s.length > 128) return t("passwordMax");
                  return true;
                },
              }}
              render={({ field }) => (
                <Input
                  type="password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="new-password"
                />
              )}
            />
          </Field>

          <Field
            label={t("confirmPassword")}
            error={errors.confirmPassword?.message}
          >
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                validate: (value) => {
                  const p = (passwordValue ?? "").trim();
                  const c = (value ?? "").trim();
                  if (!p && !c) return true;
                  if (!p && c) return t("confirmWithoutPassword");
                  if (p && c !== p) return t("passwordMismatch");
                  if (p && !c) return t("confirmRequired");
                  return true;
                },
              }}
              render={({ field }) => (
                <Input
                  type="password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  placeholder={t("confirmPasswordPlaceholder")}
                  autoComplete="new-password"
                />
              )}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <IoEllipseSharp
              className="size-3 shrink-0 text-fg-subtle"
              aria-hidden
            />
            {t("status")}
          </h3>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <div className="flex w-fit gap-1 rounded-lg border border-line bg-surface-2 p-1">
                <button
                  type="button"
                  aria-pressed={field.value === true}
                  onClick={() => field.onChange(true)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-(--dur-settle)",
                    focusRing,
                    field.value === true
                      ? "bg-surface text-fg shadow-xs"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  <IoCheckmarkCircle
                    className={cn(
                      "size-4",
                      field.value === true ? "text-success" : "text-fg-subtle",
                    )}
                    aria-hidden
                  />
                  {t("active")}
                </button>
                <button
                  type="button"
                  aria-pressed={field.value === false}
                  onClick={() => field.onChange(false)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-(--dur-settle)",
                    focusRing,
                    field.value === false
                      ? "bg-surface text-fg shadow-xs"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  <IoRemoveCircle
                    className={cn(
                      "size-4",
                      field.value === false ? "text-danger" : "text-fg-subtle",
                    )}
                    aria-hidden
                  />
                  {t("inactive")}
                </button>
              </div>
            )}
          />
        </section>
      </form>
    </Modal>
  );
}
