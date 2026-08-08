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
  settle,
  type ControlSize,
} from "./styles";

/**
 * Shared control chrome. Text inputs always match `:focus-visible`, so the
 * global ring covers pointer focus too; the border shift is the local signal.
 */
export const inputBase = cn(
  "w-full min-w-0 bg-surface text-fg placeholder:text-fg-subtle",
  "border border-line-strong",
  settle,
  "hover:border-fg-subtle focus:border-brand",
  "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-subtle",
  "aria-[invalid]:border-danger aria-[invalid]:hover:border-danger",
  "read-only:bg-surface-2",
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
        hasStart ? "ps-8" : "ps-2.5",
        hasEnd ? "pe-8" : "pe-2.5",
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
          className="pointer-events-none absolute start-2.5 flex items-center text-fg-subtle"
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
          className="absolute end-0.5 flex size-7 items-center justify-center rounded-md text-fg-subtle transition-colors hover:text-fg"
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          tabIndex={-1}
        >
          {revealed ? <FiEyeOff /> : <FiEye />}
        </button>
      ) : endIcon ? (
        <span
          className="pointer-events-none absolute end-2.5 flex items-center text-fg-subtle"
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
          "resize-y rounded-lg px-2.5 py-2 text-sm leading-relaxed",
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
        "flex min-h-9 w-full items-center rounded-lg bg-surface-2 px-2.5 text-sm text-fg sm:min-h-8",
        mono && "font-mono tabular-nums",
        className,
      )}
    >
      {children}
    </div>
  );
}
