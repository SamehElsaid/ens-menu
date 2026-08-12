"use client";

import {
  createContext,
  useContext,
  useId,
  type ReactNode,
  type LabelHTMLAttributes,
} from "react";
import { FiAlertCircle } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { text } from "./styles";

type FieldContextValue = {
  controlId: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Props every field control should spread onto its input element.
 * Returns empty when used outside a `Field`, so controls stay usable standalone.
 */
export function useFieldControl() {
  const ctx = useContext(FieldContext);
  if (!ctx) return {};
  return {
    id: ctx.controlId,
    "aria-describedby": ctx.describedBy,
    "aria-invalid": ctx.invalid || undefined,
    "aria-required": ctx.required || undefined,
    disabled: ctx.disabled || undefined,
  } as const;
}

export function useFieldState() {
  return useContext(FieldContext);
}

export type FieldProps = {
  label?: ReactNode;
  /** Guidance shown before the user acts. */
  hint?: ReactNode;
  /** Names the problem. Replaces the hint while present. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Marks the field explicitly optional instead of marking every other one required. */
  optionalLabel?: string;
  className?: string;
  labelClassName?: string;
  /** Supply when the control renders its own label (checkbox, switch). */
  htmlFor?: string;
  children: ReactNode;
};

/**
 * Wraps a control with its label, hint and error, wiring `htmlFor`,
 * `aria-describedby` and `aria-invalid` automatically.
 *
 * This exists because label association was previously left to visual
 * proximity across most of the app's forms.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  optionalLabel,
  className,
  labelClassName,
  htmlFor,
  children,
}: FieldProps) {
  const generatedId = useId();
  const controlId = htmlFor ?? `${generatedId}-control`;
  const hintId = `${generatedId}-hint`;
  const errorId = `${generatedId}-error`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FieldContext.Provider
      value={{
        controlId,
        describedBy,
        invalid: Boolean(error),
        required,
        disabled,
      }}
    >
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        {label ? (
          <Label
            htmlFor={controlId}
            className={labelClassName}
            required={required}
            optionalLabel={!required ? optionalLabel : undefined}
          >
            {label}
          </Label>
        ) : null}

        {children}

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="flex items-start gap-1.5 text-xs font-medium text-danger"
          >
            {/* An icon beside the message, because the field's red border and
                red text are both hue — on a greyscale or colour-blind screen
                the shape is the only thing left that says "error". */}
            <FiAlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs leading-relaxed text-fg-muted">
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  optionalLabel?: string;
};

/**
 * The field label: sans, sentence case, always above the control and always
 * visible. It sits one weight above body text and one shade below it, which is
 * enough to read as a caption without the uppercase mono the previous
 * direction used — that made an eight-field form look like a receipt.
 */
export function Label({
  className,
  children,
  required,
  optionalLabel,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(text.label, "flex items-center gap-1 text-fg", className)}
      {...props}
    >
      <span>{children}</span>
      {required ? (
        <span className="text-danger" aria-hidden>
          *
        </span>
      ) : optionalLabel ? (
        <span className="font-normal text-fg-subtle">({optionalLabel})</span>
      ) : null}
    </label>
  );
}

/** Standalone hint for layouts that cannot use `Field`. */
export function FieldHint({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs leading-relaxed text-fg-muted", className)}
      {...props}
    >
      {children}
    </p>
  );
}

/** Standalone error for layouts that cannot use `Field`. */
export function FieldError({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className={cn("text-xs font-medium text-danger", className)}
      {...props}
    >
      {children}
    </p>
  );
}

/** Groups related fields under a shared caption. */
export function Fieldset({
  legend,
  description,
  className,
  children,
}: {
  legend: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="text-[13px] font-semibold tracking-[-0.02em] text-fg">
        {legend}
      </legend>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-fg-muted">
          {description}
        </p>
      ) : null}
      {/* A rule under the legend, so a long settings page reads as a stack of
          named groups instead of one continuous run of inputs. */}
      <div className="mt-3 border-t border-line pt-3.5">
        <div className="flex flex-col gap-3.5">{children}</div>
      </div>
    </fieldset>
  );
}
