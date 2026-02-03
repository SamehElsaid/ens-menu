"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { Controller, useForm, Resolver, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "next-intl";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaIdCard,
  FaGraduationCap,
  FaBuilding,
  FaMapMarker,
  FaLink,
} from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { RiUserLocationLine } from "react-icons/ri";
import { TiLocationOutline } from "react-icons/ti";
import CustomInput from "@/components/Custom/CustomInput";
import StepNavigation from "./StepNavigation";
import {
  specialistStep1Schema,
  specialistStep2Schema,
  specialistStep3Schema,
} from "@/schemas/registerSchema"; // adjust import paths
import {
  SpecialistFormData,
  SpecialistFormDataStep1,
  SpecialistFormDataStep2,
  SpecialistFormDataStep3,
} from "@/hooks/useRegisterForm"; // adjust import paths
import {
  BsFacebook,
  BsGenderMale,
  BsInstagram,
  BsLinkedin,
  BsTiktok,
  BsTwitter,
  BsWhatsapp,
  BsYoutube,
} from "react-icons/bs";
import { _checkFileSize, _checkFileType } from "@/shared/_shared";
import { toast } from "react-toastify";
import { UnmountClosed } from "react-collapse";
import { useRouter } from "@/i18n/navigation";
import { TbLockPassword } from "react-icons/tb";
import UploadFile from "../Custom/UploadFile";

// --------------------------------
// MAIN COMPONENT
// --------------------------------

export default function SpecialistRegisterForm({
  type,
}: {
  type: "specialist" | "center";
}) {
  const t = useTranslations("");
  const [step, setStep] = useState<number>(1);
  const [totalSteps] = useState<number>(2);
  const [fullFormData, setFullFormData] = useState<Partial<SpecialistFormData>>(
    {}
  );

  // Step navigation handlers
  const handleNext = (data: Partial<typeof fullFormData>) => {
    setFullFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const submitSpecialist = (data: SpecialistFormDataStep2) => {
    const allData: Partial<SpecialistFormData> = { ...fullFormData, ...data };
    setFullFormData(allData);
    console.log("submitSpecialist", allData);
  };

  const submitCenter = (data: SpecialistFormDataStep3) => {
    const allData: Partial<SpecialistFormData> = { ...fullFormData, ...data };
    setFullFormData(allData);
    console.log("submitCenter", allData);
  };

  const handleBack = (data: Partial<SpecialistFormData>) => {
    setFullFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1Form
            t={t}
            onNext={handleNext}
            step={step}
            fullFormData={fullFormData}
            totalSteps={totalSteps}
            type={type}
          />
        );
      case 2:
        return (
          <Step2Form
            t={t}
            onNext={handleNext}
            onBack={handleBack}
            step={step}
            fullFormData={fullFormData}
            submitSpecialist={submitSpecialist}
            type={type}
          />
        );
      case 3:
        return (
          <Step3Form
            t={t}
            onBack={handleBack}
            step={step}
            fullFormData={fullFormData}
            submitCenter={submitCenter}
          />
        );
      default:
        return null;
    }
  };

  return <div className="">{renderStep()}</div>;
}

