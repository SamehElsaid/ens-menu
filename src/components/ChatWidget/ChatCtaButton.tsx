"use client";

import { FiArrowUpLeft } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { focusRing } from "@/components/ui";

export type ChatCtaVariant = "primary" | "secondary";

type Props = {
  href: string;
  label: string;
  variant?: ChatCtaVariant;
};

/**
 * A link the assistant offers inside a message.
 *
 * Both variants were gradients on coloured glows that lifted and scaled on
 * hover — four effects to say "this is a link". They are now the product's two
 * flat action fills: ink for the one the assistant wants taken, a ruled surface
 * for the alternative.
 */
const variantClasses: Record<ChatCtaVariant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary:
    "border border-line-control bg-surface text-fg hover:border-fg-subtle hover:bg-surface-2",
};

export default function ChatCtaButton({
  href,
  label,
  variant = "primary",
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "chat-link-btn inline-flex w-fit items-center justify-center gap-1.5 rounded-lg px-3 py-1.5",
        "text-[13px] font-medium no-underline",
        "transition-[background-color,border-color,color] duration-(--dur-fast) ease-(--ease-settle)",
        focusRing,
        variantClasses[variant],
      )}
    >
      <span>{label}</span>
      <FiArrowUpLeft size={12} className="shrink-0 opacity-70 rtl:rotate-90" />
    </a>
  );
}
