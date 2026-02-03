/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect, useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { FaTimes, FaAward, FaGraduationCap, FaUniversity, FaCalendar, FaBook, FaFileAlt } from "react-icons/fa";
import CustomInput from "./CustomInput";
import UploadFile from "./UploadFile";
import { _checkFileSize, _checkFileType } from "@/shared/_shared";
import type {
  Qualification,
  QualificationStatus,
} from "@/app/[locale]/specialist/qualifications/page";

interface QualificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (qualification: Omit<Qualification, "id">) => void;
}

type QualificationFormData = {
  school: string;
  type: Qualification["type"];
  degree: string;
  fieldOfStudy: string;
  startDate: Date | null;
  endDate: Date | null;
  activitiesAndSocieties: string;
  description: string;
  files: File[];
};

const createQualificationSchema = (
  t: ReturnType<typeof useTranslations<"">>
) => {
  return yup.object().shape({
    school: yup
      .string()
      .required(t("personal.qualificationSchoolRequired") || "School name is required")
      .min(
        2,
        t("personal.qualificationSchoolMinLength") ||
          "School name must be at least 2 characters"
      ),
    type: yup
      .mixed<Qualification["type"]>()
      .required(
        t("personal.qualificationTypeRequired") ||
          "Qualification type is required"
      ),
    degree: yup
      .string()
      .required(t("personal.qualificationDegreeRequired") || "Degree is required"),
    fieldOfStudy: yup
      .string()
      .required(t("personal.qualificationFieldOfStudyRequired") || "Field of study is required"),
    startDate: yup
      .date()
      .nullable()
      .required(t("personal.qualificationStartDateRequired") || "Start date is required"),
    endDate: yup
      .date()
      .nullable()
      .required(t("personal.qualificationEndDateRequired") || "End date is required")
      .test(
        "is-after-start",
        t("personal.qualificationEndDateAfterStart") || "End date must be after start date",
        function (value) {
          const { startDate } = this.parent;
          if (!value || !startDate) return true;
          return new Date(value) >= new Date(startDate);
        }
      ),
    activitiesAndSocieties: yup.string(),
    description: yup.string(),
    files: yup
      .array()
      .of(yup.mixed<File>())
      .min(
        1,
        t("personal.qualificationFilesRequired") ||
          "At least one file is required"
      ),
  });
};

