"use client";

import LinkTo from "@/components/Global/LinkTo";
import { useTranslations } from "next-intl";
import { IoSparklesOutline, IoCameraOutline } from "react-icons/io5";
import { cn } from "@/lib/cn";
import { Badge, buttonClasses, focusRing } from "@/components/ui";

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
          "group flex flex-col items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5",
          "transition-[border-color,background-color] duration-150 hover:border-brand-line hover:bg-brand-soft/30",
          "sm:flex-row sm:items-center",
          focusRing,
          className,
        )}
      >
        <div className="min-w-0 flex-1 text-start">
          <Badge tone="brand" icon={<IoSparklesOutline aria-hidden />}>
            {t("badge")}
          </Badge>
          <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.011em] text-fg">
            {t("emptyMenuTitle")}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
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
