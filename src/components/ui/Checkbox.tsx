"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
  hint?: ReactNode;
  wrapperClassName?: string;
};

type CheckboxProps = ToggleProps & {
  /**
   * "Some but not all" — a select-all box over a partial selection.
   *
   * This is a DOM property rather than an attribute, so it has to be assigned
   * to the node; there is no way to express it in JSX alone.
   */
  indeterminate?: boolean;
};

const boxBase = cn(
  "peer size-[18px] shrink-0 cursor-pointer appearance-none border border-line-control bg-surface",
  "transition-[background-color,border-color,box-shadow] duration-(--dur-settle) ease-(--ease-settle)",
  "hover:border-brand",
  "checked:border-brand checked:bg-brand checked:shadow-[0_1px_3px_0_rgb(144_53_232/0.35)]",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line-control",
  focusRing,
);

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, hint, className, wrapperClassName, id, indeterminate, ...props },
    ref,
  ) {
    const generated = useId();
    const inputId = id ?? generated;
    const innerRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);

    const box = (
      <span className="relative inline-flex items-center">
        <input
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={inputId}
          type="checkbox"
          className={cn(
            boxBase,
            "rounded-md",
            indeterminate &&
              "border-brand bg-brand shadow-[0_1px_3px_0_rgb(144_53_232/0.35)]",
            className,
          )}
          {...props}
        />
        {/* A dash for the partial state and a tick for the full one: the two
            have to be told apart at a glance in a header cell. */}
        {indeterminate ? (
          <span
            aria-hidden
            className="pointer-events-none absolute start-[4px] h-[2px] w-[10px] rounded-full bg-white"
          />
        ) : null}
        <svg
          className={cn(
            "pointer-events-none absolute start-0 size-[18px] scale-75 text-white opacity-0 transition-[opacity,transform] duration-(--dur-settle) ease-(--ease-settle) peer-checked:scale-100 peer-checked:opacity-100",
            indeterminate && "hidden",
          )}
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
            <span className="text-xs leading-relaxed text-fg-muted">
              {hint}
            </span>
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
        className="pointer-events-none absolute start-[5px] size-2 scale-0 rounded-full bg-white transition-transform duration-(--dur-settle) ease-(--ease-settle) peer-checked:scale-100"
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
        "group relative flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface p-3 shadow-2xs",
        "transition-[color,background-color,border-color,box-shadow] duration-(--dur-settle) ease-(--ease-settle) hover:border-brand-line hover:bg-brand-soft/40",
        "has-checked:border-brand has-checked:bg-brand-soft has-checked:shadow-xs",
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
        <span
          className="mt-0.5 shrink-0 text-lg text-fg-muted group-has-checked:text-brand"
          aria-hidden
        >
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
