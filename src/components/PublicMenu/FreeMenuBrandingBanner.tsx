"use client";

import { useEffect, useRef } from "react";
import { trackFreeBannerEvent } from "@/lib/trackFreeBannerEvent";

type FreeMenuBrandingBannerProps = {
  menuSlug: string;
  locale?: "ar" | "en";
  registerHref?: string;
  className?: string;
};

function defaultRegisterHref(locale: "ar" | "en"): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  if (!base) return "/auth/register";
  return locale === "ar" ? `${base}/auth/register` : `${base}/en/auth/register`;
}

/**
 * Bottom branding strip for free-plan public menus.
 * Fires impression once per mount and click when the link is tapped.
 */
export default function FreeMenuBrandingBanner({
  menuSlug,
  locale = "ar",
  registerHref,
  className = "",
}: FreeMenuBrandingBannerProps) {
  const impressionSent = useRef(false);
  const href = registerHref ?? defaultRegisterHref(locale);
  const isAr = locale === "ar";
  const label = isAr ? "أنشئ منيو مجاني على ENSmenu" : "Create your free menu on ENSmenu";
  const powered = isAr ? "مدعوم من ENSmenu" : "Powered by ENSmenu";

  useEffect(() => {
    if (!menuSlug || impressionSent.current) return;
    impressionSent.current = true;
    void trackFreeBannerEvent(menuSlug, "impression");
  }, [menuSlug]);

  const handleClick = () => {
    void trackFreeBannerEvent(menuSlug, "click");
  };

  return (
    <div
      className={`w-full border-t border-slate-200/80 bg-slate-50 px-4 py-3 text-center ${className}`}
      dir={isAr ? "rtl" : "ltr"}
    >
      <p className="text-[11px] text-slate-400 mb-1">{powered}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="text-sm font-semibold text-primary hover:underline"
      >
        {label}
      </a>
    </div>
  );
}
