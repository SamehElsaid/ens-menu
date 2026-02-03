/* eslint-disable @next/next/no-img-element */
"use client";

import { Controller, Resolver, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "next-intl";
import { useState, useRef } from "react";
import CustomInput from "@/components/Custom/CustomInput";
import { FaUser, FaPhone, FaEnvelope, FaCamera, FaTimes } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { TiLocationOutline } from "react-icons/ti";
import { RiUserLocationLine } from "react-icons/ri";
import { BsGenderMale } from "react-icons/bs";
import { _checkFileSize, _checkFileType } from "@/shared/_shared";
import { toast } from "react-toastify";
import { UnmountClosed } from "react-collapse";
import { DashboardFormData } from "@/modules/personal";
import { createDashboardSchema } from "@/schemas/personalFormSchame";
import UploadFile from "../Custom/UploadFile";

export default function FormInformation({
  type,
}: {
  type?: "specialist" | "parent";
}) {
  const t = useTranslations("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<DashboardFormData>({
    defaultValues: {
      profileImage: null,
      firstName: "",
      lastName: "",
      displayNameEn: "",
      displayNameAr: "",
      phone: "",
      email: "",
      country: null,
      state: null,
      city: null,
      gender: null,
      attachments: [],
    },
    resolver: yupResolver(
      createDashboardSchema(t)
    ) as unknown as Resolver<DashboardFormData>,
    mode: "onChange",
  });

  const profileImage = useWatch({
    control,
    name: "profileImage",
  });

  const country = useWatch({
    control,
    name: "country",
  });

  const state = useWatch({
    control,
    name: "state",
  });

  const messages = {
    firstName: t("auth.firstName"),
    lastName: t("auth.lastName"),
    displayNameEn: t("auth.displayNameEn"),
    displayNameAr: t("auth.displayNameAr"),
    phone: t("auth.phone"),
    email: t("auth.email"),
    gender: t("auth.gender"),
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const size = 2;
    if (!_checkFileSize(file, size)) {
      toast.error(
        t("form.sizeMustBeLessThan{size}MB", { size: size.toString() }).replace(
          "{size}",
          size.toString()
        )
      );
      return;
    }

    if (
      !_checkFileType(file, [
        "image/png",
        "image/webp",
        "image/jpeg",
        "image/jpg",
      ])
    ) {
      toast.error(t("form.onlyPNGWEBPJPGAllowed"));
      return;
    }

    setValue("profileImage", file, { shouldValidate: true });
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setValue("profileImage", null, { shouldValidate: true });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = (data: DashboardFormData) => {
    console.log(data);
  };

  const attachments = useWatch({
    control,
    name: "attachments",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const size = 2;

    if (!files.every((file: File) => _checkFileSize(file, size))) {
      toast.error(
        t("form.sizeMustBeLessThan{size}MB", { size: size.toString() }).replace(
          "{size}",
          size.toString()
        )
      );
      return;
    }

    if (
      !files.every((file: File) =>
        _checkFileType(file, [
          "image/png",
          "image/webp",
          "image/jpeg",
          "image/jpg",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ])
      )
    ) {
      toast.error(t("form.onlyPNGWEBPJPGAllowed"));
      return;
    }

    setValue("attachments", [...(attachments || ([] as File[])), ...files], {
      shouldValidate: true,
    });
    e.target.value = "";
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  const handleDeleteFile = (index: number) => {
    const updatedFiles =
      attachments?.filter((_: File, i: number) => i !== index) ||
      ([] as File[]);
    setValue("attachments", updatedFiles, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Profile Image Upload */}
      <div className="w-full">
        <label className="capitalize px-3 mb-2 block" htmlFor="profileImage">
          {t("auth.profileImage") || "Profile Image"}
        </label>
        <div className="flex items-center gap-6">
          <div className="relative ">
            <div
              className={`min-w-32 max-w-32 min-h-32 max-h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                errors.profileImage
                  ? "border-red-500 bg-red-50"
                  : "border-primary bg-primary/10 hover:border-primary/70"
              }`}
              onClick={handleImageClick}
            >
              {imagePreview || profileImage ? (
                <div className="relative w-full h-full rounded-full ">
                  <img
                    src={
                      imagePreview ||
                      (profileImage ? URL.createObjectURL(profileImage) : "")
                    }
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <FaCamera className="w-8 h-8 text-primary" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/webp,image/jpeg,image/jpg"
              id="profileImage"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
        <UnmountClosed isOpened={Boolean(errors.profileImage)}>
          <p className="text-xs text-red-500 mt-1">
            {errors.profileImage?.message}
          </p>
        </UnmountClosed>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <CustomInput
              {...field}
              type="text"
              id="firstName"
              label={messages.firstName}
              placeholder={messages.firstName}
              icon={<FaUser />}
              error={errors.firstName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field }) => (
            <CustomInput
              {...field}
              type="text"
              id="lastName"
              label={messages.lastName}
              placeholder={messages.lastName}
              icon={<FaUser />}
              error={errors.lastName?.message}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="displayNameEn"
          render={({ field }) => (
            <CustomInput
              {...field}
              type="text"
              id="displayNameEn"
              label={messages.displayNameEn}
              placeholder={messages.displayNameEn}
              icon={<FaUser />}
              error={errors.displayNameEn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="displayNameAr"
          render={({ field }) => (
            <CustomInput
              {...field}
              type="text"
              id="displayNameAr"
              label={messages.displayNameAr}
              placeholder={messages.displayNameAr}
              icon={<FaUser />}
              error={errors.displayNameAr?.message}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <CustomInput
            {...field}
            type="tel"
            id="phone"
            label={messages.phone}
            placeholder={messages.phone}
            icon={<FaPhone />}
            error={errors.phone?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <CustomInput
            {...field}
            type="email"
            id="email"
            label={messages.email}
            placeholder={messages.email}
            icon={<FaEnvelope />}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="country"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="select"
            apiUrl="/api/countries"
            querySearch={"search"}
            placeholder={t("auth.selectCountry")}
            id="country"
            icon={<FaMapLocationDot />}
            label={t("auth.country")}
            reset={() => {
              setValue(
                "state",
                null as unknown as { label: string; value: string }
              );
              setValue(
                "city",
                null as unknown as { label: string; value: string }
              );
              trigger("state");
              trigger("city");
            }}
            error={errors.country?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="state"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="select"
            apiUrl={`/api/state`}
            triggerApiUrl={`countryId=${country?.value || ""}`}
            querySearch={"search"}
            placeholder={t("auth.selectState")}
            reset={() => {
              setValue(
                "city",
                null as unknown as { label: string; value: string }
              );
              trigger("city");
            }}
            id="state"
            icon={<TiLocationOutline />}
            label={t("auth.state")}
            error={errors.state?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="select"
            apiUrl={`/api/city`}
            triggerApiUrl={`stateId=${state?.value || ""}`}
            querySearch={"search"}
            placeholder={t("auth.selectCity")}
            id="city"
            icon={<RiUserLocationLine />}
            label={t("auth.city")}
            error={errors.city?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <CustomInput
            {...field}
            type="select"
            id="gender"
            label={messages.gender}
            placeholder={t("auth.selectGender")}
            icon={<BsGenderMale />}
            error={errors.gender?.message}
            options={[
              { label: t("auth.male"), value: "male" },
              { label: t("auth.female"), value: "female" },
            ]}
          />
        )}
      />
      {type === "parent" && (
        <UploadFile
          t={t}
          handleFileChange={handleFileChange}
          attachments={attachments || ([] as File[])}
          handleViewFile={handleViewFile}
          handleDeleteFile={handleDeleteFile}
          errors={errors?.attachments?.message || ""}
          label={"form.attachments"}
          size={2}
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/webp,image/jpeg,image/jpg"
        />
      )}
      <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
        >
          {t("form.submit")}
        </button>
      </div>
    </form>
  );
}