// --------------------------------
// STEP 1 FORM
// --------------------------------
const Step1Form = ({
  t,
  onNext,
  step,
  fullFormData,
  type,
}: {
  t: ReturnType<typeof useTranslations<"">>;
  onNext: (data: SpecialistFormDataStep1) => void;
  step: number;
  fullFormData: Partial<SpecialistFormData>;
  totalSteps: number;
  type: "specialist" | "center";
}) => {
  const router = useRouter();
  const messages = {
    firstName: t("auth.firstName"),
    lastName: t("auth.lastName"),
    phone: t("auth.phone"),
    email: t("auth.email"),
    gender: t("auth.gender"),
    birthDate: t("auth.birthDate"),
  };

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SpecialistFormDataStep1>({
    defaultValues: {
      firstName: fullFormData.firstName || "",
      lastName: fullFormData.lastName || "",
      phone: fullFormData.phone || "",
      email: fullFormData.email || "",
      country:
        fullFormData.country ||
        (null as unknown as { label: string; value: string }),
      state:
        fullFormData.state ||
        (null as unknown as { label: string; value: string }),
      city:
        fullFormData.city ||
        (null as unknown as { label: string; value: string }),
      gender:
        fullFormData.gender ||
        (null as unknown as { label: string; value: string }),
      birthDate: fullFormData.birthDate
        ? new Date(fullFormData.birthDate)
        : new Date(),
      password: fullFormData.password || "",
      confirmPassword: fullFormData.confirmPassword || "",
    },
    resolver: yupResolver(
      specialistStep1Schema(t)
    ) as unknown as Resolver<SpecialistFormDataStep1>,
    mode: "onChange",
  });

  const onSubmit = (data: SpecialistFormDataStep1) => onNext(data);

  const country = useWatch({
    control,
    name: "country",
  });
  const state = useWatch({
    control,
    name: "state",
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 animate-fadeIn"
    >
      <h3 className="text-xl font-bold text-center mb-4">
        {t("form.step")} {step}: {t("form.personalInformation")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            icon={<TiLocationOutline  />}
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
            placeholder={messages.gender}
            icon={<BsGenderMale />}
            error={errors.gender?.message}
            options={[
              { label: t("auth.male"), value: "male" },
              {
                label: t("auth.female"),
                value: "female",
              },
            ]}
          />
        )}
      />
      <Controller
        control={control}
        name="birthDate"
        render={({ field }) => (
          <CustomInput
            {...field}
            type="date"
            id="birthDate"
            label={messages.birthDate}
            placeholder={messages.birthDate}
            icon={<FaCalendarAlt />}
            error={errors.birthDate?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="password"
            placeholder={t("auth.password")}
            id="password"
            icon={<TbLockPassword />}
            label={t("auth.password")}
            error={errors.password?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="password"
            placeholder={t("auth.confirmPassword")}
            id="confirmPassword"
            icon={<TbLockPassword />}
            label={t("auth.confirmPassword")}
            error={errors.confirmPassword?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />
      <StepNavigation
        currentStep={step}
        totalSteps={type === "center" ? 3 : 2}
        nextLabel={t("form.next")}
        onBack={() => {
          router.push("/auth/register");
        }}
      />
    </form>
  );
};

// --------------------------------
// STEP 2 FORM (placeholder)
// --------------------------------
const Step2Form = ({
  t,
  onNext,
  onBack,
  step,
  fullFormData,
  submitSpecialist,
  type,
}: {
  t: ReturnType<typeof useTranslations<"">>;
  onNext: (data: SpecialistFormDataStep2) => void;
  onBack: (data: Partial<SpecialistFormData>) => void;
  step: number;
  fullFormData: Partial<SpecialistFormData>;
  submitSpecialist: (data: SpecialistFormDataStep2) => void;
  type: "specialist" | "center";
}) => {
  const {
    control,
    handleSubmit,
    getValues,
    setValue,

    formState: { errors },
  } = useForm<SpecialistFormDataStep2>({
    defaultValues: {
      specialization:
        fullFormData.specialization ||
        (null as unknown as { label: string; value: string }),
      fullName: fullFormData.fullName || "",
      nationalID: fullFormData.nationalID || "",
      attachments: fullFormData.attachments || [],
      ownsCenter: fullFormData.ownsCenter || false,
    },
    resolver: yupResolver(
      specialistStep2Schema(t)
    ) as unknown as Resolver<SpecialistFormDataStep2>,
    mode: "onChange",
  });
  const [steps, setSteps] = useState<number>(type === "center" ? 3 : 2);
  const onSubmit = (data: SpecialistFormDataStep2) =>
    steps === 2 ? submitSpecialist(data) : onNext(data);

  const attachments =
    useWatch({
      control,
      name: "attachments",
      defaultValue: [],
    }) || [];

  console.log(getValues());

  useEffect(() => {
    setSteps(type === "center" ? 3 : 2);
    if (fullFormData.attachments && fullFormData.attachments.length > 0) {
      setValue("attachments", fullFormData.attachments, {
        shouldValidate: true,
      });
    }
  }, [type, fullFormData.attachments, setValue]);

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
        ])
      )
    ) {
      toast.error(t("form.onlyPNGWEBPJPGAllowed"));
      return;
    }

    setValue("attachments", [...attachments, ...files], {
      shouldValidate: true,
    });
    e.target.value = "";
  };

  const handleDeleteFile = (index: number) => {
    const updatedFiles = attachments.filter(
      (_: File, i: number) => i !== index
    );
    setValue("attachments", updatedFiles, { shouldValidate: true });
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 animate-fadeIn"
    >
      <h3 className="text-center text-xl font-semibold mb-2">
        {t("form.step")} {step}: {t("form.professionalDetails")}
      </h3>

      {/* TODO: Add Step 2 fields */}

      <div className="space-y-6 animate-fadeIn">
        <h3 className=" font-semibold text-center mb-4">
          {t("form.jobInformation")}
        </h3>

        <Controller
          control={control}
          name="specialization"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="select"
              placeholder={t("form.specialization")}
              id="specialization"
              icon={<FaGraduationCap />}
              isSearchable={true}
              label={t("form.specialization")}
              error={errors?.specialization?.message || ""}
              value={value}
              onChange={onChange}
              options={[
                {
                  label: t("form.specialization1"),
                  value: "specialization",
                },
                {
                  label: t("form.specialization2"),
                  value: "specialization2",
                },
                {
                  label: t("form.specialization3"),
                  value: "specialization3",
                },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="fullName"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="text"
              placeholder={t("form.fullName")}
              id="fullName"
              icon={<FaUser />}
              label={t("form.fullName")}
              error={errors?.fullName?.message || ""}
              value={value}
              onChange={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="nationalID"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="text"
              placeholder={t("form.nationalID")}
              id="nationalID"
              icon={<FaIdCard />}
              label={t("form.nationalID")}
              error={errors?.nationalID?.message || ""}
              value={value}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                onChange(onlyNumbers);
              }}
            />
          )}
        />

        <UploadFile
          t={t}
          handleFileChange={handleFileChange}
          attachments={attachments}
          handleViewFile={handleViewFile}
          handleDeleteFile={handleDeleteFile}
          errors={errors?.attachments?.message || ""}
          label={"form.attachments"}
          size={2}
          accept="image/png,image/webp,image/jpeg,image/jpg"
        />
      </div>

      <StepNavigation
        currentStep={step}
        totalSteps={steps}
        onBack={() => onBack(getValues())}
        nextLabel={step === steps ? t("form.finish") : t("form.next")}
        backLabel={t("form.back")}
      />
    </form>
  );
};

