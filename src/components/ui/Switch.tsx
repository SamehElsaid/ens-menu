"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

export type SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  label?: ReactNode;
  hint?: ReactNode;
  switchSize?: "sm" | "md";
  /** Places the control at the row's trailing edge — for settings lists. */
  align?: "start" | "between";
  wrapperClassName?: string;
};

const track = {
  sm: "h-4 w-7",
  md: "h-5 w-9",
} as const;

const thumb = {
  sm: "size-3 peer-checked:translate-x-3 rtl:peer-checked:-translate-x-3",
  md: "size-4 peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4",
} as const;

/**
 * Toggle for settings that apply immediately. For choices confirmed by a
 * submit button, use a Checkbox instead.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    hint,
    switchSize = "md",
    align = "start",
    className,
    wrapperClassName,
    id,
    ...props
  },
  ref,
) {
  const generated = useId();
  const inputId = id ?? generated;

  const control = (
    <span className="relative inline-flex shrink-0 items-center">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        role="switch"
        className={cn(
          "peer cursor-pointer appearance-none rounded-full bg-line-strong transition-[background-color,box-shadow] duration-(--dur-settle)",
          "checked:bg-brand checked:shadow-[0_1px_4px_0_rgb(144_53_232/0.4)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          track[switchSize],
          focusRing,
          className,
        )}
        {...props}
      />
      <span
        className={cn(
          "pointer-events-none absolute start-0.5 rounded-full bg-white shadow-sm transition-transform duration-(--dur-settle)",
          "motion-reduce:transition-none",
          thumb[switchSize],
        )}
        aria-hidden
      />
    </span>
  );

  if (!label) return control;

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        align === "between" && "w-full justify-between",
        wrapperClassName,
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <label
          htmlFor={inputId}
          className="cursor-pointer text-[13px] font-medium leading-5 text-fg"
        >
          {label}
        </label>
        {hint ? (
          <span className="text-xs leading-relaxed text-fg-muted">{hint}</span>
        ) : null}
      </span>
      {control}
    </div>
  );
});
