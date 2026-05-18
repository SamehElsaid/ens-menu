"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  FiArrowLeft,
  FiArrowRight,
  FiExternalLink,
  FiMail,
  FiMessageCircle,
  FiPhone,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "@/i18n/navigation";
import { getContactInfo, getSocialLinks } from "@/modules/Footer";
import type { ContactInfo } from "@/types/types";

const WHATSAPP_PRIMARY = "https://wa.me/201500800050";

const WHATSAPP_BY_TEL: Record<string, string> = {
  "tel:+971586551491": "https://wa.me/971586551491",
  "tel:+201500800050": WHATSAPP_PRIMARY,
};

function ContactCard({
  info,
  label,
  whatsappHref,
  t,
  featured = false,
}: {
  info: ContactInfo;
  label: string;
  whatsappHref?: string;
  t: (key: string) => string;
  featured?: boolean;
}) {
  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300",
        "border-slate-200/80 bg-white/90 shadow-sm",
        "hover:-translate-y-0.5 hover:border-purple-300/60 hover:shadow-md",
        "dark:border-slate-700/80 dark:bg-slate-900/60",
        "dark:hover:border-purple-500/40",
        featured
          ? "border-green-200/80 bg-gradient-to-br from-green-50/90 via-white to-white dark:border-green-500/20 dark:from-green-500/10 dark:via-slate-900/60 dark:to-slate-900/60"
          : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/20" />
      </div>

      <div className="relative z-10 flex flex-col p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-purple-600/80 dark:text-purple-400/80">
              {label}
            </p>
            {info.href ? (
              <a
                href={info.href}
                dir={info.dir}
                className="mt-2 block text-xl font-black tracking-tight text-slate-900 transition-colors hover:text-purple-600 dark:text-white dark:hover:text-purple-300 md:text-2xl"
              >
                {info.value}
              </a>
            ) : (
              <p className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">
                {info.value}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-400">
            <info.icon className="size-5" aria-hidden />
          </div>
        </div>

        {info.href && (
          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            {info.type === "phone" && (
              <>
                <a
                  href={info.href}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-purple-700 active:scale-[0.98]"
                >
                  <FiPhone className="size-3.5" aria-hidden />
                  {t("actions.call")}
                </a>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-xs font-bold text-green-700 transition-all hover:bg-green-500/20 dark:text-green-400 active:scale-[0.98]"
                  >
                    <FaWhatsapp className="size-3.5" aria-hidden />
                    {t("actions.whatsapp")}
                  </a>
                )}
              </>
            )}
            {info.type === "email" && (
              <a
                href={info.href}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-purple-700 active:scale-[0.98]"
              >
                <FiMail className="size-3.5" aria-hidden />
                {t("actions.email")}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function ContactPageView() {
  const t = useTranslations("Landing.contactPage");
  const footerT = useTranslations("Landing.footer");
  const tLegal = useTranslations("legalPages");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const BackIcon = isRtl ? FiArrowRight : FiArrowLeft;

  const contactInfo = useMemo(() => getContactInfo(footerT), [footerT]);
  const socialLinks = useMemo(() => getSocialLinks(), []);

  return (
    <div className="relative overflow-hidden bg-gradient-app pb-12 pt-24 text-slate-900 md:pt-28 dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/15"
          aria-hidden
        />
        <div
          className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-purple-600/10 blur-3xl dark:bg-purple-400/10"
          aria-hidden
        />
        <div
          className="absolute inset-0 hidden bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:56px_56px] dark:block dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-bold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <BackIcon
            className="size-4 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"
            aria-hidden
          />
          {tLegal("backToHome")}
        </Link>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
          {/* العمود الأيسر */}
          <div className="flex flex-col gap-6">
            <header className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-700 dark:border-purple-500/25 dark:bg-purple-500/10 dark:text-purple-300">
                <FiMessageCircle className="size-3.5" aria-hidden />
                {t("eyebrow")}
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                <span className="text-slate-900 dark:text-white">
                  {t("titleBefore")} {t("titleHighlight")}
                </span>
              </h1>

              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 md:text-base">
                {t("description")}
              </p>

              <p className="mt-3 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                <FiMessageCircle
                  className="mt-0.5 size-4 shrink-0 text-purple-500 dark:text-purple-400"
                  aria-hidden
                />
                {t("supportNote")}
              </p>
            </header>

            <a
              href={WHATSAPP_PRIMARY}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-green-200/80 bg-gradient-to-br from-green-50 via-white to-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md dark:border-green-500/25 dark:from-green-500/15 dark:via-slate-900/50 dark:to-slate-900/50 dark:hover:border-green-400/40"
            >
              <div
                className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-green-400/15 blur-2xl dark:bg-green-400/20"
                aria-hidden
              />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
                    {t("whatsappLabel")}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white md:text-2xl">
                    {t("whatsappCta")}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {t("whatsappDescription")}
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/25 transition-transform group-hover:scale-105">
                  <FaWhatsapp className="size-7" aria-hidden />
                </div>
              </div>
            </a>

            <section aria-labelledby="social-heading">
              <h2
                id="social-heading"
                className="mb-3 text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400"
              >
                {t("socialTitle")}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-purple-300/60 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/60 dark:hover:border-purple-500/40"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100 dark:bg-purple-500/15 dark:text-purple-400 dark:group-hover:bg-purple-500/25">
                      <social.icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {social.name}
                    </span>
                    <FiExternalLink
                      className="size-3 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-500"
                      aria-hidden
                    />
                  </a>
                ))}
              </div>
            </section>
          </div>

          {/* العمود الأيمن */}
          <section aria-labelledby="contact-details-heading">
            <h2
              id="contact-details-heading"
              className="mb-4 text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400"
            >
              {t("detailsTitle")}
            </h2>
            <div className="flex flex-col gap-3">
              {contactInfo.map((info, index) => {
                const label = info.labelKey
                  ? t(`labels.${info.labelKey}`)
                  : info.value;
                const whatsappHref =
                  info.href && WHATSAPP_BY_TEL[info.href]
                    ? WHATSAPP_BY_TEL[info.href]
                    : undefined;

                return (
                  <ContactCard
                    key={info.labelKey ?? info.value}
                    info={info}
                    label={label}
                    whatsappHref={whatsappHref}
                    t={t}
                    featured={index === 0}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
