"use client";

import { useEffect } from "react";
import { Controller, Resolver, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { FaTimes, FaBriefcase, FaCalendar, FaBuilding } from "react-icons/fa";
import CustomInput from "./CustomInput";
import type { WorkedAt } from "@/app/[locale]/specialist/worked-at/page";

interface WorkedAtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workedAt: Omit<WorkedAt, "id">) => void;
}

type WorkedAtFormData = {
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
  center: { label: string; value: string } | null;
};

const createWorkedAtSchema = (t: ReturnType<typeof useTranslations<"">>) => {
  return yup.object().shape({
    title: yup
      .string()
      .required(t("personal.workedAtTitleRequired") || "Title is required")
      .min(
        2,
        t("personal.workedAtTitleMinLength") ||
          "Title must be at least 2 characters"
      ),
    startDate: yup
      .date()
      .required(t("personal.startDateRequired") || "Start date is required")
      .max(
        new Date(),
        t("personal.startDateFuture") || "Start date cannot be in the future"
      ),
    endDate: yup
      .date()
      .nullable()
      .when("isCurrent", {
        is: false,
        then: (schema) =>
          schema
            .required(t("personal.endDateRequired") || "End date is required")
            .max(
              new Date(),
              t("personal.endDateFuture") || "End date cannot be in the future"
            )
            .when("startDate", {
              is: (startDate: Date | null) => startDate !== null,
              then: (schema) =>
                schema.min(
                  yup.ref("startDate"),
                  t("personal.endDateAfterStartDate") ||
                    "End date must be after start date"
                ),
            }),
        otherwise: (schema) => schema.nullable(),
      }),
    isCurrent: yup.boolean(),
    center: yup
      .object()
      .shape({
        label: yup
          .string()
          .required(t("personal.centerRequired") || "Center is required"),
        value: yup
          .string()
          .required(t("personal.centerRequired") || "Center is required"),
      })
      .nullable(),
  });
};

export default function WorkedAtFormModal({
  isOpen,
  onClose,
  onSubmit,
}: WorkedAtFormModalProps) {
  const t = useTranslations("");

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
    reset,
  } = useForm<WorkedAtFormData>({
    defaultValues: {
      title: "",
      startDate: null,
      endDate: null,
      isCurrent: false,
      center: null,
    },
    resolver: yupResolver(
      createWorkedAtSchema(t)
    ) as unknown as Resolver<WorkedAtFormData>,
    mode: "onChange",
  });

  const isCurrent = useWatch({
    control,
    name: "isCurrent",
  });
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      reset();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const onFormSubmit = (data: WorkedAtFormData) => {
    onSubmit({
      title: data.title,
      startDate: data.startDate || new Date(),
      endDate: data.isCurrent ? null : data.endDate || null,
      isCurrent: data.isCurrent,
      center: data.center?.label || "",
    });
    reset();
  };

  // Center options - can be replaced with API call
  const centerOptions = [
    { label: "Medical Center A", value: "center-a" },
    { label: "Medical Center B", value: "center-b" },
    { label: "Medical Center C", value: "center-c" },
    { label: "Hospital X", value: "hospital-x" },
    { label: "Clinic Y", value: "clinic-y" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm m-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between  mb-6 ">
            <div className="flex items-center gap-3  ">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FaBriefcase className="text-primary text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {t("personal.addWorkedAt") || "Add Work Experience"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  type="text"
                  id="title"
                  label={t("personal.workedAtTitle") || "Title"}
                  placeholder={
                    t("personal.workedAtTitlePlaceholder") ||
                    "Enter job title or position"
                  }
                  icon={<FaBriefcase />}
                  error={errors.title?.message}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  position="right-start"
                />
              )}
            />

            <Controller
              control={control}
              name="center"
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  type="select"
                  id="center"
                  label={t("personal.center") || "Center"}
                  placeholder={t("personal.selectCenter") || "Select Center"}
                  icon={<FaBuilding />}
                  error={errors.center?.message}
                  value={
                    value
                      ? centerOptions.find(
                          (opt) => opt.value === value?.value
                        ) || null
                      : null
                  }
                  onChange={onChange}
                  options={centerOptions}
                  isSearchable={true}
                />
              )}
            />

            <div className="border border-dashed border-primary rounded-md p-4">
              <p className="text-primary mb-4">
                {t("personal.workedAtDescription") ||
                  "Add your work experience to your profile. This will help you to get more clients and improve your visibility."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field: { value, onChange } }) => (
                    <CustomInput
                      type="date"
                      id="startDate"
                      label={t("personal.startDate") || "Start Date"}
                      placeholder={
                        t("personal.selectStartDate") || "Select start date"
                      }
                      icon={<FaCalendar />}
                      error={errors.startDate?.message}
                      value={value}
                      onChange={(e) => {
                        const date = e as unknown as Date | null;
                        onChange(date);
                        trigger("endDate");
                      }}
                    />
                  )}
                />

                {!isCurrent ? (
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field: { value, onChange } }) => (
                      <CustomInput
                        type="date"
                        id="endDate"
                        label={t("personal.endDate") || "End Date"}
                        placeholder={
                          t("personal.selectEndDate") || "Select end date"
                        }
                        icon={<FaCalendar />}
                        error={errors.endDate?.message}
                        value={value}
                        onChange={(e) => {
                          const date = e as unknown as Date | null;
                          onChange(date);
                        }}
                      />
                    )}
                  />
                ) : (
                  <p className="mt-[22px] rounded-md flex items-center justify-center bg-primary/10 text-primary">
                    {" "}
                    {t("personal.present") || "Present"}
                  </p>
                )}
              </div>
              <div className="mt-4" />
              <Controller
                control={control}
                name="isCurrent"
                render={({ field: { value, onChange } }) => (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isCurrent"
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <label
                      htmlFor="isCurrent"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {t("personal.currentPosition") || "Current Position"}
                    </label>
                  </div>
                )}
              />
            </div>

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
    </div>
  );
}
