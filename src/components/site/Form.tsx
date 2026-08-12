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

/**
 * `s-field` carries every state (see `styles/public.css`): a brand border and a
 * soft brand halo on focus, the critical colour when invalid. Saying it once,
 * on the border the eye is already looking at, is what stops a form from
 * looking like a diagram of its own states.
 */
const controlBase =
  "s-field w-full rounded-site-control border border-site-line-strong bg-site-bg text-site-ink " +
  "placeholder:text-site-muted " +
  "disabled:cursor-not-allowed disabled:bg-site-tint disabled:text-site-muted";

/* 16px minimum on the input itself: anything smaller makes iOS Safari zoom the
   viewport on focus, which on a sign-in form reads as the page breaking. */
const controlSize = "h-12 px-3.5 text-[16px] sm:text-site-sm";

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
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="s-ticket flex items-baseline justify-between gap-2 text-site-ink"
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
            <span className="text-site-muted">{optionalLabel}</span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p
          role="alert"
          className="s-field-note flex items-start gap-1.5 text-site-xs font-medium text-site-critical"
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
          className="s-swap size-9 rounded-site-sm text-site-muted transition-colors duration-(--dur-tint) ease-(--ease-settle) hover:bg-site-tint hover:text-site-ink"
        >
          {/* Both glyphs stacked, one faded out. The icon is the control's state,
              so it crossfades rather than being replaced. */}
          <FiEyeOff
            className={cn("size-4", visible ? "opacity-100" : "opacity-0")}
            aria-hidden
          />
          <FiEye
            className={cn("size-4", visible ? "opacity-0" : "opacity-100")}
            aria-hidden
          />
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
          className="peer size-5 shrink-0 cursor-pointer appearance-none rounded-site-sm border border-site-line-strong bg-site-bg transition-colors checked:border-site-action checked:bg-site-action"
          {...props}
        />
        <FiCheck
          aria-hidden
          className="pointer-events-none absolute start-0.5 size-4 text-site-action-fg opacity-0 transition-opacity peer-checked:opacity-100"
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
      /* A tinted panel, no leading bar: the fields it sits above state
         themselves with colour on the border, and a second bar-and-tint grammar
         next to them would read as a different component library. */
      className={cn(
        "flex items-start gap-2.5 rounded-site-control border px-3.5 py-3 text-site-sm",
        tone === "critical" &&
          "border-site-critical/25 bg-site-critical-tint text-site-critical",
        tone === "positive" &&
          "border-site-positive/25 bg-site-positive-tint text-site-positive",
        tone === "info" &&
          "border-site-brand-line bg-site-brand-tint text-site-brand-deep",
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
