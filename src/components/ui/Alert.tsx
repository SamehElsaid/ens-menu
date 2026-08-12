import type { ReactNode } from "react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiZap,
} from "react-icons/fi";
import { cn } from "@/lib/cn";
import { statusTone, type StatusTone } from "./styles";

const defaultIcon: Record<StatusTone, ReactNode> = {
  neutral: <FiInfo />,
  brand: <FiInfo />,
  accent: <FiZap />,
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
        "flex items-start gap-3 rounded-xl border px-3.5 py-3",
        statusTone[tone].soft,
        className,
      )}
    >
      {/* Always rendered: the tint alone is hue, and `info` sits only 49° from
          the brand — the glyph is what keeps the two distinguishable. */}
      <span
        className={cn("mt-px shrink-0 text-base", statusTone[tone].fg)}
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
