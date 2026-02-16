"use client";

import React, {  useEffect, useRef, useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import { toast } from "react-toastify";
import {
  IoCloseOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { FaUserShield } from "react-icons/fa";
import CustomBtn from "../Custom/CustomBtn";
import {
  createAdministratorSchema,
  type AdministratorFormSchema,
} from "@/schemas/administratorSchema";

type AddAdministratorFormData = AdministratorFormSchema;

interface AddAdministratorModalProps {
  onClose: () => void;
  onRefresh?: () => void;
}

export default function AddAdministratorModal({
  onClose,
  onRefresh,
}: AddAdministratorModalProps) {
  const locale = useLocale();
  const t = useTranslations("adminAdministrators.addModal");
  const tAuth = useTranslations(""); // Root-level translations for schema
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddAdministratorFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: yupResolver(
      createAdministratorSchema(tAuth)
    ) as unknown as Resolver<AddAdministratorFormData>,
    mode: "onChange",
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, isSubmitting]);

  const onSubmit = async (data: AddAdministratorFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      };

      const result = await axiosPost<typeof payload, { id: number; name: string; email: string }>(
        "/admin/admins",
        locale,
        payload
      );

      if (result.status && result.data) {
        toast.success(t("createSuccess"));
        reset();
        onClose();
        onRefresh?.();
      } 
    }finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) =>
        e.target === e.currentTarget && !isSubmitting && onClose()
      }
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-administrator-title"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-primary/5 to-transparent dark:from-primary/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary/20 to-accent-purple/10 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
                <FaUserShield className="text-primary text-2xl" />
              </div>
              <div>
                <h2
                  id="add-administrator-title"
                  className="text-xl font-bold text-gray-900 dark:text-white tracking-tight"
                >
                  {t("title")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              aria-label="Close"
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col min-h-0 flex-1"
        >
          <div className="overflow-y-auto p-6 space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t("name")}
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    type="text"
                    placeholder={t("namePlaceholder")}
                    error={errors.name?.message}
                    icon={<IoPersonOutline className="text-gray-400" />}
                  />
                )}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t("email")}
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    error={errors.email?.message}
                    icon={<IoPersonOutline className="text-gray-400" />}
                  />
                )}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t("password")}
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    {...field}
                    type="password"
                    placeholder={t("passwordPlaceholder")}
                    error={errors.password?.message}
                    icon={<IoPersonOutline className="text-gray-400" />}
                  />
                )}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("cancel")}
            </button>
            <CustomBtn
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {t("creating")}
                </span>
              ) : (
                t("create")
              )}
            </CustomBtn>
          </div>
        </form>
      </div>
    </div>
  );
}
