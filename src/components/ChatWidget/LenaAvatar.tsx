"use client";

import Image from "next/image";

const AI_AVATAR_SRC = "/images/AiAvatar.png";

type Props = {
  size?: number;
  className?: string;
  glow?: boolean;
  variant?: "default" | "onGradient";
};

export default function LenaAvatar({
  size = 36,
  className = "",
  glow = false,
  variant = "default",
}: Props) {
  const ringClass =
    variant === "onGradient"
      ? "border-2 border-white/25 shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
      : "border border-purple-200/80 shadow-md shadow-purple-500/20 dark:border-purple-500/30";

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-accent-purple/30 blur-md"
        />
      )}

      <div
        className={`relative size-full overflow-hidden rounded-full bg-purple-50 ${ringClass} dark:bg-purple-950/40`}
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
