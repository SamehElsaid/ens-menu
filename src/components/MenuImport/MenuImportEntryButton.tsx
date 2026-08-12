"use client";

import LinkTo from "@/components/Global/LinkTo";
import { useTranslations } from "next-intl";
import { IoSparklesOutline, IoCameraOutline } from "react-icons/io5";
import { cn } from "@/lib/cn";
import { buttonClasses, focusRing } from "@/components/ui";

type Variant = "primary" | "secondary" | "card";

interface MenuImportEntryButtonProps {
  menuId: string;
  variant?: Variant;
  className?: string;
}

export default function MenuImportEntryButton({
  menuId,
  variant = "secondary",
  className = "",
}: MenuImportEntryButtonProps) {
  const t = useTranslations("MenuImport");

  const href = `/dashboard/${menuId}/import`;

  if (variant === "card") {
    return (
      <LinkTo
        href={href}
        className={cn(
          "group flex flex-col items-start justify-between gap-3 rounded-xl border border-line bg-surface p-4",
          "transition-[border-color,background-color] duration-(--dur-fast) ease-(--ease-settle)",
          "hover:border-line-strong hover:bg-surface-2/50",
          "sm:flex-row sm:items-center sm:gap-4",
          focusRing,
          className,
        )}
      >
        <div className="min-w-0 flex-1 text-start">
          {/* The kicker is a quiet sans label, not a filled pill: the plate
              says what kind of thing it is before it says what it does. */}
          <p className="ui-label flex items-center gap-1.5">
            <IoSparklesOutline aria-hidden />
            {t("badge")}
          </p>
          <h3 className="mt-1.5 text-sm font-semibold tracking-[-0.02em] text-fg">
            {t("emptyMenuTitle")}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
            {t("emptyMenuDescription")}
          </p>
        </div>
        <span
          className={buttonClasses({
            variant: "primary",
            className: "pointer-events-none",
          })}
        >
          <IoCameraOutline className="text-lg" aria-hidden />
          {t("entryButton")}
        </span>
      </LinkTo>
    );
  }

  return (
    <LinkTo
      href={href}
      className={buttonClasses({
        variant: variant === "primary" ? "primary" : "secondary",
        size: variant === "primary" ? "lg" : "md",
        className,
      })}
    >
      <IoSparklesOutline className="shrink-0 text-lg" aria-hidden />
      {t("entryButton")}
    </LinkTo>
  );
}
