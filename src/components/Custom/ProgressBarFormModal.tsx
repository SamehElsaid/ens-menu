"use client";

import { useEffect } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations, useLocale } from "next-intl";
import { FaChartLine } from "react-icons/fa";
import CustomInput from "./CustomInput";

export type ProgressBarFormValues = {
  nameEn: string;
  nameAr: string;
  progressRate: number;
};

type ProgressBarFormData = {
  nameEn: string;
  nameAr: string;
  progressRate: number;
};

interface ProgressBarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProgressBarFormValues) => void;
  initialValues?: ProgressBarFormValues | null;
}

const createProgressBarSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    nameEn: yup
      .string()
      .required(
        t("progressBar.nameEnRequired") || "Name in English is required"
      )
      .min(
        2,
        t("progressBar.nameEnMinLength") ||
          "Name in English must be at least 2 characters"
      ),
    nameAr: yup
      .string()
      .required(
        t("progressBar.nameArRequired") || "Name in Arabic is required"
      )
      .min(
        2,
        t("progressBar.nameArMinLength") ||
          "Name in Arabic must be at least 2 characters"
      ),
    progressRate: yup
      .number()
      .required(
        t("progressBar.progressRateRequired") || "Progress rate is required"
      )
      .min(0, t("progressBar.progressRateMin") || "Progress rate must be at least 0")
      .max(100, t("progressBar.progressRateMax") || "Progress rate must be at most 100"),
  });

export default function ProgressBarFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: ProgressBarFormModalProps) {
  const t = useTranslations("");
  const locale = useLocale();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProgressBarFormData>({
    defaultValues: {
      nameEn: "",
      nameAr: "",
      progressRate: 0,
    },
    resolver: yupResolver(
      createProgressBarSchema(t)
    ) as unknown as Resolver<ProgressBarFormData>,
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        nameEn: initialValues?.nameEn || "",
        nameAr: initialValues?.nameAr || "",
        progressRate: initialValues?.progressRate || 0,
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialValues, reset]);

  if (!isOpen) return null;

  const onFormSubmit = (data: ProgressBarFormData) => {
    onSubmit({
      nameEn: data.nameEn.trim(),
      nameAr: data.nameAr.trim(),
      progressRate: data.progressRate,
    });
    reset();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm m-0">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <FaChartLine className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold">
              {initialValues
                ? t("progressBar.editProgressBar") || "Edit Progress Bar"
                : t("progressBar.addProgressBar") || "Add Progress Bar"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="nameEn"
            render={({ field: { value, onChange } }) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("progressBar.nameEn") || "Name (English)"}
                </label>
                <CustomInput
                  id="nameEn"
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={
                    t("progressBar.nameEnPlaceholder") ||
                    "Enter name in English"
                  }
                  error={errors.nameEn?.message as string}
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="nameAr"
            render={({ field: { value, onChange } }) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("progressBar.nameAr") || "Name (Arabic)"}
                </label>
                <CustomInput
                  id="nameAr"
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={
                    t("progressBar.nameArPlaceholder") ||
                    "Enter name in Arabic"
                  }
                  error={errors.nameAr?.message as string}
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="progressRate"
            render={({ field: { value, onChange } }) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("progressBar.progressRate") || "Progress Rate (%)"}
                </label>
                <CustomInput
                  id="progressRate"
                  type="number"
                  value={value.toString()}
                  onChange={(e) => {
                    const numValue = parseInt(e.target.value) || 0;
                    onChange(Math.min(100, Math.max(0, numValue)));
                  }}
                  placeholder="0"
                  error={errors.progressRate?.message as string}
                  min="0"
                  max="100"
                />
              </div>
            )}
          />

          <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            >
              {t("form.cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
            >
              {t("form.submit") || "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


