// --------------------------------
// STEP 3 FORM (placeholder)
// --------------------------------
const Step3Form = ({
  t,
  onBack,
  step,
  fullFormData,
  submitCenter,
}: {
  t: ReturnType<typeof useTranslations<"">>;
  onBack: (data: Partial<SpecialistFormData>) => void;
  step: number;
  fullFormData: Partial<SpecialistFormData>;
  submitCenter: (data: SpecialistFormDataStep3) => void;
}) => {
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SpecialistFormDataStep3>({
    defaultValues: {
      centerName: fullFormData.centerName || "",
      address: fullFormData.address || "",
      centerPhone: fullFormData.centerPhone || "",
      centerEmail: fullFormData.centerEmail || "",
      centerImages: fullFormData.centerImages || [],
      socialLinks: fullFormData.socialLinks || {
        facebook: "",
        instagram: "",
        whatsapp: "",
        linkedin: "",
        twitter: "",
        youtube: "",
        tiktok: "",
        telegram: "",
        reddit: "",
        pinterest: "",
        github: "",
      },
    },
    resolver: yupResolver(
      specialistStep3Schema(t)
    ) as unknown as Resolver<SpecialistFormDataStep3>,
    mode: "onChange",
  });

  const onSubmit = (data: SpecialistFormDataStep3) => submitCenter(data);
  const centerImages =
    useWatch({
      control,
      name: "centerImages",
      defaultValue: [],
    }) || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const size = 2;

    if (!files.every((file: File) => _checkFileSize(file, size))) {
      toast.error(
        t("form.sizeMustBeLessThan{size}MB", { size: size.toString() })
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
        ])
      )
    ) {
      toast.error(t("form.onlyPNGWEBPJPGAllowed"));
      return;
    }

    setValue("centerImages", [...centerImages, ...files], {
      shouldValidate: true,
    });
    e.target.value = "";
  };

  useEffect(() => {
    if (fullFormData.centerImages && fullFormData.centerImages.length > 0) {
      setValue("centerImages", fullFormData.centerImages, {
        shouldValidate: true,
      });
    }
  }, [fullFormData.centerImages, setValue]);

  const handleViewCenterImages = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  const handleDeleteCenterImages = (index: number) => {
    const updatedFiles = centerImages.filter(
      (_: File, i: number) => i !== index
    );
    setValue("centerImages", updatedFiles, { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 animate-fadeIn"
    >
      <h3 className="text-xl font-bold text-center mb-4">
        {t("form.step")} {step}: {t("form.centerInformation")}
      </h3>

      <Controller
        control={control}
        name="centerName"
        render={({ field }) => (
          <CustomInput
            type="text"
            placeholder={t("form.centerName")}
            id="centerName"
            icon={<FaBuilding />}
            label={t("form.centerName")}
            error={errors?.centerName?.message || ""}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="address"
        render={({ field }) => (
          <CustomInput
            type="text"
            placeholder={t("form.address")}
            id="address"
            icon={<FaMapMarker />}
            label={t("form.address")}
            error={errors?.address?.message || ""}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="centerPhone"
        render={({ field }) => (
          <CustomInput
            type="tel"
            placeholder={t("form.centerPhone")}
            id="centerPhone"
            icon={<FaPhone />}
            label={t("form.centerPhone")}
            error={errors?.centerPhone?.message || ""}
            {...field}
          />
        )}
      />
      <Controller
        control={control}
        name="centerEmail"
        render={({ field }) => (
          <CustomInput
            type="email"
            placeholder={t("form.centerEmail")}
            id="centerEmail"
            icon={<FaEnvelope />}
            label={t("form.centerEmail")}
            error={errors?.centerEmail?.message || ""}
            {...field}
          />
        )}
      />
      <UploadFile
        t={t}
        handleFileChange={handleFileChange}
        attachments={centerImages}
        handleViewFile={handleViewCenterImages}
        handleDeleteFile={handleDeleteCenterImages}
        errors={errors?.centerImages?.message || ""}
        label={"form.centerImages"}
        size={2}
        accept="image/png,image/webp,image/jpeg,image/jpg"
      />

      <div
        className={`p-4 bg-primary/5 rounded-lg ${
          errors.socialLinks ? "bg-red-500/10" : ""
        }`}
      >
        <label className="block text-sm font-medium mb-3">
          {t("form.socialLinks")}
        </label>
        <div className="space-y-4">
          <Controller
            control={control}
            name="socialLinks.facebook"
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center gap-3">
                <BsFacebook className="text-2xl text-blue-600" />
                <CustomInput
                  type="text"
                  placeholder={t("form.facebook")}
                  id="facebook"
                  icon={<FaLink />}
                  error={errors.socialLinks?.facebook?.message}
                  value={value || ""}
                  onChange={onChange}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="socialLinks.instagram"
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center gap-3">
                <BsInstagram className="text-2xl text-pink-600" />
                <CustomInput
                  type="text"
                  placeholder={t("form.instagram")}
                  id="instagram"
                  icon={<FaLink />}
                  error={errors.socialLinks?.instagram?.message}
                  value={value || ""}
                  onChange={onChange}
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="socialLinks.whatsapp"
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center gap-3">
                <BsWhatsapp className="text-2xl text-green-600" />
                <CustomInput
                  type="text"
                  placeholder={t("form.whatsapp")}
                  id="whatsapp"
                  icon={<FaLink />}
                  error={errors.socialLinks?.whatsapp?.message}
                  value={value || ""}
                  onChange={onChange}
                />
              </div>
            )}
          />{" "}
          <Controller
            control={control}
            name="socialLinks.linkedin"
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center gap-3">
                <BsLinkedin className="text-2xl text-blue-600" />
                <CustomInput
                  type="text"
                  placeholder={t("form.linkedin")}
                  id="linkedin"
                  icon={<FaLink />}
                  error={errors.socialLinks?.linkedin?.message}
                  value={value || ""}
                  onChange={onChange}
                />
              </div>
            )}
          />{" "}
          <Controller
            control={control}
            name="socialLinks.twitter"
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center gap-3">
                <BsTwitter className="text-2xl text-blue-600" />
                <CustomInput
                  type="text"
                  placeholder={t("form.twitter")}
                  id="twitter"
                  icon={<FaLink />}
                  error={errors.socialLinks?.twitter?.message}
                  value={value || ""}
                  onChange={onChange}
                />
              </div>
            )}
          />{" "}
          <Controller
            control={control}
            name="socialLinks.youtube"
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center gap-3">
                <BsYoutube className="text-2xl text-red-600" />
                <CustomInput
                  type="text"
                  placeholder={t("form.youtube")}
                  id="youtube"
                  icon={<FaLink />}
                  error={errors.socialLinks?.youtube?.message}
                  value={value || ""}
                  onChange={onChange}
                />
              </div>
            )}
          />{" "}
          <Controller
            control={control}
            name="socialLinks.tiktok"
            render={({ field: { value, onChange } }) => (
              <div className="flex items-center gap-3">
                <BsTiktok className="text-2xl text-black-600" />
                <CustomInput
                  type="text"
                  placeholder={t("form.tiktok")}
                  id="tiktok"
                  icon={<FaLink />}
                  error={errors.socialLinks?.tiktok?.message}
                  value={value || ""}
                  onChange={onChange}
                />
              </div>
            )}
          />
          <UnmountClosed isOpened={Boolean(errors.socialLinks)}>
            <p className="text-xs text-red-500 mt-1">
              {errors.socialLinks?.message}
            </p>
          </UnmountClosed>
        </div>
      </div>
      <StepNavigation
        currentStep={step}
        totalSteps={3}
        nextLabel={t("form.finish")}
        onBack={() => onBack(getValues())}
      />
    </form>
  );
};
