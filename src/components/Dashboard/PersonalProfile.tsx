"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import {
  HiOutlineCloudUpload,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineGlobeAlt,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineArrowRight,
  HiOutlineCamera,
  HiOutlineX,
  HiOutlineChat,
  HiArrowUp,
  HiArrowDown,
} from "react-icons/hi";
import LinkTo from "@/components/Global/LinkTo";
import CustomInput from "@/components/Custom/CustomInput";
import { axiosGet, axiosPatch, axiosPost } from "@/shared/axiosCall";
import { useAppDispatch } from "@/store/hooks";
import { REMOVE_USER, SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { toast } from "react-toastify";
import type { SingleValue } from "react-select";
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from "@/schemas/changePasswordSchema";
import { useRouter } from "@/i18n/navigation";
import Cookies from "js-cookie";

export type Plan = {
  id: number;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxMenus: number;
  maxProductsPerMenu: number;
  allowCustomDomain: boolean;
  hasAds: boolean;
  features: string[];
};

type PlansResponse = {
  success: boolean;
  plans: Plan[];
};

type AuthUser = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
  createdAt?: string;
  emailVerified?: boolean;
  isActive?: boolean;
  role?: string;
  user?: {
    subscription?: {
      planName?: string;
      status?: string;
      billingCycle?: string;
      startDate?: string;
      renewalDate?: string;
      amount?: number;
      currency?: string;
      interval?: string;
    };
  };
};

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const AVATAR_ACCEPT = "image/png,image/jpeg,image/jpg,image/gif";
const WHATSAPP_URL = "https://wa.me/971586551491";

const CUSTOM_PLAN_FEATURE_KEYS = [
  "waiterRequest",
  "billRequest",
  "onlineOrdering",
  "deliveryMaps",
  "newLanguages",
  "onlinePayment",
] as const;

type GenderOption = { label: string; value: string };

type PersonalProfileProps = {
  backLink?: string;
  backLinkText?: string;
  /** When true, subscription/plans section is hidden (e.g. for admin users) */
  hideSubscriptionSection?: boolean;
};

