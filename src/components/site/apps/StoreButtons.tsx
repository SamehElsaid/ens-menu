"use client";

import { FaApple, FaGooglePlay } from "react-icons/fa";
import { cn } from "@/lib/cn";
import { Magnetic } from "@/motion/Magnetic";

/**
 * Store badges for the two app landings.
 *
 * The App Store slot is present but visibly unavailable rather than hidden:
 * an owner on an iPhone should learn in one glance that it is coming, not
 * wonder whether the page forgot to mention it.
 */

const badge =
  "inline-flex min-w-[11.5rem] items-center gap-3 rounded-site-control px-5 py-3 text-start";

export function GooglePlayButton({
  href,
  kicker,
  className,
  magnetic = false,
}: {
  href: string;
  kicker: string;
  className?: string;
  /** Call site 3 of 3 — staff app landing only. Owner app must leave this off. */
  magnetic?: boolean;
}) {
  const button = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        badge,
        "bg-site-ink text-white transition-[transform,background-color] duration-(--dur-settle) ease-(--ease-settle) hover:bg-site-ink/88 motion-safe:hover:-translate-y-px dark:bg-white dark:text-site-bg-ink dark:hover:bg-white/90",
        className,
      )}
    >
      <FaGooglePlay className="size-6 shrink-0" aria-hidden />
      <span className="leading-tight">
        <span className="block text-site-xs opacity-70">{kicker}</span>
        <span className="block text-site-body font-semibold">Google Play</span>
      </span>
    </a>
  );

  return magnetic ? <Magnetic>{button}</Magnetic> : button;
}

export function AppStoreSoon({
  soonLabel,
  className,
}: {
  soonLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        badge,
        "border border-dashed border-site-line text-site-muted",
        className,
      )}
    >
      <FaApple className="size-6 shrink-0" aria-hidden />
      <span className="leading-tight">
        <span className="block text-site-xs text-site-warm">{soonLabel}</span>
        <span className="block text-site-body font-semibold">App Store</span>
      </span>
    </div>
  );
}

/** A phone-shaped frame for real product footage. */
export function PhoneFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative aspect-9/19 overflow-hidden rounded-[2.25rem] border-[9px] border-site-ink bg-site-ink shadow-site-lg",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute top-2.5 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-site-ink"
      />
      {children}
    </div>
  );
}
