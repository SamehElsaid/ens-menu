"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "next-intl";
import * as yup from "yup";
import { FaFileAlt } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import CustomInput from "@/components/Custom/CustomInput";

type BioFormData = {
  shortDescriptionEn: string;
  shortDescriptionAr: string;
  visionEn: string;
  visionAr: string;
};

const createBioSchema = (
  t: ReturnType<typeof useTranslations<"">>
) => {
  return yup.object().shape({
    shortDescriptionEn: yup
      .string()
      .required(t("personal.shortDescriptionRequired"))
      .min(10, t("personal.shortDescriptionMinLength")),
    shortDescriptionAr: yup
      .string()
      .required(t("personal.shortDescriptionRequired"))
      .min(10, t("personal.shortDescriptionMinLength")),
    visionEn: yup
      .string()
      .required(t("personal.visionRequired"))
      .min(10, t("personal.visionMinLength")),
    visionAr: yup
      .string()
      .required(t("personal.visionRequired"))
      .min(10, t("personal.visionMinLength")),
  });
};

export default function BioPage() {
  const t = useTranslations("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BioFormData>({
    defaultValues: {
      shortDescriptionEn: "",
      shortDescriptionAr: "",
      visionEn: "",
      visionAr: "",
    },
    resolver: yupResolver(createBioSchema(t)) as unknown as Resolver<BioFormData>,
    mode: "onChange",
  });

  const messages = {
    shortDescriptionEn: t("personal.shortDescriptionEn"),
    shortDescriptionAr: t("personal.shortDescriptionAr"),
    visionEn: t("personal.visionEn"),
    visionAr: t("personal.visionAr"),
  };

  const onSubmit = (data: BioFormData) => {
    console.log(data);
    // Handle form submission here
  };

  return (
    <CardDashBoard>
      <h1 className="text-2xl font-bold mb-6">{t("personal.bio")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="shortDescriptionEn"
            render={({ field }) => (
              <CustomInput
                {...field}
                id="shortDescriptionEn"
                label={messages.shortDescriptionEn}
                placeholder={messages.shortDescriptionEn}
                icon={<FaFileAlt />}
                error={errors.shortDescriptionEn?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="shortDescriptionAr"
            render={({ field }) => (
              <CustomInput
                {...field}
                id="shortDescriptionAr"
                label={messages.shortDescriptionAr}
                placeholder={messages.shortDescriptionAr}
                icon={<FaFileAlt />}
                error={errors.shortDescriptionAr?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="visionEn"
            render={({ field }) => (
              <CustomInput
                {...field}
                type="textarea"
                id="visionEn"
                label={messages.visionEn}
                placeholder={messages.visionEn}
                icon={<FaFileAlt />}
                error={errors.visionEn?.message}
                rows={5}
              />
            )}
          />

          <Controller
            control={control}
            name="visionAr"
            render={({ field }) => (
              <CustomInput
                {...field}
                type="textarea"
                id="visionAr"
                label={messages.visionAr}
                placeholder={messages.visionAr}
                icon={<FaFileAlt />}
                error={errors.visionAr?.message}
                rows={5}
              />
            )}
          />
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
          >
            {t("form.submit")}
          </button>
        </div>
      </form>
    </CardDashBoard>
  );
}

