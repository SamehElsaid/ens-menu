"use client";

import { LogoProps } from "@/types/types";
import { BsQrCode } from "react-icons/bs";
import LinkTo from "./LinkTo";

export const Logo = ({
  variant = "default",
  size = "default",
  pageTitle,
  className = "",
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

  const iconSize =
    size === "header"
      ? 18
      : size === "micro"
        ? 22
        : size === "compact"
          ? 28
          : 40;
  const gapClass =
    size === "header"
      ? "gap-1.5"
      : size === "micro"
        ? "gap-2"
        : size === "compact"
          ? "gap-2.5"
          : "gap-4";
  const textAlignClass =
    size === "header" ||
    size === "compact" ||
    size === "micro"
      ? "items-start text-start"
      : "items-center text-center";
  const textMaxWidthClass =
    size === "header"
      ? "max-w-[9rem]"
      : size === "micro"
        ? "max-w-[min(48vw,11rem)]"
        : "max-w-[min(72vw,320px)]";
  const lineHeightClass = size === "header" ? "h-0.5 -mt-px" : "h-1 -mt-0.5";

  return (
    <LinkTo
      href="/"
      className={`site-logo flex max-h-10 items-center ${gapClass} group cursor-pointer scale-100 ${size === "header" ? "site-logo--header" : ""} ${className}`}
    >
      {size === "small" ? (
        null
      ) : (
        <div className={`animate-logo-spin ${iconClasses}`}>
          <BsQrCode size={iconSize} />
        </div>
      )}
      <div className={`relative flex ${textMaxWidthClass} flex-col ${textAlignClass}`}>
        <div
          className={`font-black tracking-tighter bg-clip-text text-transparent ${gradientClasses} bg-size-[200%_auto] ${
            pageTitle
              ? "text-lg lg:text-base xl:text-xl leading-tight"
              : size === "header"
                ? "text-sm leading-none"
                : size === "micro"
                  ? "text-base leading-tight"
                  : size === "compact"
                    ? "text-lg lg:text-xl leading-tight"
                    : "text-2xl lg:text-xl xl:text-3xl"
          }`}
        >
          {pageTitle ? (
            <span className="inline-flex max-w-full items-center gap-x-1.5">
              <span className="shrink-0">ENSmenu</span>
              <span className="hidden shrink-0 font-bold text-slate-400 sm:inline">
                -
              </span>
              <span className="hidden truncate font-semibold text-slate-700 dark:text-slate-200 sm:inline sm:max-w-[14rem]">
                {pageTitle}
              </span>
            </span>
          ) : (
            "ENSMENU"
          )}
        </div>
        <div className={`w-full rounded-full ${lineHeightClass} ${lineClasses}`} />
      </div>
    </LinkTo>
  );
};

export default Logo;
