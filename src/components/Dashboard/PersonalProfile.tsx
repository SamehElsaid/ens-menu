"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import {
  HiOutlineCloudUpload,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineGlobeAlt,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineArrowRight,
  HiOutlineCamera,
  HiOutlineX,
} from "react-icons/hi";
import LinkTo from "@/components/Global/LinkTo";
import {
  getMenuDashboardRef,
  menuDashboardPath,
} from "@/lib/menuDashboardPath";
import CustomInput from "@/components/Custom/CustomInput";
import {
  Button,
  ButtonLink,
  Field,
  Input,
  ReadonlyValue,
} from "@/components/ui";
import { axiosGet, axiosPatch, axiosPost } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
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
import type { Subscription, SubscriptionResponse } from "@/types/Subscription";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import CurrentPlanSummary from "@/components/Dashboard/CurrentPlanSummary";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const AVATAR_ACCEPT = "image/png,image/jpeg,image/jpg,image/gif";

type GenderOption = { label: string; value: string };

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
  const menu = useAppSelector((state) => state.menuData.menu);
  const menuRef = getMenuDashboardRef(menu);
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
  const [subscriptionInfo, setSubscriptionInfo] = useState<Subscription | null>(
    null,
  );
  const [subscriptionInfoLoading, setSubscriptionInfoLoading] = useState(true);
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

  // Sync form from auth when profile is available (skip subscription fetch for admin)
  useEffect(() => {
    if (!authData?.user) {
      return;
    }
    const u = authData.user as AuthUser;
    if (u?.role === "admin") {
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

    queueMicrotask(() => {
      setSubscriptionInfoLoading(true);
    });
    void axiosGet<SubscriptionResponse>("/user/subscription", locale)
      .then((res) => {
        if (res.status && res.data?.subscription) {
          setSubscriptionInfo(res.data.subscription);
        } else {
          setSubscriptionInfo(null);
        }
      })
      .finally(() => setSubscriptionInfoLoading(false));
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

  const processFile = useCallback(async (file: File | null) => {
    if (!file) return;
    const resized = await _resizeImage(file);
    if (resized.size > MAX_AVATAR_SIZE_BYTES) return;
    setProfileImageFile(resized);
    setProfileImage((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(resized);
    });
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      e.target.value = "";
      void processFile(file);
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
      if (file && file.type.startsWith("image/")) void processFile(file);
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
      toast.success(t("changesSavedSuccess"));
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
      toast.error(t("changesSaveFailed"));
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
      toast.error(t("changePasswordFailed"));
    }
  };

  const defaultBackLink = backLink ?? menuDashboardPath(menu, "settings");
  const defaultBackLinkText = backLinkText ?? t("backToProfile");

  const currentPlanNameResolved =
    subscriptionInfo?.planName ?? profile?.user?.subscription?.planName ?? "";

  return (
    <div className="min-h-[calc(100vh-120px)]">
      {defaultBackLink && (
        <div className={isRTL ? "text-right mb-4" : "text-left mb-4"}>
          <LinkTo
            href={defaultBackLink}
            className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted hover:text-primary dark:hover:text-primary transition-colors"
          >
            <HiOutlineArrowRight
              className={`text-lg ${isRTL ? "order-2 rotate-180" : ""}`}
            />
            {defaultBackLinkText}
          </LinkTo>
        </div>
      )}

      <PageTitleWithHelp
        id="onboarding-personal-header"
        className={isRTL ? "text-right mb-8" : "text-left mb-8"}
        title={t("editPageTitle")}
        description={t("editSubtitle")}
      />

      <div className="space-y-8">
        <section
          id="onboarding-personal-info"
          className="bg-raised rounded-lg border border-line shadow-sm p-5 md:p-6"
        >
          <h3 className="text-base font-semibold text-fg mb-5">
            {t("personalInfo")}
          </h3>

          {/* Profile image with Personal Information */}
          <div
            className={`flex flex-wrap items-start gap-6 mb-6 pb-6 border-b border-line ${isRTL ? "flex-row-reverse" : ""}`}
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
              <p className="text-sm font-medium text-fg-muted mb-2">
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
                className={`relative rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 py-8 px-6 min-h-[140px] ${
                  dragOver
                    ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[1.01]"
                    : "border-line hover:border-primary/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div
                  className={`rounded-full p-3 transition-colors ${dragOver ? "bg-primary/15 dark:bg-primary/20" : "bg-surface-2"}`}
                >
                  <HiOutlineCloudUpload
                    className={`w-8 h-8 ${dragOver ? "text-primary" : "text-fg-subtle"}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-fg-muted">
                    {t("dragDropOrClick")}
                  </p>
                  <p className="text-xs text-fg-muted mt-0.5">
                    PNG, JPG, GIF · {t("maxFileSize")}
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
              <p className="text-xs text-fg-muted mt-2">
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
                    className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <HiOutlineX className="w-3.5 h-3.5" />
                    {t("remove")}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("fullName")} required className="sm:col-span-2">
              <Input
                type="text"
                id="fullName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("fullName")}
                startIcon={<HiOutlineUser className="size-4.5" />}
              />
            </Field>
            <Field label={t("email")} hint={t("emailCannotChange")}>
              <ReadonlyValue>{profile?.email ?? ""}</ReadonlyValue>
            </Field>
            <Field label={t("phone")}>
              <CustomInput
                type="tel"
                id="phone"
                defaultCountry="EG"
                value={phone || undefined}
                onChange={(val) => setPhone((val as unknown as string) ?? "")}
                placeholder={t("phone")}
                icon={<HiOutlinePhone className="text-lg" />}
              />
            </Field>
            <Field label={t("dateOfBirth")}>
              <CustomInput
                type="date"
                id="dateOfBirth"
                placeholder={t("dateFormatPlaceholder")}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth((e as unknown as Date) ?? null)}
                icon={<HiOutlineCalendar className="text-lg" />}
              />
            </Field>
            <Field label={t("country")}>
              <Input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t("countryPlaceholder")}
                startIcon={<HiOutlineGlobeAlt className="size-4.5" />}
              />
            </Field>
            <Field label={t("address")} className="sm:col-span-2">
              <Input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("addressPlaceholder")}
                startIcon={<HiOutlineLocationMarker className="size-4.5" />}
              />
            </Field>
            <Field label={t("gender")}>
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
            </Field>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveChanges}
            disabled={saveLoading}
            loading={saveLoading}
            className="mt-5"
          >
            {saveLoading ? t("saving") : t("saveChanges")}
          </Button>
        </section>

        <section
          id="onboarding-personal-password"
          className="bg-raised rounded-lg border border-line shadow-sm p-5 md:p-6"
        >
          <h3 className="text-base font-semibold text-fg mb-5">
            {t("changePassword")}
          </h3>
          <form
            onSubmit={handleSubmitPassword(onSubmitChangePassword)}
            className="max-w-2xl"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("currentPassword")}
                required
                className="sm:col-span-2"
                error={passwordErrors.currentPassword?.message}
              >
                <Controller
                  control={controlPassword}
                  name="currentPassword"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type="password"
                      id="currentPassword"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={t("currentPassword")}
                      autoComplete="current-password"
                    />
                  )}
                />
              </Field>
              <Field
                label={t("newPassword")}
                required
                hint={t("atLeast8Chars")}
                error={passwordErrors.newPassword?.message}
              >
                <Controller
                  control={controlPassword}
                  name="newPassword"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type="password"
                      id="newPassword"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={t("newPassword")}
                      autoComplete="new-password"
                    />
                  )}
                />
              </Field>
              <Field
                label={t("confirmNewPassword")}
                required
                error={passwordErrors.confirmNewPassword?.message}
              >
                <Controller
                  control={controlPassword}
                  name="confirmNewPassword"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type="password"
                      id="confirmNewPassword"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={t("confirmNewPassword")}
                      autoComplete="new-password"
                    />
                  )}
                />
              </Field>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={changePasswordLoading}
              loading={changePasswordLoading}
              className="mt-5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {changePasswordLoading
                ? t("changingPassword")
                : t("changePasswordButton")}
            </Button>
          </form>
        </section>

        {!hideSubscriptionSection && (
          <section
            id="onboarding-personal-subscription"
            className="bg-raised rounded-lg border border-line shadow-sm p-5 md:p-6"
          >
            <h3 className="text-base font-semibold text-fg mb-5">
              {t("subscription")}
            </h3>
            <CurrentPlanSummary
              subscriptionInfo={subscriptionInfo}
              loading={subscriptionInfoLoading}
              currentPlanName={currentPlanNameResolved}
              className="mb-5"
            />
            {menuRef && (
              <ButtonLink
                id="onboarding-personal-subscription-link"
                href={menuDashboardPath(menu, "subscription")}
                className="w-full sm:w-auto"
                endIcon={
                  <HiOutlineArrowRight
                    className={`text-lg ${isRTL ? "rotate-180" : ""}`}
                  />
                }
              >
                {t("manageSubscriptionAndPricing")}
              </ButtonLink>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
