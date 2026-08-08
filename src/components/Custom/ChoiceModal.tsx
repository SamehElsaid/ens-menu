"use client";

import { useEffect } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { FaPlus } from "react-icons/fa";
import { Button, Field, Input, Modal } from "@/components/ui";

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

const CHOICE_FORM_ID = "choice-form";

const createChoiceSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    nameAr: yup
      .string()
      .required(
        t("personal.choiceNameArRequired") ||
          "Choice name in Arabic is required",
      )
      .min(
        2,
        t("personal.choiceNameArMinLength") ||
          "Choice name in Arabic must be at least 2 characters",
      ),
    nameEn: yup
      .string()
      .required(
        t("personal.choiceNameEnRequired") ||
          "Choice name in English is required",
      )
      .min(
        2,
        t("personal.choiceNameEnMinLength") ||
          "Choice name in English must be at least 2 characters",
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
      createChoiceSchema(t),
    ) as unknown as Resolver<ChoiceFormData>,
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        nameAr: initialValues?.nameAr || "",
        nameEn: initialValues?.nameEn || "",
      });
    }
  }, [isOpen, initialValues, reset]);

  const onFormSubmit = (data: ChoiceFormData) => {
    onSubmit({
      nameAr: data.nameAr.trim(),
      nameEn: data.nameEn.trim(),
    });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("personal.addChoice") || "Add Choice"}
      icon={<FaPlus className="size-4" />}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("form.cancel") || "Cancel"}
          </Button>
          <Button variant="primary" type="submit" form={CHOICE_FORM_ID}>
            {t("form.submit") || "Submit"}
          </Button>
        </>
      }
    >
      <form
        id={CHOICE_FORM_ID}
        onSubmit={handleSubmit(onFormSubmit)}
        className="flex flex-col gap-4"
      >
        <Controller
          control={control}
          name="nameAr"
          render={({ field: { value, onChange } }) => (
            <Field
              label={t("personal.choiceNameAr") || "Choice Name (Arabic)"}
              error={errors.nameAr?.message as string}
            >
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={
                  t("personal.choiceNameArPlaceholder") ||
                  "Enter choice name in Arabic"
                }
                data-autofocus
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="nameEn"
          render={({ field: { value, onChange } }) => (
            <Field
              label={t("personal.choiceNameEn") || "Choice Name (English)"}
              error={errors.nameEn?.message as string}
            >
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={
                  t("personal.choiceNameEnPlaceholder") ||
                  "Enter choice name in English"
                }
              />
            </Field>
          )}
        />
      </form>
    </Modal>
  );
}
