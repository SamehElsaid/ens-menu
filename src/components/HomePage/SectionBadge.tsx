import type { ReactNode } from "react";

export type SectionBadgeProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

const badgeClassName =
  "mb-4 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50/60 px-3 py-1.5 text-xs font-bold tracking-wide text-purple-700 dark:border-purple-500/15 dark:bg-purple-950/40 dark:text-purple-300";

/** Section header typography — aligned with PhoneVideoSection. */
export const sectionHeaderClassName =
  "mb-16 flex flex-col items-center text-center";

export const sectionHeadingClassName =
  "mb-4 text-3xl font-extrabold text-slate-900 lg:text-5xl dark:text-white";

export const sectionDescriptionClassName =
  "max-w-2xl text-base font-medium leading-relaxed text-slate-600 md:mx-auto md:text-lg dark:text-slate-400";

export const sectionHighlightClassName =
  "bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400";

export function SectionBadge({
  children,
  icon,
  className = "",
}: SectionBadgeProps) {
  return (
    <div className={[badgeClassName, className].filter(Boolean).join(" ")}>
      {icon ? (
        <span className="shrink-0 text-purple-600 dark:text-purple-400">
          {icon}
        </span>
      ) : null}
      {children}
    </div>
  );
}
