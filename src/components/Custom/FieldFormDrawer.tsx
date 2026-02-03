/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Controller, Resolver, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations, useLocale } from "next-intl";
import Drawer from "../Global/Drawer";
import CustomInput from "./CustomInput";
import ChoiceModal, { ChoiceFormValues } from "./ChoiceModal";
import { FaList, FaPlus, FaTrash } from "react-icons/fa";
import { IoText } from "react-icons/io5";

export type FieldType =
  | "number"
  | "date"
  | "phone"
  | "input"
  | "textarea"
  | "select"
  | "choice";

export type Choice = {
  id: string;
  nameAr: string;
  nameEn: string;
};

export type FieldFormValues = {
  nameAr: string;
  nameEn: string;
  type: FieldType;
  required?: boolean;
  choices?: Choice[];
};

type FieldFormData = {
  nameAr: string;
  nameEn: string;
  type: FieldType | null;
  required: boolean;
};

interface FieldFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FieldFormValues) => void;
  initialValues?: FieldFormValues | null;
}

type FieldTypeOption = {
  label: string;
  value: FieldType;
};

const createFieldSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    nameAr: yup
      .string()
      .required(
        t("personal.fieldNameArRequired") || "Field name in Arabic is required"
      )
      .min(
        2,
        t("personal.fieldNameArMinLength") ||
          "Field name in Arabic must be at least 2 characters"
      ),
    nameEn: yup
      .string()
      .required(
        t("personal.fieldNameEnRequired") || "Field name in English is required"
      )
      .min(
        2,
        t("personal.fieldNameEnMinLength") ||
          "Field name in English must be at least 2 characters"
      ),
    type: yup
      .mixed<FieldType>()
      .test(
        "required",
        t("personal.fieldTypeRequired") || "Field type is required",
        (value) => !!value
      ),
    required: yup.boolean(),
  });

