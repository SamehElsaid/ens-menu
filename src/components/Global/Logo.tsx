"use client";

import { LogoProps } from "@/types/types";
import { BsQrCode } from "react-icons/bs";

export const Logo = ({ variant = "default" }: LogoProps) => {
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
    <div className="flex items-center gap-4 group cursor-pointer scale-100 origin-right">
      <div className={`animate-logo-spin ${iconClasses}`}>
        <BsQrCode size={40} />
      </div>
      <div className="relative flex flex-col items-center">
        <div
          className={`text-2xl lg:text-xl xl:text-3xl font-black tracking-tighter bg-clip-text text-transparent ${gradientClasses} bg-[length:200%_auto]`}
        >
          ENSMENU
        </div>
        <div className={`w-full h-1 -mt-0.5 rounded-full ${lineClasses}`} />
      </div>
    </div>
  );
};

export default Logo;
