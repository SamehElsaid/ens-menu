"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Global/Logo";
import LegalNavLink from "@/components/Legal/LegalNavLink";
import { Link } from "@/i18n/navigation";
import { MarketingSection, MarketingText } from "@/components/marketing";
import { ds } from "@/lib/designSystem";
import {
  getContactInfo,
  getFooterNavLinks,
  getSocialLinks,
} from "@/modules/Footer";

const FooterSection = () => {
  const t = useTranslations("Landing.footer");
  const currentYear = new Date().getFullYear();

  const navLinks = useMemo(() => getFooterNavLinks(t), [t]);
  const contactInfo = useMemo(() => getContactInfo(t), [t]);
  const socialLinks = useMemo(() => getSocialLinks(), []);

  return (
    <MarketingSection as="footer" id="footer" variant="footer" className="mt-0">
      <div className={ds.footer.inner}>
        <div className={ds.footer.grid}>
          <div className="text-start sm:col-span-2 lg:col-span-1">
            <Logo size="compact" variant="default" />
            <p className={ds.footer.desc}>{t("description")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-slate-400 transition-colors hover:text-purple-600 dark:text-slate-500 dark:hover:text-purple-400"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="text-start">
            <MarketingText as="p" variant="label" className="mb-2.5">
              {t("quickLinks")}
            </MarketingText>
            <ul className="space-y-1.5">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    prefetch={false}
                    className={ds.link.footer}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-start">
        
            <ul className="space-y-1.5">
              {contactInfo.map((info, idx) => {
                if (info.type === "linaWhatsapp") {
                  return null;
                }

                if (info.type === "location" && info.externalMapUrl) {
                  return (
                    <li key={idx}>
                      <a
                        href={info.externalMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${ds.link.footer} block`}
                      >
                        {info.value}
                      </a>
                    </li>
                  );
                }

                if (!info.href) {
                  return null;
                }

                const label =
                  (info.type === "email" || info.type === "whatsapp") &&
                  info.labelKey
                    ? t(info.labelKey)
                    : null;

                return (
                  <li key={idx}>
                    <a
                      href={info.href}
                      dir={info.dir}
                      target={info.type === "whatsapp" ? "_blank" : undefined}
                      rel={
                        info.type === "whatsapp"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className={`${ds.link.footer} block`}
                    >
                      {label ? (
                        <>
                          {label}:{" "}
                          <span dir={info.dir}>{info.value}</span>
                        </>
                      ) : (
                        info.value
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {t("supportTagline")}
            </p>
          </div>
        </div>

        <div className={ds.footer.bar}>
          <p>
            © {currentYear}{" "}
            <a
              href="https://ens.eg/ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 transition-colors hover:text-purple-600 dark:hover:text-purple-400"
            >
              ENSmenu
            </a>
            . {t("copyright")}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <LegalNavLink href="/contact" variant="light">
              {t("linkContact")}
            </LegalNavLink>
            <LegalNavLink href="/privacy-policy" variant="light">
              {t("privacy")}
            </LegalNavLink>
            <LegalNavLink href="/terms-and-conditions" variant="light">
              {t("terms")}
            </LegalNavLink>
          </div>
        </div>
      </div>
    </MarketingSection>
  );
};

export default FooterSection;
