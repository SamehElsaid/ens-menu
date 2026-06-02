import {
  normalizePhoneNumber,
  PHONE_DISPLAY_CLASS,
} from "@/lib/formatPhone";

type PhoneDisplayProps = {
  value: string | null | undefined;
  className?: string;
  as?: "span" | "p" | "a";
  href?: string;
};

export default function PhoneDisplay({
  value,
  className = "",
  as: Tag = "span",
  href,
}: PhoneDisplayProps) {
  const formatted = normalizePhoneNumber(value);
  if (!formatted) return null;

  const classes = `${PHONE_DISPLAY_CLASS} ${className}`.trim();

  if (Tag === "a" || href) {
    return (
      <a href={href ?? `tel:${formatted}`} className={classes}>
        {formatted}
      </a>
    );
  }

  return <Tag className={classes}>{formatted}</Tag>;
}
