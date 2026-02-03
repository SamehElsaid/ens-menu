"use client";
import { Controller, Resolver, useForm, useWatch } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import { ParentFormData } from "@/hooks/useRegisterForm";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaArrowLeft,
} from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { yupResolver } from "@hookform/resolvers/yup";
import { parentRegisterSchema } from "@/schemas/registerSchema";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FaMapLocationDot } from "react-icons/fa6";
import { TiLocationOutline } from "react-icons/ti";
import { RiUserLocationLine } from "react-icons/ri";

export default function ParentRegisterForm() {
  const onSubmit = (data: ParentFormData) => console.log(data);
  const t = useTranslations("");
  const router = useRouter();
  const locale = useLocale();
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ParentFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      country: null as unknown as { label: string; value: string },
      state: null as unknown as { label: string; value: string },
      city: null as unknown as { label: string; value: string },
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(
      parentRegisterSchema(t)
    ) as unknown as Resolver<ParentFormData>,
    mode: "onChange",
  });

  const messages = {
    firstName: t("auth.firstName"),
    lastName: t("auth.lastName"),
    phone: t("auth.phone"),
    email: t("auth.email"),
    country: t("auth.country"),
    password: t("auth.password"),
    confirmPassword: t("auth.confirmPassword"),
    register: t("auth.register"),
  };

  const country = useWatch({
    control,
    name: "country",
  });
  const state = useWatch({
    control,
    name: "state",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Controller
          control={control}
          name="firstName"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="text"
              placeholder={messages.firstName}
              id="firstName"
              icon={<FaUser />}
              label={messages.firstName}
              error={errors.firstName?.message}
              value={value}
              onChange={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="text"
              placeholder={messages.lastName}
              id="lastName"
              icon={<FaUser />}
              label={messages.lastName}
              error={errors.lastName?.message}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="tel"
            placeholder={messages.phone}
            id="phone"
            icon={<FaPhone />}
            label={messages.phone}
            error={errors.phone?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="email"
            placeholder={messages.email}
            id="email"
            icon={<FaEnvelope />}
            label={messages.email}
            error={errors.email?.message}
            value={value}
            onChange={onChange}
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
        name="password"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            type="password"
            placeholder={messages.password}
            id="password"
            icon={<TbLockPassword />}
            label={messages.password}
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
            placeholder={messages.confirmPassword}
            id="confirmPassword"
            icon={<TbLockPassword />}
            label={messages.confirmPassword}
            error={errors.confirmPassword?.message}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <div className="flex  ">
        <div className="flex w-full items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${"bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60"}`}
          >
            <FaArrowLeft className={`${locale === "ar" ? "rotate-180" : ""}`} />
            {t("form.back")}
          </button>

          <div className="flex items-center gap-2"></div>

          <button
            type="submit"
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${"btn-gradient-primary shadow-md hover:shadow-lg"}`}
          >
            {messages.register}
          </button>
        </div>
      </div>
    </form>
  );
}
