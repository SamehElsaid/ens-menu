"use client";

import { useState, useCallback, useEffect } from "react";
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
  HiOutlineX,
} from "react-icons/hi";
import {
  getMenuDashboardRef,
  menuDashboardPath,
} from "@/lib/menuDashboardPath";
import CustomInput from "@/components/Custom/CustomInput";
import {
  Button,
  ButtonLink,
  Card,
  CardFooter,
  Field,
  Input,
  PageShell,
  ReadonlyValue,
  SectionHeader,
  buttonClasses,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { axiosGet, axiosPut, axiosPost } from "@/shared/axiosCall";
import { _resizeImage } from "@/shared/_shared";
import { useAppDispatch } from "@/store/hooks";
import {
  CLEAR_AUTH_SESSION_CACHE,
  SET_AUTH_SESSION_CACHE,
} from "@/store/authSlice/authSlice";
import { toast } from "react-toastify";
import type { SingleValue } from "react-select";
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from "@/schemas/changePasswordSchema";
import { useRouter } from "@/i18n/navigation";
import type { Subscription, SubscriptionResponse } from "@/types/Subscription";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import CurrentPlanSummary from "@/components/Dashboard/CurrentPlanSummary";
import { clearAuthUiCookie } from "@/shared/authUiCookie";
import { clearStoredCsrfToken } from "@/shared/csrfToken";

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
  const t = useTranslations("personalProfile");
  const tCommon = useTranslations("common");
  const tRoot = useTranslations("");

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

      res = await axiosPut<FormData, { user?: AuthUser }>(
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

      res = await axiosPut<ProfilePayload, { user?: AuthUser }>(
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
          SET_AUTH_SESSION_CACHE({
            ...authData,
            user: {
              ...authData.user,
              ...updatedUser,
              profileImage:
                updatedUser?.profileImage ??
                authData.user?.profileImage ??
                null,
            },
          } as unknown as Parameters<typeof SET_AUTH_SESSION_CACHE>[0]),
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
      dispatch(CLEAR_AUTH_SESSION_CACHE());
      clearAuthUiCookie();
      clearStoredCsrfToken();

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
    /* A form measure, not the full workspace width: these are labelled fields,
       and the page previously ran a two-column grid across an entire desktop. */
    <PageShell
      kind="form"
      header={
        <PageTitleWithHelp
          id="onboarding-personal-header"
          eyebrow={t("title")}
          title={t("editPageTitle")}
          description={t("editSubtitle")}
          breadcrumbs={
            defaultBackLink
              ? [
                  { label: defaultBackLinkText, href: defaultBackLink },
                  { label: t("editPageTitle") },
                ]
              : undefined
          }
          breadcrumbsLabel={tCommon("breadcrumb")}
        />
      }
    >
      <Card as="section" id="onboarding-personal-info">
        <SectionHeader ruled title={t("personalInfo")} />

        {/* The avatar is a ruled tile, not a button: the only way to change it
            used to be hovering the circle, which does not exist on a touch
            screen. The upload control is now a named, focusable target that
            also happens to accept a drop. */}
        <div className="mt-3.5 flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-start">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-2 text-2xl font-semibold text-fg-muted">
            {displayProfileImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob or API URL
              <img
                src={displayProfileImage}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              initial
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="ui-label">{t("profilePicture")}</p>
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">
              {t("recommendedImage")}
            </p>

            {/* The input is nested rather than linked by `htmlFor`: a label
                whose `for` points at a descendant fires the picker twice in
                some browsers. */}
            <label
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={cn(
                "mt-2.5 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-4 text-center",
                "transition-[color,background-color,border-color] duration-(--dur-fast) ease-(--ease-settle)",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
                dragOver
                  ? "border-accent-line bg-accent-soft"
                  : "border-line-strong bg-surface-2/40 hover:border-fg-subtle",
              )}
            >
              <input
                type="file"
                accept={AVATAR_ACCEPT}
                className="sr-only"
                aria-label={t("uploadImage")}
                onChange={onFileChange}
              />
              <HiOutlineCloudUpload
                className={cn(
                  "size-6",
                  dragOver ? "text-accent" : "text-fg-subtle",
                )}
                aria-hidden
              />
              <span className="text-[13px] font-medium text-fg">
                {t("dragDropOrClick")}
              </span>
              <span className="ui-label">
                PNG · JPG · GIF · {t("maxFileSize")}
              </span>
              {/* Visual affordance only — the label around it is the control. */}
              <span
                className={buttonClasses({ variant: "secondary", size: "sm" })}
                aria-hidden
              >
                {t("uploadImage")}
              </span>
            </label>

            <div aria-live="polite">
              {profileImageFile && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5">
                  <span
                    className="min-w-0 flex-1 truncate text-xs font-medium text-fg"
                    dir="ltr"
                  >
                    {profileImageFile.name}
                  </span>
                  <Button
                    type="button"
                    variant="dangerGhost"
                    size="xs"
                    onClick={clearProfileImage}
                    startIcon={<HiOutlineX className="size-3.5" />}
                  >
                    {t("remove")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <Field
            label={t("fullName")}
            required
            htmlFor="fullName"
            className="sm:col-span-2"
          >
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
          <Field label={t("phone")} htmlFor="phone">
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
          <Field label={t("dateOfBirth")} htmlFor="dateOfBirth">
            <CustomInput
              type="date"
              id="dateOfBirth"
              placeholder={t("dateFormatPlaceholder")}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth((e as unknown as Date) ?? null)}
              icon={<HiOutlineCalendar className="text-lg" />}
            />
          </Field>
          <Field label={t("country")} htmlFor="country">
            <Input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder={t("countryPlaceholder")}
              startIcon={<HiOutlineGlobeAlt className="size-4.5" />}
            />
          </Field>
          <Field
            label={t("address")}
            htmlFor="address"
            className="sm:col-span-2"
          >
            <Input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("addressPlaceholder")}
              startIcon={<HiOutlineLocationMarker className="size-4.5" />}
            />
          </Field>
          <Field label={t("gender")} htmlFor="gender">
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

        <CardFooter className="justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveChanges}
            loading={saveLoading}
          >
            {saveLoading ? t("saving") : t("saveChanges")}
          </Button>
        </CardFooter>
      </Card>

      <Card
        as="form"
        id="onboarding-personal-password"
        onSubmit={handleSubmitPassword(onSubmitChangePassword)}
      >
        <SectionHeader ruled title={t("changePassword")} />

        <div className="mt-3.5 grid max-w-2xl gap-3.5 sm:grid-cols-2">
          <Field
            label={t("currentPassword")}
            required
            htmlFor="currentPassword"
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
            htmlFor="newPassword"
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
            htmlFor="confirmNewPassword"
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

        <CardFooter className="justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={changePasswordLoading}
          >
            {changePasswordLoading
              ? t("changingPassword")
              : t("changePasswordButton")}
          </Button>
        </CardFooter>
      </Card>

      {!hideSubscriptionSection && (
        <Card as="section" id="onboarding-personal-subscription">
          <SectionHeader ruled title={t("subscription")} />

          <CurrentPlanSummary
            subscriptionInfo={subscriptionInfo}
            loading={subscriptionInfoLoading}
            currentPlanName={currentPlanNameResolved}
            className="mt-3.5"
          />

          {menuRef && (
            <CardFooter className="justify-end">
              <ButtonLink
                id="onboarding-personal-subscription-link"
                href={menuDashboardPath(menu, "subscription")}
                className="w-full sm:w-auto"
                endIcon={
                  <HiOutlineArrowRight className="size-4 rtl:rotate-180" />
                }
              >
                {t("manageSubscriptionAndPricing")}
              </ButtonLink>
            </CardFooter>
          )}
        </Card>
      )}
    </PageShell>
  );
}