export default function FieldFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}: FieldFormDrawerProps) {
  const t = useTranslations("");
  const locale = useLocale();

  const [choices, setChoices] = useState<Choice[]>(
    initialValues?.choices || []
  );
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [choicesError, setChoicesError] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldFormData>({
    defaultValues: {
      nameAr: "",
      nameEn: "",
      type: null,
      required: false,
    },
    resolver: yupResolver(
      createFieldSchema(t)
    ) as unknown as Resolver<FieldFormData>,
    mode: "onChange",
  });

  const selectedType = useWatch({
    control,
    name: "type",
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        nameAr: initialValues?.nameAr || "",
        nameEn: initialValues?.nameEn || "",
        type: initialValues?.type || null,
        required: initialValues?.required || false,
      });
      const initialChoices = initialValues?.choices || [];
      setChoices(initialChoices);
      if (
        (initialValues?.type === "select" ||
          initialValues?.type === "choice") &&
        initialChoices.length < 2
      ) {
        setChoicesError(
          t("personal.choicesMinRequired") || "At least 2 choices are required"
        );
      } else {
        setChoicesError("");
      }
    }
  }, [isOpen, initialValues, reset, t]);

  const fieldTypeOptions: FieldTypeOption[] = [
    { label: t("personal.fieldTypeNumber") || "Number", value: "number" },
    { label: t("personal.fieldTypeDate") || "Date", value: "date" },
    { label: t("personal.fieldTypePhone") || "Phone", value: "phone" },
    { label: t("personal.fieldTypeInput") || "Input", value: "input" },
    { label: t("personal.fieldTypeTextarea") || "Textarea", value: "textarea" },
    { label: t("personal.fieldTypeSelect") || "Select", value: "select" },
    { label: t("personal.fieldTypeChoice") || "Choice", value: "choice" },
  ];

  const showChoicesSection =
    selectedType === "select" || selectedType === "choice";

  const handleAddChoice = (values: ChoiceFormValues) => {
    const newChoice: Choice = {
      id: Date.now().toString(),
      nameAr: values.nameAr,
      nameEn: values.nameEn,
    };
    setChoices((prev) => {
      const newChoices = [...prev, newChoice];
      if (newChoices.length >= 2) {
        setChoicesError("");
      }
      return newChoices;
    });
    setIsChoiceModalOpen(false);
  };

  const handleRemoveChoice = (choiceId: string) => {
    setChoices((prev) => {
      const newChoices = prev.filter((choice) => choice.id !== choiceId);
      if (showChoicesSection && newChoices.length < 2) {
        setChoicesError(
          t("personal.choicesMinRequired") || "At least 2 choices are required"
        );
      } else {
        setChoicesError("");
      }
      return newChoices;
    });
  };

  const onFormSubmit = (data: FieldFormData) => {
    // Validate choices for choice/select fields
    if (showChoicesSection && choices.length < 2) {
      setChoicesError(
        t("personal.choicesMinRequired") || "At least 2 choices are required"
      );
      return;
    }

    setChoicesError("");
    onSubmit({
      nameAr: data.nameAr.trim(),
      nameEn: data.nameEn.trim(),
      type: data.type!,
      required: showChoicesSection ? data.required : undefined,
      choices: showChoicesSection ? choices : undefined,
    });
  };

  const getChoiceDisplayName = (choice: Choice) => {
    return locale === "ar" ? choice.nameAr : choice.nameEn;
  };

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={onClose}
        title={t("personal.addField") || "Add Field"}
        right={locale === "ar"}
      >
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col h-full"
        >
          <div className="flex-1 p-4 space-y-4">
            <Controller
              control={control}
              name="nameAr"
              render={({ field: { value, onChange } }) => (
                <div>
                  <CustomInput
                    id="fieldNameAr"
                    label={t("personal.fieldNameAr") || "Field Name (Arabic)"}
                    type="text"
                    value={value}
                    icon={<IoText />}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={
                      t("personal.fieldNameArPlaceholder") ||
                      "Enter field name in Arabic"
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
                  <CustomInput
                    id="fieldNameEn"
                    label={t("personal.fieldNameEn") || "Field Name (English)"}
                    type="text"
                    icon={<IoText />}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={
                      t("personal.fieldNameEnPlaceholder") ||
                      "Enter field name in English"
                    }
                    error={errors.nameEn?.message as string}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <div>
                  <CustomInput
                    type="select"
                    id="fieldType"
                    label={t("personal.fieldType") || "Field Type"}
                    placeholder={
                      t("personal.fieldTypePlaceholder") || "Select field type"
                    }
                    value={
                      value
                        ? fieldTypeOptions.find((opt) => opt.value === value)
                        : null
                    }
                    onChange={(option: unknown) => {
                      const selected = option as FieldTypeOption | null;
                      onChange(selected?.value || null);
                    }}
                    options={fieldTypeOptions}
                    icon={<FaList />}
                    error={errors.type?.message as string}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="required"
              render={({ field: { value, onChange } }) => (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fieldRequired"
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4.5 w-4.5 accent-primary text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="fieldRequired"
                    className=" font-medium text-gray-700 cursor-pointer"
                  >
                    {t("personal.fieldRequired") || "Required"}
                  </label>
                </div>
              )}
            />
            {showChoicesSection && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("personal.choices") || "Choices"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsChoiceModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <FaPlus className="text-xs" />
                    {t("personal.addChoice") || "Add Choice"}
                  </button>
                </div>

                {choices.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {t("personal.noChoicesAdded") ||
                      "No choices added yet. Click 'Add Choice' to add one."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {choices.map((choice) => (
                      <div
                        key={choice.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {getChoiceDisplayName(choice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(choice.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all hover:bg-red-100"
                          aria-label={t("common.delete") || "Delete"}
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {choicesError && (
                  <p className="text-sm text-red-600">{choicesError}</p>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4  flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            >
              {t("form.cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              className="w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
            >
              {t("form.submit") || "Submit"}
            </button>
          </div>
        </form>
      </Drawer>

      <ChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onSubmit={handleAddChoice}
        initialValues={null}
      />
    </>
  );
}
