"use client";

import { useEffect } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { FaPen } from "react-icons/fa";
import CustomInput from "./CustomInput";

export type StepFormValues = {
  nameAr: string;
  nameEn: string;
};

type StepFormData = {
  nameAr: string;
  nameEn: string;
};

interface StepFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: StepFormValues) => void;
  initialValues?: StepFormValues | null;
}

const createStepSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    nameAr: yup
      .string()
      .required(
        t("personal.stepNameArRequired") || "Step name in Arabic is required"
      )
      .min(
        2,
        t("personal.stepNameArMinLength") ||
          "Step name in Arabic must be at least 2 characters"
      ),
    nameEn: yup
      .string()
      .required(
        t("personal.stepNameEnRequired") || "Step name in English is required"
      )
      .min(
        2,
        t("personal.stepNameEnMinLength") ||
          "Step name in English must be at least 2 characters"
      ),
  });

export default function StepFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: StepFormModalProps) {
  const t = useTranslations("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StepFormData>({
    defaultValues: {
      nameAr: "",
      nameEn: "",
    },
    resolver: yupResolver(
      createStepSchema(t)
    ) as unknown as Resolver<StepFormData>,
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        nameAr: initialValues?.nameAr || "",
        nameEn: initialValues?.nameEn || "",
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

  const onFormSubmit = (data: StepFormData) => {
    onSubmit({
      nameAr: data.nameAr.trim(),
      nameEn: data.nameEn.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm m-0">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <FaPen className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold">
              {t("personal.editStep") || "Edit Step"}
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
            name="nameAr"
            render={({ field: { value, onChange } }) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("personal.stepNameAr") || "Step Name (Arabic)"}
                </label>
                <CustomInput
                  id="stepNameAr"
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={
                    t("personal.stepNameArPlaceholder") ||
                    "Enter step name in Arabic"
                  }
                  error={errors.nameAr?.message as string}
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="nameEn"
            render={({ field: { value, onChange } }) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("personal.stepNameEn") || "Step Name (English)"}
                </label>
                <CustomInput
                  id="stepNameEn"
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={
                    t("personal.stepNameEnPlaceholder") ||
                    "Enter step name in English"
                  }
                  error={errors.nameEn?.message as string}
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





