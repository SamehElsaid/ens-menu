"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { axiosGet } from "@/shared/axiosCall";
import { patchAuthCookie, readAuthCookie } from "@/shared/authCookie";

type AuthMeResponse = {
  user?: {
    phoneNumber?: string | null;
    isPhoneVerified?: boolean;
    role?: string;
  };
};

/** Redirects owners/admins without verified phone (e.g. Google sign-up, legacy cookies). */
export function PhoneVerificationGuard() {
  const locale = useLocale();
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    const auth = readAuthCookie();
    if (!auth?.token || auth.role === "staff") return;

    checked.current = true;

    void axiosGet<AuthMeResponse>("/auth/me", locale).then((res) => {
      if (!res.status || !res.data?.user) return;

      const { phoneNumber, isPhoneVerified } = res.data.user;
      const phone = phoneNumber?.trim() ?? "";
      const needsVerification = !phone || !isPhoneVerified;

      if (!needsVerification) {
        if (auth.phoneVerified === false) {
          patchAuthCookie({ phoneVerified: true, phoneNumber: phone || null });
        }
        return;
      }

      patchAuthCookie({
        phoneVerified: false,
        phoneNumber: phone || null,
      });

      if (phone) {
        sessionStorage.setItem("pendingPhoneVerification", phone);
        router.replace(
          `/auth/verify-phone?phone=${encodeURIComponent(phone)}`,
        );
      } else {
        router.replace("/auth/add-phone");
      }
    });
  }, [locale, router]);

  return null;
}
