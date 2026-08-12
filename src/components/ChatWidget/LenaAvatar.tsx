"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";

const AI_AVATAR_SRC = "/images/AiAvatar.webp";

type Props = {
  size?: number;
  className?: string;
  /** For the panel's brand header band, where the page's hairline disappears. */
  variant?: "default" | "onBrand";
};

export default function LenaAvatar({
  size = 36,
  className = "",
  variant = "default",
}: Props) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className={cn(
          "relative size-full overflow-hidden rounded-full bg-surface-2",
          variant === "onBrand"
            ? "border border-on-brand/25"
            : "border border-line",
        )}
      >
        <Image
          src={AI_AVATAR_SRC}
          alt="لينا"
          width={size * 2}
          height={size * 2}
          className="size-full object-cover object-center"
        />
      </div>
    </div>
  );
}
