"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  FiArrowLeft,
  FiArrowRight,
  FiExternalLink,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "@/i18n/navigation";
import { getContactInfo, getSocialLinks } from "@/modules/Footer";
import type { ContactInfo } from "@/types/types";
import { cn } from "@/lib/cn";

const WHATSAPP_PRIMARY = "https://wa.me/201500800050";

const PANEL_CARD =
  "overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/60";

function getRowLabel(info: ContactInfo, t: (key: string) => string) {
  if (info.subLabelKey) return t(`phoneTags.${info.subLabelKey}`);
  if (info.labelKey) return t(`labels.${info.labelKey}`);
  return info.value;
}

function CompactAction({
  href,
  label,
  icon: Icon,
  variant,
  external,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "call" | "whatsapp" | "email" | "map";
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold leading-none transition-colors active:scale-[0.98] sm:px-2.5 sm:py-1.5 sm:text-[11px]",
        variant === "call" &&
          "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
        variant === "whatsapp" &&
          "border border-green-500/25 bg-green-500/10 text-green-700 hover:bg-green-500/15 dark:text-green-400",
        variant === "email" &&
          "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
        variant === "map" &&
          "border border-slate-200/80 bg-slate-50 text-slate-700 hover:border-purple-300/60 hover:bg-purple-50 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:text-purple-300",
      )}
    >
      <Icon className="size-2.5 sm:size-3" aria-hidden />
      {label}
    </a>
  );
}