export default function PersonalProfile({
  backLink,
  backLinkText,
  hideSubscriptionSection: hideSubscriptionProp,
}: PersonalProfileProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("personalProfile");
  const tRoot = useTranslations("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authData = useAppSelector((state) => state.auth.data) as unknown as {
    user: AuthUser;
  };
  const menuId = useAppSelector((state) => state.menuData.menu?.id);
  const user = authData ?? ({} as AuthUser);
  const profile = user?.user ?? ({} as AuthUser);

  const displayName = profile?.name ?? profile?.email?.split("@")[0] ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  const isAdmin = (authData?.user as AuthUser | undefined)?.role === "admin";
  const hideSubscriptionSection = hideSubscriptionProp === true || isAdmin;

  /** Uploaded file preview (blob URL); takes precedence over API profileImage */
  const [profileImage, setProfileImage] = useState<string | null>(null);
  /** Selected file to upload on save */
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  /** Display: uploaded preview or profile image from API */
  const displayProfileImage = profileImage ?? profile?.profileImage ?? null;
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phoneNumber ?? "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null,
  );
  const [country, setCountry] = useState(profile?.country ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [gender, setGender] = useState<SingleValue<GenderOption>>(
    profile?.gender
      ? {
          value: profile.gender,
          label:
            profile.gender === "male"
              ? t("genderMale")
              : profile.gender === "female"
                ? t("genderFemale")
                : t("genderOther"),
        }
      : null,
  );
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const changePasswordForm = useForm<ChangePasswordSchema>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    resolver: yupResolver(
      changePasswordSchema(tRoot),
    ) as unknown as Resolver<ChangePasswordSchema>,
    mode: "onChange",
  });
  const {
    control: controlPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = changePasswordForm;

  // Fetch plans and sync form from auth when profile is available (skip for admin)
  useEffect(() => {
    if (!authData?.user) {
      queueMicrotask(() => setPlansLoading(false));
      return;
    }
    const u = authData.user as AuthUser;
    if (u?.role === "admin") {
      queueMicrotask(() => setPlansLoading(false));
      return;
    }
    queueMicrotask(() => {
      setName(u?.name ?? "");
      setPhone(u?.phoneNumber ?? "");
      setDateOfBirth(u?.dateOfBirth ? new Date(u.dateOfBirth) : null);
      setCountry(u?.country ?? "");
      setAddress(u?.address ?? "");
      setGender(
        u?.gender
          ? {
              value: u.gender,
              label:
                u.gender === "male"
                  ? t("genderMale")
                  : u.gender === "female"
                    ? t("genderFemale")
                    : t("genderOther"),
            }
          : null,
      );
    });

    axiosGet<PlansResponse>("/public/plans", locale, undefined, undefined, true)
      .then((res) => {
        if (res.status && res.data?.plans?.length) {
          setPlans(res.data.plans);
        }
      })
      .finally(() => setPlansLoading(false));
  }, [locale, authData?.user, t]);

  // Revoke blob URL on unmount or when profileImage changes to avoid memory leaks
  useEffect(() => {
    return () => {
      if (profileImage && profileImage.startsWith("blob:")) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  const genderOptions: GenderOption[] = [
    { value: "male", label: t("genderMale") },
    { value: "female", label: t("genderFemale") },
  ];

  const processFile = useCallback((file: File | null) => {
    if (!file || file.size > MAX_AVATAR_SIZE_BYTES) return;
    setProfileImageFile(file);
    setProfileImage((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      e.target.value = "";
      processFile(file);
    },
    [processFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) processFile(file);
    },
    [processFile],
  );

  const clearProfileImage = useCallback(() => {
    setProfileImageFile(null);
    setProfileImage((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const triggerFileInput = () => fileInputRef.current?.click();

  type ProfilePayload = {
    name: string;
    phoneNumber: string;
    country: string;
    gender: string;
    address: string;
    profileImage?: string;
    dateOfBirth?: string;
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    let res: { status: boolean; data?: { user?: AuthUser } };

    if (profileImageFile) {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("phoneNumber", phone?.trim() ?? "");
      form.append("country", country.trim());
      form.append("gender", gender?.value ?? "");
      form.append("address", address.trim());
      if (dateOfBirth) form.append("dateOfBirth", dateOfBirth.toISOString());
      form.append("profileImage", profileImageFile);

      res = await axiosPatch<FormData, { user?: AuthUser }>(
        "/user/profile",
        locale,
        form,
        true,
      );
    } else {
      const profileImageUrl =
        profileImage && !profileImage.startsWith("blob:")
          ? profileImage
          : profile?.profileImage;

      const payload: ProfilePayload = {
        name: name.trim(),
        phoneNumber: phone?.trim() ?? "",
        country: country.trim(),
        gender: gender?.value ?? "",
        address: address.trim(),
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
      };
      if (profileImageUrl) payload.profileImage = profileImageUrl;

      res = await axiosPatch<ProfilePayload, { user?: AuthUser }>(
        "/user/profile",
        locale,
        payload,
      );
    }

    setSaveLoading(false);

    if (res?.status && res.data) {
      toast.success(
        locale === "ar"
          ? "تم حفظ التغييرات بنجاح"
          : "Changes saved successfully",
      );
      const updatedUser = (res.data as { user?: AuthUser })?.user;
      if (updatedUser && authData) {
        dispatch(
          SET_ACTIVE_USER({
            ...authData,
            user: {
              ...authData.user,
              ...updatedUser,
              profileImage:
                updatedUser?.profileImage ??
                authData.user?.profileImage ??
                null,
            },
          } as unknown as Parameters<typeof SET_ACTIVE_USER>[0]),
        );
      }
      if (profileImage?.startsWith("blob:")) {
        URL.revokeObjectURL(profileImage);
        setProfileImage(null);
      }
      setProfileImageFile(null);
    } else {
      toast.error(
        locale === "ar" ? "فشل في حفظ التغييرات" : "Failed to save changes",
      );
    }
  };

  const onSubmitChangePassword = async (data: ChangePasswordSchema) => {
    setChangePasswordLoading(true);
    const res = await axiosPost<
      { currentPassword: string; newPassword: string },
      { user?: AuthUser }
    >("/user/change-password", locale, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    setChangePasswordLoading(false);
    if (res?.status) {
      dispatch(REMOVE_USER());
      Cookies.remove("sub", { path: "/" });

      router.push("/auth/login");
      resetPasswordForm();
    } else {
      toast.error(
        locale === "ar"
          ? "فشل في تغيير كلمة المرور"
          : "Failed to change password",
      );
    }
  };

  const defaultBackLink = backLink ?? `/dashboard/${menuId ?? ""}/settings`;
  const defaultBackLinkText = backLinkText ?? t("backToProfile");

  const customPlanFeatures = CUSTOM_PLAN_FEATURE_KEYS.map((key) =>
    tRoot("Landing.pricing.customFeatures." + key),
  );
  const isCurrentCustomPlan = Boolean(
    profile?.user?.subscription?.planName &&
    String(profile.user.subscription.planName).toLowerCase().includes("custom"),
  );

  return (
    <div className="min-h-[calc(100vh-120px)]">
      {defaultBackLink && (
        <div className={isRTL ? "text-right mb-4" : "text-left mb-4"}>
          <LinkTo
            href={defaultBackLink}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <HiOutlineArrowRight
              className={`text-lg ${isRTL ? "order-2 rotate-180" : ""}`}
            />
            {defaultBackLinkText}
          </LinkTo>
        </div>
      )}

      <header
        className={
          isRTL ? "text-right space-y-1 mb-8" : "text-left space-y-1 mb-8"
        }
      >
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t("editPageTitle")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("editSubtitle")}
        </p>
      </header>

      <div className="space-y-8">
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 md:p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-5">
            {t("personalInfo")}
          </h3>

          {/* Profile image with Personal Information */}
          <div
            className={`flex flex-wrap items-start gap-6 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ACCEPT}
              className="hidden"
              onChange={onFileChange}
            />

            {/* Avatar with hover overlay */}
            <div
              onClick={triggerFileInput}
              onKeyDown={(e) => e.key === "Enter" && triggerFileInput()}
              role="button"
              tabIndex={0}
              className="relative group shrink-0 cursor-pointer rounded-full ring-2 ring-slate-200 dark:ring-slate-600 ring-offset-2 dark:ring-offset-slate-900 transition-all duration-200 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className="h-24 w-24 rounded-full bg-linear-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/40 flex items-center justify-center text-3xl font-bold text-amber-700 dark:text-amber-300 overflow-hidden shadow-inner">
                {displayProfileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob or API URL
                  <img
                    src={displayProfileImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-slate-900/50 dark:bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <HiOutlineCamera className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Drop zone */}
            <div className="flex-1 min-w-[220px]">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("profilePicture")}
              </p>
              <div
                onClick={triggerFileInput}
                onKeyDown={(e) => e.key === "Enter" && triggerFileInput()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 py-8 px-6 min-h-[140px] ${
                  dragOver
                    ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[1.01]"
                    : "border-slate-200 dark:border-slate-600 hover:border-primary/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`rounded-full p-3 transition-colors ${dragOver ? "bg-primary/15 dark:bg-primary/20" : "bg-slate-100 dark:bg-slate-800"}`}
                >
                  <HiOutlineCloudUpload
                    className={`w-8 h-8 ${dragOver ? "text-primary" : "text-slate-400 dark:text-slate-500"}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("dragDropOrClick")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    PNG, JPG, GIF ·{" "}
                    {locale === "ar" ? "حد أقصى 5 ميجا" : "Max 5MB"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                  className="text-sm font-medium text-primary hover:text-primary/80 dark:hover:text-primary/90 transition-colors"
                >
                  {t("uploadImage")}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {t("recommendedImage")}
              </p>
              {profileImageFile && (
                <div
                  className={`flex flex-wrap items-center gap-2 mt-3 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[180px]">
                    {profileImageFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={clearProfileImage}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <HiOutlineX className="w-3.5 h-3.5" />
                    {locale === "ar" ? "إزالة" : "Remove"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {t("fullName")} *
              </label>
              <CustomInput
                type="text"
                id="fullName"
                value={name}
                onChange={(e) =>
                  setName(
                    (e as React.ChangeEvent<HTMLInputElement>).target.value,
                  )
                }
                placeholder={t("fullName")}
                icon={<HiOutlineUser className="text-lg" />}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {t("email")}
              </label>
              <CustomInput
                type="email"
                id="email"
                value={profile?.email ?? ""}
                disabled
                placeholder={t("email")}
                icon={<HiOutlineMail className="text-lg" />}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t("emailCannotChange")}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {t("phone")}
              </label>
              <CustomInput
                type="tel"
                id="phone"
                value={phone || undefined}
                onChange={(val) => setPhone((val as unknown as string) ?? "")}
                placeholder={t("phone")}
                icon={<HiOutlinePhone className="text-lg" />}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {t("dateOfBirth")}
              </label>
              <CustomInput
                type="date"
                id="dateOfBirth"
                placeholder="mm/dd/yyyy"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth((e as unknown as Date) ?? null)}
                icon={<HiOutlineCalendar className="text-lg" />}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {t("country")}
              </label>
              <CustomInput
                type="text"
                id="country"
                value={country}
                onChange={(e) =>
                  setCountry(
                    (e as React.ChangeEvent<HTMLInputElement>).target.value,
                  )
                }
                placeholder={t("countryPlaceholder")}
                icon={<HiOutlineGlobeAlt className="text-lg" />}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {t("address")}
              </label>
              <CustomInput
                type="text"
                id="address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    (e as React.ChangeEvent<HTMLInputElement>).target.value,
                  )
                }
                placeholder={t("addressPlaceholder")}
                icon={<HiOutlineLocationMarker className="text-lg" />}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {t("gender")}
              </label>
              <CustomInput
                type="select"
                id="gender"
                placeholder={t("chooseGender")}
                value={gender}
                onChange={(val) =>
                  setGender(val as unknown as SingleValue<GenderOption>)
                }
                options={genderOptions}
                icon={<HiOutlineUser className="text-lg" />}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={saveLoading}
            className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 dark:hover:bg-primary/80 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saveLoading
              ? locale === "ar"
                ? "جاري الحفظ..."
                : "Saving..."
              : t("saveChanges")}
          </button>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 md:p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-5">
            {t("changePassword")}
          </h3>
          <form
            onSubmit={handleSubmitPassword(onSubmitChangePassword)}
            className="max-w-2xl"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  {t("currentPassword")} *
                </label>
                <Controller
                  control={controlPassword}
                  name="currentPassword"
                  render={({ field: { value, onChange } }) => (
                    <CustomInput
                      type="password"
                      id="currentPassword"
                      value={value}
                      onChange={(e) =>
                        onChange(
                          (e as React.ChangeEvent<HTMLInputElement>).target
                            .value,
                        )
                      }
                      placeholder={t("currentPassword")}
                      error={passwordErrors.currentPassword?.message}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  {t("newPassword")} *
                </label>
                <Controller
                  control={controlPassword}
                  name="newPassword"
                  render={({ field: { value, onChange } }) => (
                    <CustomInput
                      type="password"
                      id="newPassword"
                      value={value}
                      onChange={(e) =>
                        onChange(
                          (e as React.ChangeEvent<HTMLInputElement>).target
                            .value,
                        )
                      }
                      placeholder={t("newPassword")}
                      error={passwordErrors.newPassword?.message}
                    />
                  )}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t("atLeast8Chars")}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  {t("confirmNewPassword")} *
                </label>
                <Controller
                  control={controlPassword}
                  name="confirmNewPassword"
                  render={({ field: { value, onChange } }) => (
                    <CustomInput
                      type="password"
                      id="confirmNewPassword"
                      value={value}
                      onChange={(e) =>
                        onChange(
                          (e as React.ChangeEvent<HTMLInputElement>).target
                            .value,
                        )
                      }
                      placeholder={t("confirmNewPassword")}
                      error={passwordErrors.confirmNewPassword?.message}
                    />
                  )}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={changePasswordLoading}
              className="mt-5 px-5 py-2.5 rounded-xl bg-amber-500 dark:bg-amber-600 text-white font-medium text-sm hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {changePasswordLoading
                ? locale === "ar"
                  ? "جاري التغيير..."
                  : "Changing..."
                : t("changePasswordButton")}
            </button>
          </form>
        </section>

        {!hideSubscriptionSection && (
          <>
            {/* Subscription: current plan + plans with upgrade/downgrade or WhatsApp for Custom */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 md:p-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-5">
                {t("subscriptionManagement")}
              </h3>

              {/* Current plan badge */}
              {profile?.user?.subscription?.planName && (
                <div
                  className={`flex flex-wrap items-center gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {t("currentPlanLabel")}:
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary font-medium text-sm border border-primary/20 dark:border-primary/30">
                    {profile.user.subscription.planName}
                  </span>
                </div>
              )}

              {plansLoading ? (
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-5 animate-pulse h-52 bg-slate-50 dark:bg-slate-800/50"
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={`grid gap-4 md:grid-cols-3 mb-6 ${isRTL ? "md:grid-flow-dense" : ""}`}
                >
                  {plans
                    .filter(
                      (p) =>
                        !String(p.name).toLowerCase().includes("custom") &&
                        (String(p.name).toLowerCase() === "free" ||
                          String(p.name).toLowerCase() === "pro"),
                    )
                    .map((plan, index) => {
                      const currentPlanName =
                        profile?.user?.subscription?.planName ?? "";
                      const isCurrentPlan =
                        currentPlanName &&
                        String(plan.name).toLowerCase() ===
                          String(currentPlanName).toLowerCase();
                      const isCustomPlan = String(plan.name)
                        .toLowerCase()
                        .includes("custom");
                      const isComingSoon =
                        plan.maxMenus === 0 &&
                        plan.priceMonthly === 0 &&
                        !isCustomPlan;
                      const isMostPopular = index === 1 && plans.length > 1;
                      const currentPlanIndex = plans.findIndex(
                        (p) =>
                          String(p.name).toLowerCase() ===
                          String(currentPlanName).toLowerCase(),
                      );
                      const canUpgrade =
                        currentPlanIndex >= 0 &&
                        index > currentPlanIndex &&
                        !isCustomPlan;
                      const canDowngrade =
                        currentPlanIndex >= 0 &&
                        index < currentPlanIndex &&
                        !isCustomPlan;
                                const rtlCol =
                                    isRTL && index === 0
                                        ? "md:col-start-3"
                                        : isRTL && index === 1
                                            ? "md:col-start-2"
                                            : "";

                      return (
                        <div
                          key={plan.id}
                          className={`relative rounded-2xl border-2 p-5 transition-all ${
                            isCurrentPlan
                              ? "border-primary dark:border-primary bg-primary/5 dark:bg-primary/10"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/30 dark:bg-slate-800/30"
                          } ${isComingSoon ? "opacity-90" : ""} ${rtlCol}`}
                        >
                          {isCurrentPlan && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary text-xs font-medium mb-2">
                              {t("currentPlan")}
                            </span>
                          )}
                          {isMostPopular && !isCurrentPlan && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/15 dark:bg-primary/20 text-primary dark:text-primary text-xs font-medium mb-2">
                              {t("mostPopular")}
                            </span>
                          )}
                          {isComingSoon && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium mb-2">
                              {t("comingSoon")}
                            </span>
                          )}
                          <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            {plan.name}
                          </p>
                          {!isComingSoon && plan.priceMonthly > 0 && (
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                              {plan.priceMonthly}{" "}
                              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                {t("monthly")}
                              </span>
                            </p>
                          )}
                          {!isComingSoon &&
                            plan.priceYearly != null &&
                            (plan.priceYearly > 0 ||
                              plan.priceMonthly === 0) && (
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                                {plan.priceYearly}{" "}
                                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                  {t("yearly")}
                                </span>
                              </p>
                            )}
                          {(isComingSoon || isCustomPlan) &&
                            plan.priceMonthly === 0 && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                {isCustomPlan
                                  ? t("contactForDetails")
                                  : t("comingSoon")}
                              </p>
                            )}
                          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
                            {plan.features?.slice(0, 4).map((f, i) => (
                              <li key={i}>✓ {f}</li>
                            ))}
                          </ul>

                          <div className="mt-4 flex flex-col gap-2">
                            {isCurrentPlan && (
                              <span className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-sm font-medium">
                                {t("currentPlan")}
                              </span>
                            )}
                            {canUpgrade && (
                              <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 dark:hover:bg-primary/80 transition-colors"
                              >
                                <HiArrowUp className="w-4 h-4" />
                                {t("upgrade")}
                              </button>
                            )}
                            {canDowngrade && (
                              <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <HiArrowDown className="w-4 h-4" />
                                {t("downgrade")}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {/* Custom plan card - static with fixed features */}
                  <div
                    key="custom-plan"
                    className={`relative rounded-2xl border-2 p-5 transition-all ${
                      isCurrentCustomPlan
                        ? "border-primary dark:border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/30 dark:bg-slate-800/30"
                                    } ${isRTL ? "md:col-start-1" : ""}`}
                  >
                    {isCurrentCustomPlan && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary text-xs font-medium mb-2">
                        {t("currentPlan")}
                      </span>
                    )}
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {t("planCustom")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      {t("contactForDetails")}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
                      {customPlanFeatures.map((f: string, i: number) => (
                        <li key={i}>✓ {f}</li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-col gap-2">
                      {isCurrentCustomPlan && (
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-sm font-medium">
                          {t("currentPlan")}
                        </span>
                      )}
                      {!isCurrentCustomPlan && (
                        <a
                          href={WHATSAPP_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 dark:bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
                        >
                          <HiOutlineChat className="w-5 h-5" />
                          {t("contactWhatsApp")}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 px-4 py-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {t("paymentNote")}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
