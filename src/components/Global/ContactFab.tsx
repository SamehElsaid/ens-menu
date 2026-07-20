"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { BiSupport } from "react-icons/bi";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { isRtlLocale } from "@/lib/localeDirection";
import {
  CONTACT_FAB_TELEGRAM_URL,
  CONTACT_FAB_WHATSAPP_URL,
} from "@/lib/contactConstants";

export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const t = useTranslations("contactFab");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  const options = [
    {
      href: CONTACT_FAB_WHATSAPP_URL,
      label: t("whatsapp"),
      icon: <FaWhatsapp className="text-xl" aria-hidden />,
      className:
        "bg-[#25D366] hover:bg-[#20bd5a] shadow-green-500/30",
    },
    {
      href: CONTACT_FAB_TELEGRAM_URL,
      label: t("telegram"),
      icon: <FaTelegramPlane className="text-xl" aria-hidden />,
      className:
        "bg-[#229ED9] hover:bg-[#1d8bc0] shadow-sky-500/30",
    },
  ];

  const ui = (
    <div
      ref={wrapRef}
      className={cn(
        "fixed z-102 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6",
        isRtl ? "start-4 sm:start-6" : "end-4 sm:end-6",
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {open && (
        <div
          role="menu"
          aria-label={t("label")}
          className={cn(
            "animate-contact-picker-in absolute bottom-[calc(100%+0.75rem)] flex w-max flex-col gap-2",
            isRtl ? "start-0" : "end-0",
          )}
        >
          {options.map((opt, i) => (
            <a
              key={opt.href}
              role="menuitem"
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={cn(
                "animate-contact-picker-item flex items-center gap-2.5 rounded-full py-2.5 ps-3 pe-4 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.04] active:scale-[0.96]",
                opt.className,
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </a>
          ))}
        </div>
      )}

      <div className="whatsapp-fab-wrap animate-whatsapp-fab-in">
        {!open && (
          <>
            <span className="whatsapp-fab-ripple" aria-hidden />
            <span
              className="whatsapp-fab-ripple whatsapp-fab-ripple--delay"
              aria-hidden
            />
          </>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t("label")}
          aria-expanded={open}
          aria-haspopup="menu"
          className={cn(
            "whatsapp-fab-btn relative flex size-14 items-center justify-center rounded-full border-2 border-white text-white dark:border-slate-700",
            open ? "bg-slate-600 hover:bg-slate-700" : "bg-[#25D366]",
          )}
        >
          {open ? (
            <FiX className="text-[1.6rem]" aria-hidden />
          ) : (
            <BiSupport className="text-[1.75rem]" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}
