"use client";

import { useLocale, useTranslations } from "next-intl";
import { Logo } from "@/components/Global/Logo";
import Link from "next/link";
import { getContactInfo, getNavLinks } from "@/modules/Footer";

const FooterSection = () => {
  const t = useTranslations("Landing.footer");
  const headerT = useTranslations("header");
  const currentYear = new Date().getFullYear();
  const locale = useLocale();

  const navLinks = getNavLinks(headerT);
  const contactInfo = getContactInfo(t);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (path.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(path);
      if (element) {
        const navbarHeight = 100;
        const elementPosition =
          element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <footer
      id="footer"
      className="bg-gray-900 dark:bg-[#0a0e1a] text-gray-300 py-8 relative overflow-hidden border-t border-gray-800 dark:border-gray-900"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <Logo variant="white" />
            </div>
            <p
              className="text-gray-400 dark:text-gray-500 max-w-md mb-6 leading-relaxed text-base"
              suppressHydrationWarning
            >
              {t("description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-lg font-bold mb-6 text-purple-400"
              suppressHydrationWarning
            >
              {t("quickLinks")}
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    onClick={(e) =>
                      !link.external && handleNavClick(e, link.path)
                    }
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-gray-400 dark:text-gray-500 hover:text-purple-400 dark:hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block text-base cursor-pointer"
                    suppressHydrationWarning
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              className="text-lg font-bold mb-6 text-purple-400"
              suppressHydrationWarning
            >
              {t("contactUs")}
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                const content = (
                  <li key={index} className="flex items-center gap-3 group">
                    <Icon className="w-5 h-5 text-purple-400 transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-gray-400 dark:text-gray-500 hover:text-purple-400 dark:hover:text-purple-400 transition-colors text-base"
                        dir={info.dir}
                      >
                        {info.value}
                      </a>
                    ) : (
                      <span
                        className="text-gray-400 dark:text-gray-500 text-base"
                        suppressHydrationWarning
                      >
                        {info.value}
                      </span>
                    )}
                  </li>
                );
                return content;
              })}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 dark:border-gray-900 pt-5">
          <div className="flex flex-col items-center gap-6">
            {/* Copyright - Center & Larger */}
            <p
              className="text-gray-500 dark:text-gray-600 text-base md:text-lg flex items-center gap-2 font-bold"
              suppressHydrationWarning
            >
              © {currentYear}{" "}
              <a
                href="https://ens.eg/ar"
                className="text-purple-400 hover:text-purple-300 transition-colors hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                ENS
              </a>
              {t("copyright")}
            </p>

            {/* Links */}
            <div className="flex gap-8">
              <Link
                href={`/${locale}/privacy-policy`}
                className="text-gray-500 dark:text-gray-600 hover:text-purple-400 dark:hover:text-purple-400 text-sm transition-colors duration-300"
                suppressHydrationWarning
              >
                {t("privacy")}
              </Link>
              <Link
                href={`/${locale}/terms-and-conditions`}
                className="text-gray-500 dark:text-gray-600 hover:text-purple-400 dark:hover:text-purple-400 text-sm transition-colors duration-300"
                suppressHydrationWarning
              >
                {t("terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
