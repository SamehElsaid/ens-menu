"use client";

import { LogoProps } from "@/types/types";
import { BsQrCode } from "react-icons/bs";
import LinkTo from "./LinkTo";

type LogoSize = NonNullable<LogoProps["size"]>;
type LogoVariant = NonNullable<LogoProps["variant"]>;

const SIZE_CONFIG: Record<
  LogoSize,
  {
    iconSize: number;
    gap: string;
    align: string;
    maxWidth: string;
    line: string;
    text: string;
    showIcon: boolean;
  }
> = {
  header: {
    iconSize: 18,
    gap: "gap-1.5",
    align: "items-start text-start",
    maxWidth: "max-w-36",
    line: "h-0.5 -mt-px",
    text: "text-sm leading-none",
    showIcon: true,
  },
  micro: {
    iconSize: 22,
    gap: "gap-2",
    align: "items-start text-start",
    maxWidth: "max-w-[min(48vw,11rem)]",
    line: "h-1 -mt-0.5",
    text: "text-base leading-tight",
    showIcon: true,
  },
  compact: {
    iconSize: 28,
    gap: "gap-2.5",
    align: "items-start text-start",
    maxWidth: "max-w-[min(72vw,320px)]",
    line: "h-1 -mt-0.5",
    text: "text-lg leading-tight lg:text-xl",
    showIcon: true,
  },
  default: {
    iconSize: 40,
    gap: "gap-4",
    align: "items-center text-center",
    maxWidth: "max-w-[min(72vw,320px)]",
    line: "h-1 -mt-0.5",
    text: "text-2xl leading-tight lg:text-xl xl:text-3xl",
    showIcon: true,
  },
  small: {
    iconSize: 0,
    gap: "gap-4",
    align: "items-center text-center",
    maxWidth: "max-w-[min(72vw,320px)]",
    line: "h-1 -mt-0.5",
    text: "text-2xl leading-tight lg:text-xl xl:text-3xl",
    showIcon: false,
  },
};

const VARIANT_STYLES: Record<
  LogoVariant,
  { gradient: string; icon: string; line: string }
> = {
  default: {
    gradient:
      "bg-gradient-to-r from-slate-900 via-purple-600 to-slate-900 dark:from-white dark:via-purple-400 dark:to-white",
    icon: "text-purple-600 dark:text-purple-400",
    line: "bg-purple-600 opacity-40 shadow-[0_0_10px_rgba(124,58,237,0.5)] dark:bg-purple-400",
  },
  white: {
    gradient: "bg-gradient-to-r from-gray-200 via-white to-gray-200",
    icon: "text-white",
    line: "bg-white opacity-60 shadow-[0_0_10px_rgba(255,255,255,0.3)]",
  },
};

function LogoTitle({ pageTitle }: { pageTitle?: string }) {
  if (pageTitle) {
    return (
      <span className="inline-flex max-w-full items-center gap-x-1.5">
        <span className="shrink-0">ENSmenu</span>
        <span className="hidden shrink-0 font-bold text-fg-subtle sm:inline">
          -
        </span>
        <span className="hidden truncate font-semibold text-fg-muted sm:inline sm:max-w-56">
          {pageTitle}
        </span>
      </span>
    );
  }

  return <>ENSMENU</>;
}

export function Logo({
  variant = "default",
  size = "default",
  pageTitle,
  className = "",
}: LogoProps) {
  const config = SIZE_CONFIG[size];
  const styles = VARIANT_STYLES[variant];
  const textClass = pageTitle
    ? "text-lg leading-tight lg:text-base xl:text-xl"
    : config.text;

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
    size === "header" || size === "compact" || size === "micro"
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
      className={`site-logo flex max-h-10 items-center ${config.gap} group cursor-pointer scale-100 ${size === "header" ? "site-logo--header" : ""} ${className}`}
    >
      {config.showIcon && (
        <div className={`animate-logo-spin ${styles.icon}`}>
          <BsQrCode size={config.iconSize} />
        </div>
      )}

      <div
        className={`relative flex ${config.maxWidth} flex-col ${config.align}`}
      >
        <div
          className={`bg-size-[200%_auto] bg-clip-text font-black tracking-tighter text-transparent ${styles.gradient} ${textClass}`}
        >
          <LogoTitle pageTitle={pageTitle} />
        </div>
        <div className={`w-full rounded-full ${config.line} ${styles.line}`} />
      </div>
    </LinkTo>
  );
}

export default Logo;
