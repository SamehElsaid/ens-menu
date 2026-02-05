"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "next-intl";
import * as yup from "yup";
import { FaUser, FaGraduationCap, } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import CustomInput from "@/components/Custom/CustomInput";
import { GiAchievement } from "react-icons/gi";

type SpecialtyFormData = {
  prefixTitle: { label: string; value: string } | null;
  special: { label: string; value: string } | null;
  subSpecial: { label: string; value: string }[];
  experience: { label: string; value: string }[];
};

const createSpecialtySchema = (t: ReturnType<typeof useTranslations<"">>) => {
  return yup.object().shape({
    prefixTitle: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .nullable()
      .required(
        t("personal.prefixTitleRequired") || "Prefix Title is required"
      ),
    special: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .nullable()
      .required(t("personal.specialRequired") || "Special is required"),
    subSpecial: yup
      .array()
      .of(
        yup.object().shape({
          label: yup.string().required(),
          value: yup.string().required(),
        })
      )
      .min(
        1,
        t("personal.subSpecialRequired") ||
          "At least one Sub Special is required"
      ),
    experience: yup
      .array()
      .of(
        yup.object().shape({
          label: yup.string().required(),
          value: yup.string().required(),
        })
      )
      .min(
        1,
        t("personal.experienceRequired") ||
          "At least one Experience is required"
      ),
  });
};

export default function SpecialtyPage() {
  const t = useTranslations("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SpecialtyFormData>({
    defaultValues: {
      prefixTitle: null,
      special: null,
      subSpecial: [],
      experience: [],
    },
    resolver: yupResolver(
      createSpecialtySchema(t)
    ) as unknown as Resolver<SpecialtyFormData>,
    mode: "onChange",
  });

  const messages = {
    prefixTitle: t("personal.prefixTitle") || "Prefix Title",
    special: t("personal.special") || "Special",
    subSpecial: t("personal.subSpecial") || "Sub Special",
    experience: t("personal.experience") || "Experience",
  };

  const prefixTitleOptions = [
    { label: "Dr", value: "dr" },
    { label: "Special", value: "special" },
  ];

  // These can be replaced with API calls or more comprehensive data
  const specialOptions = [
    { label: "Cardiology", value: "cardiology" },
    { label: "Dermatology", value: "dermatology" },
    { label: "Neurology", value: "neurology" },
    { label: "Pediatrics", value: "pediatrics" },
    { label: "Orthopedics", value: "orthopedics" },
  ];

  const subSpecialOptions = [
    { label: "Pediatric Cardiology", value: "pediatric-cardiology" },
    { label: "Adult Cardiology", value: "adult-cardiology" },
    { label: "Clinical Dermatology", value: "clinical-dermatology" },
    { label: "Cosmetic Dermatology", value: "cosmetic-dermatology" },
    { label: "Child Neurology", value: "child-neurology" },
    { label: "Adult Neurology", value: "adult-neurology" },
  ];

  const experienceOptions = [
    { label: "Bruxism", value: "work-experience" },
    { label: "Teeth whitening", value: "internship" },
    { label: "Volunteering", value: "volunteering" },
    { label: "TMJ Disorder", value: "TMJ Disorder" },
  ];

  const onSubmit = (data: SpecialtyFormData) => {
    console.log(data);
    // Handle form submission here
  };

  return (
    <CardDashBoard>
      <h1 className="text-2xl font-bold mb-6">
        {t("personal.specialty") || "Specialty"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="prefixTitle"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                type="select"
                id="prefixTitle"
                label={messages.prefixTitle}
                placeholder={messages.prefixTitle}
                icon={<FaUser />}
                error={errors.prefixTitle?.message}
                value={value}
                onChange={onChange}
                options={prefixTitleOptions}
              />
            )}
          />

          <Controller
            control={control}
            name="special"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                type="select"
                id="special"
                label={messages.special}
                placeholder={messages.special}
                icon={<FaGraduationCap />}
                error={errors.special?.message}
                value={value}
                onChange={onChange}
                options={specialOptions}
                isSearchable={true}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Controller
            control={control}
            name="subSpecial"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                type="select"
                id="subSpecial"
                label={messages.subSpecial}
                placeholder={messages.subSpecial}
                icon={<FaGraduationCap />}
                error={errors.subSpecial?.message}
                value={value}
                onChange={onChange}
                options={subSpecialOptions}
                isSearchable={true}
                isMulti={true}
              />
            )}
          />

          <Controller
            control={control}
            name="experience"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                type="select"
                id="experience"
                label={messages.experience}
                placeholder={messages.experience}
                icon={<GiAchievement />}
                error={errors.experience?.message}
                value={value}
                onChange={onChange}
                options={experienceOptions}
                isSearchable={true}
                isMulti={true}
              />
            )}
          />
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
          >
            {t("form.submit") || "Submit"}
          </button>
        </div>
      </form>
    </CardDashBoard>
  );
}
