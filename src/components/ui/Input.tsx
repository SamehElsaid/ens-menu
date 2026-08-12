"use client";

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import {
  controlHeight,
  controlRadius,
  controlText,
  type ControlSize,
} from "./styles";

/**
 * Shared control chrome.
 *
 * All of the state — rest, hover, focus, invalid, disabled — lives in the
 * `ui-field` class in `globals.css`, because `border-color` written as a
 * Tailwind utility and `border-color` written in a stylesheet rule resolve by
 * source order rather than by specificity, and getting that wrong means focus
 * silently loses to the resting border. See DESIGN.md §10.
 */
export const inputBase = cn(
  "ui-field w-full min-w-0 text-fg placeholder:text-fg-subtle",
  "disabled:text-fg-subtle read-only:bg-surface-2",
);

type Common = {
  inputSize?: ControlSize;
  /** Rendered inside the control's leading edge; decorative only. */
  startIcon?: ReactNode;
  /** Rendered inside the control's trailing edge. */
  endIcon?: ReactNode;
  wrapperClassName?: string;
};

export type InputProps = Common &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    inputSize = "md",
    startIcon,
    endIcon,
    className,
    wrapperClassName,
    type = "text",
    ...props
  },
  ref,
) {
  const fieldProps = useFieldControl();
  const merged = { ...fieldProps, ...props };
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  const hasStart = Boolean(startIcon);
  const hasEnd = Boolean(endIcon) || isPassword;

  const control = (
    <input
      ref={ref}
      type={isPassword && revealed ? "text" : type}
      className={cn(
        inputBase,
        controlHeight[inputSize],
        controlText[inputSize],
        controlRadius[inputSize],
        hasStart ? "ps-9" : "ps-3",
        hasEnd ? "pe-9" : "pe-3",
        className,
      )}
      {...merged}
    />
  );

  if (!hasStart && !hasEnd) {
    return control;
  }

  return (
    <div className={cn("relative flex w-full items-center", wrapperClassName)}>
      {hasStart ? (
        <span
          className="pointer-events-none absolute start-3 flex items-center text-fg-subtle"
          aria-hidden
        >
          {startIcon}
        </span>
      ) : null}
      {control}
      {isPassword ? (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="absolute end-1 flex size-8 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          tabIndex={-1}
        >
          {revealed ? <FiEyeOff /> : <FiEye />}
        </button>
      ) : endIcon ? (
        <span
          className="pointer-events-none absolute end-3 flex items-center text-fg-subtle"
          aria-hidden
        >
          {endIcon}
        </span>
      ) : null}
    </div>
  );
});

export type TextareaProps = Omit<Common, "startIcon" | "endIcon"> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 4, ...props }, ref) {
    const fieldProps = useFieldControl();
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          inputBase,
          "resize-y rounded-lg px-3 py-2.5 text-sm leading-relaxed",
          className,
        )}
        {...fieldProps}
        {...props}
      />
    );
  },
);

/** Read-only value display that matches input geometry — for detail panes. */
export function ReadonlyValue({
  children,
  className,
  mono,
}: {
  children: ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-10 w-full items-center rounded-lg border border-line bg-surface-2 px-3 text-sm text-fg sm:min-h-9",
        mono && "font-mono tabular-nums",
        className,
      )}
    >
      {children}
    </div>
  );
}
