"use client";

import {
  forwardRef,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { FiAlertCircle, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "@/lib/cn";

/**
 * Form controls for the public site.
 *
 * These exist instead of reusing `components/ui/Input` and friends: those are
 * shared with every dashboard form, and the auth pages need a marketing-weight
 * control (44px, 16px text so iOS does not zoom on focus) that the product
 * must not inherit.
 */

const controlBase =
  "w-full rounded-site-control border bg-site-bg text-site-ink " +
  "placeholder:text-site-muted " +
  "transition-[border-color,box-shadow,background-color] duration-150 ease-out " +
  "disabled:cursor-not-allowed disabled:bg-site-tint disabled:text-site-muted";

/* 16px minimum on the input itself: anything smaller makes iOS Safari zoom the
   viewport on focus, which on a sign-in form reads as the page breaking. */
const controlSize = "h-12 px-3.5 text-[16px] sm:text-site-sm";

function stateRing(invalid?: boolean) {
  return invalid
    ? "border-site-critical focus:border-site-critical focus:ring-2 focus:ring-site-critical/25"
    : "border-site-line-strong focus:border-site-brand focus:ring-2 focus:ring-site-brand/20";
}

/* -------------------------------------------------------------------------- */

export function Field({
  label,
  hint,
  error,
  required,
  optionalLabel,
  htmlFor,
  className,
  children,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optionalLabel?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="flex items-baseline justify-between gap-2 text-site-sm font-medium text-site-ink"
        >
          <span>
            {label}
            {required ? (
              <span className="text-site-critical" aria-hidden>
                {" *"}
              </span>
            ) : null}
          </span>
          {!required && optionalLabel ? (
            <span className="text-site-xs font-normal text-site-muted">
              {optionalLabel}
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-site-xs font-medium text-site-critical"
        >
          <FiAlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="text-site-xs text-site-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

type InputProps = Omit<ComponentProps<"input">, "size"> & {
  invalid?: boolean;
  startIcon?: ReactNode;
  endSlot?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, startIcon, endSlot, className, ...props },
  ref,
) {
  return (
    <div className="relative">
      {startIcon ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-site-muted"
        >
          {startIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          controlSize,
          stateRing(invalid),
          startIcon ? "ps-11" : null,
          endSlot ? "pe-12" : null,
          className,
        )}
        {...props}
      />
      {endSlot ? (
        <span className="absolute inset-y-0 end-1.5 flex items-center">
          {endSlot}
        </span>
      ) : null}
    </div>
  );
});

/** Password field with a reveal toggle. The toggle is a real button with a
 *  label, so it is reachable and announced rather than a decorative icon. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  InputProps & { showLabel: string; hideLabel: string }
>(function PasswordInput({ showLabel, hideLabel, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      type={visible ? "text" : "password"}
      endSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="flex size-9 items-center justify-center rounded-site-sm text-site-muted transition-colors hover:bg-site-tint hover:text-site-ink"
        >
          {visible ? (
            <FiEyeOff className="size-4" aria-hidden />
          ) : (
            <FiEye className="size-4" aria-hidden />
          )}
        </button>
      }
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea"> & { invalid?: boolean }
>(function Textarea({ invalid, className, rows = 5, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        "px-3.5 py-3 text-[16px] leading-relaxed sm:text-site-sm",
        stateRing(invalid),
        "resize-y",
        className,
      )}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  ComponentProps<"select"> & { invalid?: boolean }
>(function Select({ invalid, className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          controlSize,
          stateRing(invalid),
          "cursor-pointer appearance-none pe-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-site-muted"
      >
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path
            d="M1 1.5 6 6.5l5-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
});

export const Checkbox = forwardRef<
  HTMLInputElement,
  Omit<ComponentProps<"input">, "type"> & { label: ReactNode }
>(function Checkbox({ label, className, id, ...props }, ref) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <span className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border border-site-line-strong bg-site-bg transition-colors checked:border-site-brand checked:bg-site-brand"
          {...props}
        />
        <FiCheck
          aria-hidden
          className="pointer-events-none absolute start-0.5 size-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <label
        htmlFor={inputId}
        className="cursor-pointer text-site-sm leading-snug text-site-fg"
      >
        {label}
      </label>
    </div>
  );
});

/* -------------------------------------------------------------------------- */

export function Alert({
  tone = "critical",
  children,
  className,
}: {
  tone?: "critical" | "positive" | "info";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "critical" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-site-control px-3.5 py-3 text-site-sm",
        tone === "critical" &&
          "bg-site-critical-tint text-site-critical ring-1 ring-site-critical/20 ring-inset",
        tone === "positive" &&
          "bg-site-positive-tint text-site-positive ring-1 ring-site-positive/20 ring-inset",
        tone === "info" &&
          "bg-site-brand-tint text-site-brand-deep ring-1 ring-site-brand-line ring-inset",
        className,
      )}
    >
      {tone === "critical" ? (
        <FiAlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      ) : (
        <FiCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
