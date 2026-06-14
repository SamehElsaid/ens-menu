"use client";

import { LogoProps } from "@/types/types";
import { BsQrCode } from "react-icons/bs";
import LinkTo from "./LinkTo";

export const Logo = ({
  variant = "default",
  size = "default",
  pageTitle,
}: LogoProps) => {
  const gradientClasses =
    variant === "white"
      ? "bg-gradient-to-r from-gray-200 via-white to-gray-200"
      : "bg-gradient-to-r from-slate-900 via-purple-600 to-slate-900 dark:from-white dark:via-purple-400 dark:to-white";

  const iconClasses =
    variant === "white" ? "text-white" : "text-purple-600 dark:text-purple-400";

  const lineClasses =
    variant === "white"
      ? "bg-white opacity-60 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
      : "bg-purple-600 shadow-[0_0_10px_rgba(124,58,237,0.5)] dark:bg-purple-400 opacity-40";

  return (
    <LinkTo
      href="/"
      className="flex items-center gap-4 group cursor-pointer scale-100 origin-right"
    >
      {size === "small" ? null : (
        <div className={`animate-logo-spin ${iconClasses}`}>
          <BsQrCode size={40} />
        </div>
      )}
      <div className="relative flex flex-col items-center max-w-[min(72vw,320px)]">
        <div
          className={`text-center font-black tracking-tighter bg-clip-text text-transparent ${gradientClasses} bg-size-[200%_auto] ${
            pageTitle
              ? "text-lg lg:text-base xl:text-xl leading-tight"
              : "text-2xl lg:text-xl xl:text-3xl"
          }`}
        >
          {pageTitle ? (
            <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0">
              <span>ENSmenu</span>
              <span className="text-slate-400 font-bold">-</span>
              <span className="text-slate-700 dark:text-slate-200 font-semibold truncate max-w-[11rem] sm:max-w-[14rem]">
                {pageTitle}
              </span>
            </span>
          ) : (
            "ENSMENU"
          )}
        </div>
        <div className={`w-full h-1 -mt-0.5 rounded-full ${lineClasses}`} />
      </div>
    </LinkTo>
  );
};

export default Logo;
