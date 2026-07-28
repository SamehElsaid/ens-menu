"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import { toast } from "react-toastify";
import { MenuStaff } from "@/types/Menu";
import { useAccountStaffRoles } from "@/hooks/useAccountStaffRoles";
import { useDashboardMenus, localizedMenuName } from "@/hooks/useDashboardMenus";
import { roleDisplayName, isComingSoonStaffRole } from "@/shared/roleDisplayName";
import {
  IoCloseOutline,
  IoEllipseSharp,
  IoCheckmarkCircle,
  IoRemoveCircle,
  IoAddCircleOutline,
  IoPeopleOutline,
  IoRestaurantOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import CustomBtn from "../Custom/CustomBtn";

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
  const locale = useLocale();
  const isEdit = Boolean(staff?.id);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, isSaving]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && !isSaving && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-staff-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-[fadeIn_0.25s_ease-out] border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-primary/5 to-transparent dark:from-primary/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary/20 to-accent-purple/10 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
                <IoPeopleOutline className="text-primary text-2xl" />
              </div>
              <div>
                <h2
                  id="add-staff-title"
                  className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
                >
                  {isEdit ? t("editTitle") : t("title")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              aria-label={t("closeAriaLabel")}
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-0 flex-1"
        >
          <div className="overflow-y-auto p-6 space-y-6">
            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("roleLabel")} *
                </label>
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
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700/40 dark:text-gray-400">
                          <span
                            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                            aria-hidden
                          />
                          {t("rolesLoading")}
                        </div>
                      );
                    }
                    if (roles.length === 0) {
                      return (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
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
                              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-start text-sm font-medium transition-all duration-200 ${
                                isComingSoon
                                  ? "cursor-not-allowed border-dashed border-gray-200 bg-gray-50/80 text-gray-400 opacity-80 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-500"
                                  : isSelected
                                    ? "border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20 dark:bg-primary/10"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/40"
                              }`}
                            >
                              <IoShieldCheckmarkOutline className="shrink-0 text-lg" />
                              <span className="min-w-0 flex-1 truncate">
                                {roleDisplayName(role, locale)}
                              </span>
                              {isComingSoon && (
                                <span className="shrink-0 rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-700/80 dark:text-slate-400">
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
                {errors.roleId && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.roleId.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("menusLabel")} *
                </label>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  {t("menusHint")}
                </p>
                <Controller
                  name="menuIds"
                  control={control}
                  rules={{
                    validate: (v) =>
                      v.length > 0 ? true : t("menusRequired"),
                  }}
                  render={({ field }) => {
                    if (menusLoading) {
                      return (
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700/40 dark:text-gray-400">
                          <span
                            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                            aria-hidden
                          />
                          {t("menusLoading")}
                        </div>
                      );
                    }
                    if (menus.length === 0) {
                      return (
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
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
                              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-start text-sm font-medium transition-all duration-200 ${
                                isSelected
                                  ? "border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20 dark:bg-primary/10"
                                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/40"
                              }`}
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
                {errors.menuIds && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.menuIds.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("name")} *
                </label>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: t("nameRequired"),
                    maxLength: { value: 255, message: t("nameMax") },
                  }}
                  render={({ field }) => (
                    <CustomInput
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                      placeholder={t("namePlaceholder")}
                      error={errors.name?.message}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("email")} *
                </label>
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
                    <CustomInput
                      type="email"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                      placeholder={t("emailPlaceholder")}
                      error={errors.email?.message}
                    />
                  )}
                />
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEdit ? t("passwordHintEdit") : t("passwordHintCreate")}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("password")}
                  {!isEdit && " *"}
                </label>
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
                    <CustomInput
                      type="password"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                      placeholder={t("passwordPlaceholder")}
                      autoComplete="new-password"
                      error={errors.password?.message}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("confirmPassword")}
                </label>
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
                    <CustomInput
                      type="password"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      className="px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                      placeholder={t("confirmPasswordPlaceholder")}
                      autoComplete="new-password"
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />
              </div>
            </section>

            <section className="rounded-2xl bg-gray-50/80 dark:bg-gray-700/30 p-5 border border-gray-100 dark:border-gray-600/50">
              <div className="flex items-center gap-2 mb-4">
                <IoEllipseSharp className="text-primary text-lg shrink-0" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("status")}
                </h3>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div className="flex rounded-2xl p-1 bg-gray-100 dark:bg-gray-600/40 border border-gray-200/80 dark:border-gray-600/50 w-fit">
                    <button
                      type="button"
                      onClick={() => field.onChange(true)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        field.value === true
                          ? "bg-white dark:bg-gray-700 text-primary shadow-sm border border-gray-200/80 dark:border-gray-600 ring-1 ring-primary/20"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      <IoCheckmarkCircle className="text-lg" />
                      {t("active")}
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange(false)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        field.value === false
                          ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm border border-gray-200/80 dark:border-gray-600 ring-1 ring-red-500/20"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      <IoRemoveCircle className="text-lg" />
                      {t("inactive")}
                    </button>
                  </div>
                )}
              />
            </section>
          </div>

          <div className="shrink-0 justify-end flex gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400/30"
              disabled={isSaving}
            >
              {t("cancel")}
            </button>
            <div className="w-fit!">
              <CustomBtn type="submit" loading={isSaving} disabled={isSaving}>
                <div className="flex items-center justify-center gap-2">
                  <IoAddCircleOutline className="text-xl" />
                  {isEdit ? t("save") : t("create")}
                </div>
              </CustomBtn>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