function LinaComingSoonRow({
  t,
  showDivider,
}: {
  t: (key: string) => string;
  showDivider?: boolean;
}) {
  return (
    <div
      className={cn(
        "py-3",
        showDivider && "border-b border-slate-100 dark:border-slate-800/80",
      )}
    >
      <div className="contact-lina-row relative overflow-hidden rounded-xl border border-green-500/15 bg-gradient-to-r from-green-500/[0.08] via-purple-500/[0.06] to-transparent px-3 py-2.5 text-start dark:border-green-500/20 dark:from-green-500/10 dark:via-purple-500/10">
        <div
          aria-hidden
          className="contact-lina-glow pointer-events-none absolute inset-0 opacity-70"
        />
        <div className="relative flex items-start gap-2.5">
          <span className="contact-lina-icon mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400">
            <FaWhatsapp className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-sm font-black text-transparent dark:from-purple-400 dark:to-violet-300 sm:text-[15px]">
                {t("linaWhatsapp.name")}
              </p>
              <span className="inline-flex rounded-full border border-green-500/25 bg-green-500/10 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-green-700 dark:text-green-400">
                {t("linaWhatsapp.badge")}
              </span>
              <span className="inline-flex rounded-full border border-purple-300/40 bg-purple-500/10 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-purple-700 dark:border-purple-500/30 dark:text-purple-300">
                {t("linaWhatsapp.aiBadge")}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t("linaWhatsapp.subtitle")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPhoneRow({
  info,
  label,
  t,
  showDivider,
}: {
  info: ContactInfo;
  label: string;
  t: (key: string) => string;
  showDivider?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[3.5rem] flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
        showDivider && "border-b border-slate-100 dark:border-slate-800/80",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5 text-start">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
          <info.icon className="size-3.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          {info.href ? (
            <a
              href={info.href}
              dir={info.dir ?? "ltr"}
              className="mt-0.5 block text-sm font-bold tabular-nums tracking-tight text-slate-900 transition-colors hover:text-purple-600 dark:text-white dark:hover:text-purple-300"
            >
              {info.value}
            </a>
          ) : (
            <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {info.value}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 ms-10 sm:ms-0 sm:shrink-0">
        {info.href && (
          <CompactAction
            href={info.href}
            label={t("actions.call")}
            icon={FiPhone}
            variant="call"
          />
        )}
        {info.whatsappHref && (
          <CompactAction
            href={info.whatsappHref}
            label={t("actions.whatsapp")}
            icon={FaWhatsapp}
            variant="whatsapp"
            external
          />
        )}
      </div>
    </div>
  );
}

function ContactEmailRow({
  email,
  t,
}: {
  email: ContactInfo;
  t: (key: string) => string;
}) {
  return (
    <div className="flex min-h-[3.5rem] flex-col gap-2 border-t border-slate-100 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 dark:border-slate-800/80">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 text-start">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
          <FiMail className="size-3.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t("labels.email")}
          </p>
          {email.href ? (
            <a
              href={email.href}
              className="mt-0.5 block truncate text-sm font-bold text-slate-900 transition-colors hover:text-purple-600 dark:text-white dark:hover:text-purple-300"
            >
              {email.value}
            </a>
          ) : (
            <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
              {email.value}
            </p>
          )}
        </div>
      </div>
      {email.href && (
        <div className="ms-10 sm:ms-0 sm:shrink-0">
          <CompactAction
            href={email.href}
            label={t("actions.email")}
            icon={FiMail}
            variant="email"
          />
        </div>
      )}
    </div>
  );
}

function ContactInformationPanel({
  contactRows,
  email,
  title,
  t,
}: {
  contactRows: ContactInfo[];
  email?: ContactInfo;
  title: string;
  t: (key: string) => string;
}) {
  return (
    <article className={PANEL_CARD}>
      <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800/80 sm:px-5 sm:py-3">
        <h2
          id="contact-details-heading"
          className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400"
        >
          {title}
        </h2>
      </div>

      <div className="px-4 sm:px-5">
        {contactRows.map((info, index) => {
          const showDivider = index < contactRows.length - 1 || Boolean(email);

          if (info.type === "linaWhatsapp") {
            return (
              <LinaComingSoonRow
                key="lina-whatsapp"
                t={t}
                showDivider={showDivider}
              />
            );
          }

          return (
            <ContactPhoneRow
              key={info.subLabelKey ?? info.labelKey ?? info.value}
              info={info}
              label={getRowLabel(info, t)}
              t={t}
              showDivider={showDivider}
            />
          );
        })}

        {email && <ContactEmailRow email={email} t={t} />}
      </div>
    </article>
  );
}

function LocationPanel({
  info,
  label,
  t,
}: {
  info: ContactInfo;
  label: string;
  t: (key: string) => string;
}) {
  return (
    <article className={cn(PANEL_CARD, "group mt-3")}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 dark:border-slate-800/80 sm:px-5 sm:py-3">
        <div className="min-w-0 text-start">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            {label}
          </h2>
          <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-300">
            {info.value}
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
          <FiMapPin className="size-3.5" aria-hidden />
        </span>
      </div>

      {info.mapEmbedUrl && (
        <div className="border-b border-slate-100 p-3 dark:border-slate-800/80 sm:p-4">
          <div className="contact-map-frame overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/50">
            <iframe
              src={info.mapEmbedUrl}
              title={label}
              className="h-[9.5rem] w-full border-0 sm:h-[10.5rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {info.externalMapUrl && (
        <div className="px-4 py-2.5 sm:px-5 sm:py-3">
          <CompactAction
            href={info.externalMapUrl}
            label={t("actions.openInGoogleMaps")}
            icon={FiExternalLink}
            variant="map"
            external
          />
        </div>
      )}
    </article>
  );
}

function WhatsAppHeroCard({ t }: { t: (key: string) => string }) {
  return (
    <a
      href={WHATSAPP_PRIMARY}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative order-2 overflow-hidden rounded-2xl border border-green-200/80 bg-gradient-to-br from-green-50 via-white to-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md dark:border-green-500/25 dark:from-green-500/15 dark:via-slate-900/50 dark:to-slate-900/50 dark:hover:border-green-400/40 sm:p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute end-0 top-0 h-24 w-24 rounded-full bg-green-400/15 blur-2xl dark:bg-green-400/20"
      />
      <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 text-start">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
            {t("whatsappLabel")}
          </p>
          <h2 className="mt-1.5 text-lg font-black text-slate-900 dark:text-white sm:text-xl">
            {t("whatsappCta")}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("whatsappDescription")}
          </p>
          <p className="mt-2 text-[11px] font-semibold text-green-700/90 dark:text-green-400/90">
            {t("whatsappResponseTime")}
          </p>
        </div>
        <div className="contact-whatsapp-hero-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/25 transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
          <FaWhatsapp className="size-6 sm:size-7" aria-hidden />
        </div>
      </div>
    </a>
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

  const contactRows = contactInfo.filter(
    (info) => info.type === "phone" || info.type === "linaWhatsapp",
  );
  const email = contactInfo.find((info) => info.type === "email");
  const location = contactInfo.find((info) => info.type === "location");

  return (
    <div className="contact-page relative overflow-x-hidden bg-gradient-app pb-12 pt-24 text-slate-900 md:pt-28 dark:text-white">
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

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
            <header className="order-1 max-w-xl text-start">
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

            <WhatsAppHeroCard t={t} />

            <section aria-labelledby="social-heading" className="order-3">
              <h2
                id="social-heading"
                className="mb-2.5 text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400"
              >
                {t("socialTitle")}
              </h2>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="contact-social-card group flex min-h-[5.75rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/90 px-2 py-3 text-center shadow-sm dark:border-slate-700/80 dark:bg-slate-900/60 sm:min-h-[6.25rem] sm:gap-2 sm:px-3 sm:py-4"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100 dark:bg-purple-500/15 dark:text-purple-400 dark:group-hover:bg-purple-500/25">
                      <social.icon className="size-4" aria-hidden />
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 sm:text-xs">
                      {social.name}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </div>

          <section
            aria-labelledby="contact-details-heading"
            className="min-w-0 lg:sticky lg:top-28"
          >
            <ContactInformationPanel
              contactRows={contactRows}
              email={email}
              title={t("detailsTitle")}
              t={t}
            />
            {location && (
              <LocationPanel
                info={location}
                label={t("labels.location")}
                t={t}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
