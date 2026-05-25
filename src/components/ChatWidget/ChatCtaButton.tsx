"use client";

import { FiArrowUpLeft } from "react-icons/fi";

export type ChatCtaVariant = "primary" | "secondary";

type Props = {
  href: string;
  label: string;
  variant?: ChatCtaVariant;
};

const variantClasses: Record<ChatCtaVariant, string> = {
  primary:
    "bg-linear-to-r from-accent-purple to-deep-indigo text-white shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/35 ring-1 ring-white/10",
  secondary:
    "border border-purple-200/80 bg-linear-to-r from-purple-50 to-violet-50 text-purple-700 ring-1 ring-purple-100/80 hover:border-purple-300 hover:from-purple-100 hover:to-violet-100 dark:border-purple-500/30 dark:from-purple-500/10 dark:to-violet-500/10 dark:text-purple-300 dark:ring-purple-500/15 dark:hover:border-purple-500/50",
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
      className={`chat-link-btn inline-flex w-fit cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold no-underline transition-all duration-200 hover:scale-[1.04] hover:-translate-y-px active:scale-[0.97] ${variantClasses[variant]}`}
    >
      <span>{label}</span>
      <FiArrowUpLeft size={12} className="shrink-0 opacity-80 rtl:rotate-90" />
    </a>
  );
}
