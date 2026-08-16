"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { BiSupport } from "react-icons/bi";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { useIsClient } from "@/components/ui/useDialog";
import {
  CONTACT_FAB_TELEGRAM_URL,
  CONTACT_FAB_WHATSAPP_URL,
} from "@/lib/contactConstants";

/**
 * The floating route to a human. Public site only — the dashboard and admin get
 * support from inside the product.
 *
 * The wrapper declares `public-world` itself (with `bg-transparent`). The FAB
 * is portalled to `document.body`, so it lands outside the shell that scopes
 * the public token layer, which is why this control used to carry hardcoded
 * dark and light hex values and a route check to decide which set to use.
 * Claiming the scope removes both — but `.public-world` also paints the page
 * ground, so the transparent override is required or the fixed wrapper shows
 * as a light rectangle behind the rounded pill.
 *
 * A FAB genuinely floats, so it keeps its elevation. The picker is no longer
 * two glowing coloured pills: it is one rounded panel of two rows divided by a
 * rule, with the third-party hue spent on the third-party glyph and nothing
 * else.
 */
export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = useTranslations("contactFab");
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!mounted || isAdminRoute || isDashboardRoute) return null;

  const options = [
    {
      href: CONTACT_FAB_WHATSAPP_URL,
      label: t("whatsapp"),
      icon: <FaWhatsapp className="size-5 shrink-0" aria-hidden />,
      /* Third-party brand hue, on the third-party glyph only. */
      glyph: "text-[#25D366]",
    },
    {
      href: CONTACT_FAB_TELEGRAM_URL,
      label: t("telegram"),
      icon: <FaTelegramPlane className="size-5 shrink-0" aria-hidden />,
      glyph: "text-[#229ED9]",
    },
  ];

  const ui = (
    <div
      ref={wrapRef}
      /* `public-world` brings the site tokens; `bg-transparent` cancels the
         page-ground fill that class also sets — otherwise the wrapper paints a
         light rectangle behind the rounded pill. */
      className="public-world fixed end-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-102 bg-transparent sm:end-6 sm:bottom-6"
    >
      {open && (
        <div
          role="menu"
          aria-label={t("label")}
          className="animate-contact-picker-in absolute end-0 bottom-[calc(100%+0.75rem)] w-max overflow-hidden rounded-site-control border border-site-line bg-site-bg shadow-lg"
        >
          {options.map((opt) => (
            <a
              key={opt.href}
              role="menuitem"
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-t border-site-line px-4 py-3 text-site-sm font-semibold text-site-ink transition-colors duration-(--dur-settle) first:border-t-0 hover:bg-site-tint"
            >
              <span className={opt.glyph}>{opt.icon}</span>
              <span>{opt.label}</span>
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex h-12 items-center gap-2 rounded-full ps-4 pe-5 text-[0.9375rem] font-semibold shadow-lg",
          "bg-site-action text-site-action-fg transition-colors duration-(--dur-settle) hover:bg-site-action-hover",
          "motion-safe:active:translate-y-px",
        )}
      >
        {open ? (
          <FiX className="size-5 shrink-0" aria-hidden />
        ) : (
          <BiSupport className="size-5 shrink-0" aria-hidden />
        )}
        <span>{t("label")}</span>
      </button>
    </div>
  );

  return createPortal(ui, document.body);
}
