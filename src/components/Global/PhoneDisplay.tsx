"use client";

import { normalizePhoneNumber, PHONE_DISPLAY_CLASS } from "@/lib/formatPhone";

type PhoneDisplayProps = {
  value: string | null | undefined;
  className?: string;
  as?: "span" | "p" | "a";
  href?: string;
  copyOnClick?: boolean;
  onCopied?: () => void;
  onCopyFailed?: () => void;
  title?: string;
};

export default function PhoneDisplay({
  value,
  className = "",
  as: Tag = "span",
  href,
  copyOnClick = false,
  onCopied,
  onCopyFailed,
  title,
}: PhoneDisplayProps) {
  const formatted = normalizePhoneNumber(value);
  if (!formatted) return null;

  const classes = `${PHONE_DISPLAY_CLASS} ${className}`.trim();

  const handleCopy = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(formatted);
      onCopied?.();
    } catch {
      onCopyFailed?.();
    }
  };

  if (copyOnClick) {
    return (
      <button
        type="button"
        onClick={(event) => void handleCopy(event)}
        className={`${classes} cursor-pointer hover:underline`}
        title={title}
      >
        {formatted}
      </button>
    );
  }

  if (Tag === "a" || href) {
    return (
      <a href={href ?? `tel:${formatted}`} className={classes}>
        {formatted}
      </a>
    );
  }

  return <Tag className={classes}>{formatted}</Tag>;
}
