"use client";

import { LogoProps } from "@/types/types";
import { BsQrCode } from "react-icons/bs";
import { cn } from "@/lib/cn";
import LinkTo from "./LinkTo";

/**
 * Product wordmark.
 *
 * The gradient text-clip is gone. A wordmark set in a three-stop gradient has
 * no fixed colour, so it could not be trusted against any of the surfaces it
 * lands on, and it forced the mark to be `text-transparent` — invisible
 * wherever the background failed to paint. It is now foreground type next to a
 * solid brand chip carrying the QR glyph: two flat fills, legible in both
 * themes.
 *
 * The chip is the only mark, and the spin is gone with the gradient — DESIGN.md
 * §5 keeps the product still, and this ran an infinite animation in the header
 * of every dashboard page.
 *
 * `components/site/SiteLogo` remains the marketing counterpart; this one is
 * sized and tokenised for the 48px product header.
 */

type LogoSize = NonNullable<LogoProps["size"]>;

const SIZE_CONFIG: Record<
  LogoSize,
  {
    chip: string;
    glyph: number;
    gap: string;
    align: string;
    maxWidth: string;
    text: string;
    showIcon: boolean;
  }
> = {
  header: {
    chip: "size-6",
    glyph: 13,
    gap: "gap-2",
    align: "items-start text-start",
    maxWidth: "max-w-36",
    text: "text-[13px] leading-none",
    showIcon: true,
  },
  micro: {
    chip: "size-7",
    glyph: 15,
    gap: "gap-2",
    align: "items-start text-start",
    maxWidth: "max-w-[min(48vw,11rem)]",
    text: "text-base leading-tight",
    showIcon: true,
  },
  compact: {
    chip: "size-8",
    glyph: 17,
    gap: "gap-2.5",
    align: "items-start text-start",
    maxWidth: "max-w-[min(72vw,320px)]",
    text: "text-lg leading-tight",
    showIcon: true,
  },
  default: {
    chip: "size-10",
    glyph: 22,
    gap: "gap-3",
    align: "items-center text-center",
    maxWidth: "max-w-[min(72vw,320px)]",
    text: "text-2xl leading-tight lg:text-xl xl:text-3xl",
    showIcon: true,
  },
  small: {
    chip: "",
    glyph: 0,
    gap: "gap-3",
    align: "items-center text-center",
    maxWidth: "max-w-[min(72vw,320px)]",
    text: "text-2xl leading-tight lg:text-xl xl:text-3xl",
    showIcon: false,
  },
};

function LogoTitle({ pageTitle }: { pageTitle?: string }) {
  if (pageTitle) {
    return (
      <span className="inline-flex max-w-full items-center gap-x-2">
        <span className="shrink-0">ENSMENU</span>
        <span
          aria-hidden
          className="hidden h-3 w-px shrink-0 bg-line-strong sm:inline-block"
        />
        <span className="hidden truncate font-semibold text-fg-muted sm:inline sm:max-w-56">
          {pageTitle}
        </span>
      </span>
    );
  }

  return <>ENSMENU</>;
}

export function Logo({
  variant = "default",
  size = "default",
  pageTitle,
  className = "",
}: LogoProps) {
  const config = SIZE_CONFIG[size];
  const onInk = variant === "white";
  const textClass = pageTitle
    ? "text-lg leading-tight lg:text-base xl:text-xl"
    : config.text;

  return (
    <LinkTo
      href="/"
      className={cn(
        "site-logo group flex max-h-10 items-center",
        config.gap,
        size === "header" && "site-logo--header",
        className,
      )}
    >
      {config.showIcon && (
        <span
          aria-hidden
          className={cn(
            "flex shrink-0 items-center justify-center rounded-sm",
            config.chip,
            onInk ? "bg-on-brand text-brand" : "bg-brand text-on-brand",
          )}
        >
          <BsQrCode size={config.glyph} />
        </span>
      )}

      <span className={cn("flex min-w-0 flex-col", config.maxWidth, config.align)}>
        <span
          className={cn(
            "min-w-0 font-bold tracking-[-0.03em] uppercase",
            textClass,
            onInk ? "text-on-brand" : "text-fg",
          )}
        >
          <LogoTitle pageTitle={pageTitle} />
        </span>
      </span>
    </LinkTo>
  );
}

export default Logo;
