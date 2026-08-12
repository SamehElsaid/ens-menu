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
 * Opens the command palette from the console utility row.
 *
 * Centred in the header on desktop as an input-shaped control — the primary
 * way to move across 40+ destinations. Below `md` it collapses to an icon so
 * the mobile bar can keep the page title as the main signal.
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
          "group hidden h-9 w-full max-w-md items-center gap-2 rounded-lg border border-line bg-surface-2/80 ps-3 pe-2 md:flex",
          "text-[13px] text-fg-subtle settle",
          "hover:border-brand-line hover:bg-brand-soft/40 hover:text-fg-muted",
          "focus-visible:border-brand focus-visible:bg-surface",
          focusRing,
        )}
      >
        <FiSearch
          className="size-3.5 shrink-0 text-fg-subtle transition-colors duration-(--dur-settle) group-hover:text-brand"
          aria-hidden
        />
        <span className="flex-1 truncate text-start">{t("commandOpen")}</span>
        <kbd className="shrink-0 rounded-md border border-line bg-surface px-1.5 font-mono text-[10px] leading-5 text-fg-subtle transition-colors duration-(--dur-settle) group-hover:border-brand-line">
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
