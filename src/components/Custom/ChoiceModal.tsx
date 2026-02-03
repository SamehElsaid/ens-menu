"use client";

import { useEffect } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { FaPlus } from "react-icons/fa";
import CustomInput from "./CustomInput";

export type ChoiceFormValues = {
  nameAr: string;
  nameEn: string;
};

type ChoiceFormData = {
  nameAr: string;
  nameEn: string;
};

interface ChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ChoiceFormValues) => void;
  initialValues?: ChoiceFormValues | null;
}

const createChoiceSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    nameAr: yup
      .string()
      .required(
        t("personal.choiceNameArRequired") || "Choice name in Arabic is required"
      )
      .min(
        2,
        t("personal.choiceNameArMinLength") ||
          "Choice name in Arabic must be at least 2 characters"
      ),
    nameEn: yup
      .string()
      .required(
        t("personal.choiceNameEnRequired") || "Choice name in English is required"
      )
      .min(
        2,
        t("personal.choiceNameEnMinLength") ||
          "Choice name in English must be at least 2 characters"
      ),
  });

export default function ChoiceModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: ChoiceModalProps) {
  const t = useTranslations("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChoiceFormData>({
    defaultValues: {
      nameAr: "",
      nameEn: "",
    },
    resolver: yupResolver(
      createChoiceSchema(t)
    ) as unknown as Resolver<ChoiceFormData>,
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

  const onFormSubmit = (data: ChoiceFormData) => {
    onSubmit({
      nameAr: data.nameAr.trim(),
      nameEn: data.nameEn.trim(),
    });
  };

  return (
    <div  style={{ zIndex: 66666666666 }} className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <FaPlus className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold">
              {t("personal.addChoice") || "Add Choice"}
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
                  {t("personal.choiceNameAr") || "Choice Name (Arabic)"}
                </label>
                <CustomInput
                  id="choiceNameAr"
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={
                    t("personal.choiceNameArPlaceholder") ||
                    "Enter choice name in Arabic"
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
                  {t("personal.choiceNameEn") || "Choice Name (English)"}
                </label>
                <CustomInput
                  id="choiceNameEn"
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={
                    t("personal.choiceNameEnPlaceholder") ||
                    "Enter choice name in English"
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

