"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
  hint?: ReactNode;
  wrapperClassName?: string;
};

const boxBase = cn(
  "peer size-4 shrink-0 cursor-pointer appearance-none border border-line-strong bg-surface",
  "transition-[background-color,border-color] duration-[120ms] ease-out",
  "hover:border-brand",
  "checked:border-brand checked:bg-brand",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line-strong",
  focusRing,
);

export const Checkbox = forwardRef<HTMLInputElement, ToggleProps>(
  function Checkbox({ label, hint, className, wrapperClassName, id, ...props }, ref) {
    const generated = useId();
    const inputId = id ?? generated;

    const box = (
      <span className="relative inline-flex items-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(boxBase, "rounded-[4px]", className)}
          {...props}
        />
        <svg
          className="pointer-events-none absolute start-0 size-4 scale-75 text-white opacity-0 transition-[opacity,transform] duration-[120ms] ease-out peer-checked:scale-100 peer-checked:opacity-100"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden
        >
          <path
            d="M4.5 9.25 7.5 12.25 13.5 6.25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );

    if (!label) return box;

    return (
      <div className={cn("flex items-start gap-2.5", wrapperClassName)}>
        <span className="flex h-5 items-center">{box}</span>
        <span className="flex flex-col gap-0.5">
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
      </div>
    );
  },
);

export const Radio = forwardRef<HTMLInputElement, ToggleProps>(function Radio(
  { label, hint, className, wrapperClassName, id, ...props },
  ref,
) {
  const generated = useId();
  const inputId = id ?? generated;

  const box = (
    <span className="relative inline-flex items-center">
      <input
        ref={ref}
        id={inputId}
        type="radio"
        className={cn(boxBase, "rounded-full", className)}
        {...props}
      />
      <span
        className="pointer-events-none absolute start-[4px] size-2 scale-0 rounded-full bg-white transition-transform duration-[120ms] ease-out peer-checked:scale-100"
        aria-hidden
      />
    </span>
  );

  if (!label) return box;

  return (
    <div className={cn("flex items-start gap-2.5", wrapperClassName)}>
      <span className="flex h-5 items-center">{box}</span>
      <span className="flex flex-col gap-0.5">
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
    </div>
  );
});

/**
 * Selectable card for choices that need more than a line of text.
 * Keeps the native input for keyboard and form semantics.
 */
export function ChoiceCard({
  label,
  description,
  icon,
  className,
  ...props
}: ToggleProps & { description?: ReactNode; icon?: ReactNode }) {
  const generated = useId();
  const inputId = props.id ?? generated;
  const isRadio = props.name !== undefined;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group relative flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-surface p-2.5",
        "transition-colors duration-[120ms] ease-out hover:border-brand-line hover:bg-brand-soft/40",
        "has-checked:border-brand has-checked:bg-brand-soft",
        "has-disabled:cursor-not-allowed has-disabled:opacity-50",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
        className,
      )}
    >
      <input
        id={inputId}
        type={isRadio ? "radio" : "checkbox"}
        className="sr-only"
        {...props}
      />
      {icon ? (
        <span className="mt-0.5 shrink-0 text-lg text-fg-muted group-has-checked:text-brand" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] font-medium text-fg">{label}</span>
        {description ? (
          <span className="text-xs leading-relaxed text-fg-muted">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