export default function QualificationFormModal({
  isOpen,
  onClose,
  onSubmit,
}: QualificationFormModalProps) {
  const t = useTranslations("");
  const [fileError, setFileError] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<QualificationFormData>({
    defaultValues: {
      school: "",
      files: [],
      type: "academic",
      degree: "",
      fieldOfStudy: "",
      startDate: null,
      endDate: null,
      activitiesAndSocieties: "",
      description: "",
    },
    resolver: yupResolver(
      createQualificationSchema(t)
    ) as unknown as Resolver<QualificationFormData>,
    mode: "onChange",
  });

  const files = watch("files") || [];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      reset();
      setFileError("");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFileError("");

    const maxSize = 10; // 10MB
    const allowedTypes = [
      "image/png",
      "image/webp",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    // Check file sizes
    if (!selectedFiles.every((file: File) => _checkFileSize(file, maxSize))) {
      setFileError(
        t("form.sizeMustBeLessThan{size}MB", { size: maxSize.toString() }) ||
          `File size must be less than ${maxSize}MB`
      );
      return;
    }

    // Check file types
    if (
      !selectedFiles.every((file: File) => _checkFileType(file, allowedTypes))
    ) {
      setFileError(
        t("personal.qualificationFilesInvalidType") ||
          "Only images (PNG, WEBP, JPG), PDF, and Word documents are allowed"
      );
      return;
    }

    setValue("files", [...files, ...selectedFiles], {
      shouldValidate: true,
    });
    e.target.value = "";
  };

  const handleDeleteFile = (index: number) => {
    const updatedFiles = files.filter((_: File, i: number) => i !== index);
    setValue("files", updatedFiles, { shouldValidate: true });
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  const onFormSubmit = (data: QualificationFormData) => {
    const status: QualificationStatus =
      data.type === "academic" ? "pending" : "active";
    onSubmit({ ...data, status });
    reset();
    setFileError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm m-0">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FaAward className="text-primary text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {t("personal.addQualification") || "Add Qualification"}
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
              name="school"
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  type="text"
                  id="school"
                  label={t("personal.qualificationSchool") || "School Name *"}
                  placeholder={
                    t("personal.qualificationSchoolPlaceholder") ||
                    "Enter school name"
                  }
                  icon={<FaUniversity />}
                  error={errors.school?.message}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => {
                const options = [
                  {
                    label:
                      t("personal.qualificationTypeAcademic") || "Academic",
                    value: "academic",
                  },
                  {
                    label:
                      t("personal.qualificationTypeCourses") || "Courses",
                    value: "courses",
                  },
                ];
                const selectedOption = options.find((opt) => opt.value === value) || null;
                
                return (
                  <CustomInput
                    type="select"
                    id="qualificationType"
                    label={
                      t("personal.qualificationType") || "Qualification type"
                    }
                    placeholder={
                      t("personal.qualificationTypePlaceholder") ||
                      "Select qualification type"
                    }
                    icon={<FaGraduationCap />}
                    error={errors.type?.message}
                    value={selectedOption}
                    onChange={(option: unknown) => {
                      const selected = option as { value: string; label: string } | null;
                      onChange((selected?.value || "") as Qualification["type"]);
                    }}
                    options={options}
                  />
                );
              }}
            />

            <Controller
              control={control}
              name="degree"
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  type="text"
                  id="degree"
                  label={t("personal.qualificationDegree") || "Degree"}
                  placeholder={
                    t("personal.qualificationDegreePlaceholder") ||
                    "Enter degree"
                  }
                  icon={<FaAward />}
                  error={errors.degree?.message}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            />

            <Controller
              control={control}
              name="fieldOfStudy"
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  type="text"
                  id="fieldOfStudy"
                  label={t("personal.qualificationFieldOfStudy") || "Field of Study"}
                  placeholder={
                    t("personal.qualificationFieldOfStudyPlaceholder") ||
                    "Enter field of study"
                  }
                  icon={<FaBook />}
                  error={errors.fieldOfStudy?.message}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="startDate"
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    type="date"
                    id="startDate"
                    label={t("personal.qualificationStartDate") || "Start Date"}
                    placeholder={
                      t("personal.qualificationStartDatePlaceholder") ||
                      "Select start date"
                    }
                    icon={<FaCalendar />}
                    error={errors.startDate?.message}
                    value={value}
                    onChange={(e) => {
                      const date = e as unknown as Date | null;
                      onChange(date);
                    }}
                  />
                )}
              />

              <Controller
                control={control}
                name="endDate"
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    type="date"
                    id="endDate"
                    label={t("personal.qualificationEndDate") || "End Date"}
                    placeholder={
                      t("personal.qualificationEndDatePlaceholder") ||
                      "Select end date"
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
            </div>

            <Controller
              control={control}
              name="activitiesAndSocieties"
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  type="textarea"
                  id="activitiesAndSocieties"
                  label={t("personal.qualificationActivitiesAndSocieties") || "Activities and Societies"}
                  placeholder={
                    t("personal.qualificationActivitiesAndSocietiesPlaceholder") ||
                    "Enter activities and societies"
                  }
                  icon={<FaAward />}
                  error={errors.activitiesAndSocieties?.message}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  rows={3}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange } }) => (
                <CustomInput
                  type="textarea"
                  id="description"
                  label={t("personal.qualificationDescription") || "Description"}
                  placeholder={
                    t("personal.qualificationDescriptionPlaceholder") ||
                    "Enter description"
                  }
                  icon={<FaFileAlt />}
                  error={errors.description?.message}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  rows={4}
                />
              )}
            />

            <div>
              <UploadFile
                t={t}
                handleFileChange={handleFileChange}
                attachments={files}
                handleViewFile={handleViewFile}
                handleDeleteFile={handleDeleteFile}
                errors={errors.files?.message || fileError || ""}
                label="personal.qualificationFiles"
                size={10}
                accept="image/png,image/webp,image/jpeg,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                fileTypesMessage="form.qualificationFilesUpTo{size}mb"
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
