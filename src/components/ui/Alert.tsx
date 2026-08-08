import type { ReactNode } from "react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import { cn } from "@/lib/cn";
import { statusTone, type StatusTone } from "./styles";

const defaultIcon: Record<StatusTone, ReactNode> = {
  neutral: <FiInfo />,
  brand: <FiInfo />,
  info: <FiInfo />,
  success: <FiCheckCircle />,
  warning: <FiAlertTriangle />,
  danger: <FiAlertCircle />,
};

export type AlertProps = {
  tone?: StatusTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  /** Trailing action such as Retry or Dismiss. */
  action?: ReactNode;
  className?: string;
};

/**
 * Inline message tied to a region of the page.
 *
 * Errors and warnings announce themselves; informational notes do not, so
 * screen readers are not interrupted by ambient copy.
 */
export function Alert({
  tone = "info",
  title,
  children,
  icon,
  action,
  className,
}: AlertProps) {
  const isUrgent = tone === "danger" || tone === "warning";

  return (
    <div
      role={isUrgent ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5",
        statusTone[tone].soft,
        className,
      )}
    >
      <span
        className={cn("mt-px shrink-0 text-[15px]", statusTone[tone].fg)}
        aria-hidden
      >
        {icon ?? defaultIcon[tone]}
      </span>
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="text-[13px] font-semibold text-current">{title}</p>
        ) : null}
        {children ? (
          <div
            className={cn(
              "text-[13px] leading-relaxed text-current/85",
              Boolean(title) && "mt-0.5",
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
