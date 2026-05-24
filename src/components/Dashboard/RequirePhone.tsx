"use client";

import { useState, type ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
} from "react-icons/hi";
import { ImSpinner8 } from "react-icons/im";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { axiosPatch } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";

interface RequirePhoneProps {
  children: ReactNode;
}

type UserProfile = Record<string, unknown>;

export function RequirePhone({ children }: RequirePhoneProps) {
  const t = useTranslations("phoneGate");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const dispatch = useAppDispatch();

  const authLoading = useAppSelector((s) => s.auth.loading);
  const authData = useAppSelector((s) => s.auth.data) as
    | {
        user?: {
          phoneNumber?: string;
          role?: string;
          name?: string;
          profileImage?: string;
        } & UserProfile;
      }
    | null;

  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const userProfile = authData?.user;
  const hasPhone = Boolean(userProfile?.phoneNumber?.trim());
  const isStaff = userProfile?.role === "staff";

  if (authLoading !== "yes" || hasPhone || isStaff) {
    return <>{children}</>;
  }

  const userName =
    typeof userProfile?.name === "string" ? userProfile.name.split(" ")[0] : "";
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  const benefits = [
    { icon: HiOutlineBell, key: "benefit1" },
    { icon: HiOutlineShieldCheck, key: "benefit2" },
    { icon: HiOutlineCreditCard, key: "benefit3" },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setSaving(true);
    const res = await axiosPatch<
      { phoneNumber: string },
      { user?: UserProfile }
    >("/user/profile", locale, { phoneNumber: phone.trim() });
    setSaving(false);

    if (res?.status && res.data) {
      toast.success(t("successMessage"));
      const updatedUser = (res.data as { user?: UserProfile })?.user ?? {};
      dispatch(
        SET_ACTIVE_USER({
          ...authData,
          user: {
            ...userProfile,
            ...updatedUser,
            phoneNumber: phone.trim(),
          },
        } as UserProfile),
      );
    } else {
      toast.error(t("errorMessage"));
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20 px-4 py-12"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute start-0 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-800/10" />
      <div className="pointer-events-none absolute bottom-0 end-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-purple-300/15 blur-3xl dark:bg-purple-800/10" />
      <div className="pointer-events-none absolute start-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-purple/5 blur-2xl dark:bg-accent-purple/10" />

      <div className="relative w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="h-1.5 w-6 rounded-full bg-accent-purple/30" />
          <div className="h-1.5 w-10 rounded-full bg-accent-purple" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-2xl shadow-violet-200/40 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-violet-950/20">
          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-accent-purple via-violet-400 to-purple-500" />

          <div className="p-8">
            {/* User greeting */}
            {userName && (
              <div
                className={`mb-6 flex items-center gap-3 `}
              >
                {typeof userProfile?.profileImage === "string" &&
                userProfile.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userProfile.profileImage}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-accent-purple/20"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-violet-400 text-sm font-bold text-white ring-4 ring-accent-purple/10">
                    {initial}
                  </div>
                )}
                <div >
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t("welcomeBack")}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {userName}
                  </p>
                </div>
              </div>
            )}

            {/* Icon */}
            <div className="mb-5 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-2xl bg-accent-purple/20 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-purple to-violet-500 shadow-lg shadow-violet-300/50 dark:shadow-violet-900/50">
                  <HiOutlinePhone className="text-2xl text-white" />
                </div>
              </div>
            </div>

            {/* Title & subtitle */}
            <h1
              className={`mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100 `}
            >
              {t("title")}
            </h1>
            <p
              className={`mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400 `}
            >
              {t("subtitle")}
            </p>

            {/* Benefits */}
            <ul className="mb-7 space-y-2.5">
              {benefits.map(({ icon: Icon, key }) => (
                <li
                  key={key}
                  className={`flex items-start gap-3 `}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-purple/10 dark:bg-accent-purple/20">
                    <Icon className="text-sm text-accent-purple" />
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="mb-6 border-t border-slate-100 dark:border-slate-800" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className={`mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400 `}
                >
                  {t("phoneLabel")}{" "}
                  <span className="text-accent-purple">*</span>
                </label>
                <CustomInput
                  type="tel"
                  id="phone-gate"
                  defaultCountry="EG"
                  value={phone || undefined}
                  onChange={(val) =>
                    setPhone((val as unknown as string) ?? "")
                  }
                  placeholder={t("phoneLabel")}
                  icon={<HiOutlinePhone className="text-lg" />}
                />
              </div>

              <button
                type="submit"
                disabled={saving || !phone.trim()}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-accent-purple to-violet-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-violet-300/50 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-violet-900/30 dark:hover:shadow-violet-900/50"
              >
                <span className="flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <ImSpinner8 className="animate-spin text-base" />
                      {t("saving")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </span>
              </button>

              {/* Trust badge */}
              <div
                className={`flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 `}
              >
                <HiOutlineLockClosed className="shrink-0" />
                <span>{t("trustBadge")}</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
