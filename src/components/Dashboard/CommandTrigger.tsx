"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { FiSearch } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Button, focusRing } from "@/components/ui";

/** The platform never changes under us, so there is nothing to subscribe to. */
const noSubscribe = () => () => {};
const readIsMac = () =>
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
/* Rendered on the server as the Windows/Linux hint, which is what the majority
   of operators see and what hydration can safely correct. */
const serverIsMac = () => false;

/**
 * Opens the command palette — CONSOLE-REDESIGN.md §3.
 *
 * Shaped like an input rather than drawn as a magnifying glass, because an icon
 * gives no hint that the thing behind it can also navigate. Under `sm` there is
 * no room for the shape, so it degrades to the icon.
 */
export function CommandTrigger({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations("Dashboard");
  const isMac = useSyncExternalStore(noSubscribe, readIsMac, serverIsMac);

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "hidden h-8 items-center gap-2 rounded-lg border border-line bg-surface-2 ps-2.5 pe-1.5 md:flex",
          "text-[13px] text-fg-subtle settle hover:border-line-strong hover:text-fg-muted",
          "w-52 lg:w-64",
          focusRing,
        )}
      >
        <FiSearch className="size-3.5 shrink-0" aria-hidden />
        <span className="flex-1 truncate text-start">{t("commandOpen")}</span>
        <kbd className="shrink-0 rounded border border-line bg-surface px-1.5 font-mono text-[10px] leading-5 text-fg-subtle">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <Button
        variant="ghost"
        size="sm"
        iconOnly
        onClick={onOpen}
        aria-label={t("commandOpen")}
        className="md:hidden"
      >
        <FiSearch className="size-4" />
      </Button>
    </>
  );
}

export default CommandTrigger;
