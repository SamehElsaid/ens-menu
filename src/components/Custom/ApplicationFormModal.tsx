"use client";

import { useEffect } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { FaGraduationCap, FaPlus } from "react-icons/fa";
import CustomInput from "./CustomInput";

type SpecialityOption = {
  label: string;
  value: string;
};

export type ApplicationFormValues = {
  name: string;
  speciality: string;
};

type ApplicationFormData = {
  name: string;
  speciality: SpecialityOption | null;
};

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ApplicationFormValues) => void;
  initialValues?: ApplicationFormValues | null;
  isEdit?: boolean;
}

const createApplicationSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    name: yup
      .string()
      .required(
        t("personal.applicationNamePlaceholder") ||
          "Application name is required"
      )
      .min(
        2,
        t("personal.applicationNamePlaceholder") ||
          "Application name must be at least 2 characters"
      ),
    speciality: yup
      .mixed<SpecialityOption>()
      .test(
        "required",
        t("auth.specialityRequired") || "Speciality is required",
        (value) => !!value && !!value.value
      ),
  });

export default function ApplicationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false,
}: ApplicationFormModalProps) {
  const t = useTranslations("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    defaultValues: {
      name: "",
      speciality: null,
    },
    resolver: yupResolver(
      createApplicationSchema(t)
    ) as unknown as Resolver<ApplicationFormData>,
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialValues?.name || "",
        speciality: initialValues?.speciality
          ? {
              label: initialValues.speciality,
              value: initialValues.speciality,
            }
          : null,
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

  const onFormSubmit = (data: ApplicationFormData) => {
    onSubmit({
      name: data.name.trim(),
      speciality: data.speciality?.label || "",
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm m-0">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <FaPlus className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold">
              {isEdit
                ? t("personal.editApplication") || "Edit Application"
                : t("personal.addApplication") || "Add Application"}
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
            name="name"
            render={({ field: { value, onChange } }) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("personal.applicationName") || "Application Name"}
                </label>
                <CustomInput
                  id="applicationName"
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={
                    t("personal.applicationNamePlaceholder") ||
                    "Enter application name"
                  }
                  error={errors.name?.message as string}
                />
              </div>
            )}
          />

          <Controller
            control={control}
            name="speciality"
            render={({ field: { value, onChange } }) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t("auth.speciality") || "Speciality"}
                </label>
                <CustomInput
                  type="select"
                  id="applicationSpeciality"
                  icon={<FaGraduationCap />}
                  placeholder={
                    t("auth.selectSpeciality") || "Select Speciality"
                  }
                  value={value as unknown}
                  onChange={(option: unknown) =>
                    onChange(option as SpecialityOption | null)
                  }
                  options={[
                    {
                      label:
                        t(
                          "homePage.featuredSection.categories.pediatricSurgery"
                        ) || "Pediatric surgery",
                      value: "pediatricSurgery",
                    },
                    {
                      label:
                        t("homePage.featuredSection.categories.psychiatric") ||
                        "Psychiatric",
                      value: "psychiatric",
                    },
                    {
                      label:
                        t("homePage.featuredSection.categories.nutrition") ||
                        "Weight loss and nutrition",
                      value: "nutrition",
                    },
                  ]}
                  error={errors.speciality?.message as string}
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
