"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./Field";
import { inputBase } from "./Input";
import {
  controlHeight,
  controlRadius,
  controlText,
  type ControlSize,
} from "./styles";

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> & {
  inputSize?: ControlSize;
  wrapperClassName?: string;
};

/**
 * Native select with product chrome. Native is deliberate: it gets mobile
 * pickers, keyboard type-ahead and form semantics for free.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { inputSize = "md", className, wrapperClassName, children, ...props },
    ref,
  ) {
    const fieldProps = useFieldControl();
    return (
      <div
        className={cn("relative flex w-full items-center", wrapperClassName)}
      >
        <select
          ref={ref}
          className={cn(
            inputBase,
            "cursor-pointer appearance-none ps-2.5 pe-7",
            controlHeight[inputSize],
            controlText[inputSize],
            controlRadius[inputSize],
            className,
          )}
          {...fieldProps}
          {...props}
        >
          {children}
        </select>
        <FiChevronDown
          className="pointer-events-none absolute end-2 size-3.5 text-fg-subtle"
          aria-hidden
        />
      </div>
    );
  },
);
