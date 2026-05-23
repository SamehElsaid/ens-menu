"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Global/Logo";
import { Link } from "@/i18n/navigation";
import { getContactInfo, getNavLinks, getSocialLinks } from "@/modules/Footer";

const isHomePathname = (pathname: string) => {
  const p = pathname.replace(/\/$/, "") || "/";
  return p === "/" || p === "/en" || p === "/ar";
};

const FooterSection = () => {
  const t = useTranslations("Landing.footer");
  const headerT = useTranslations("header");
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const navLinks = useMemo(() => getNavLinks(headerT), [headerT]);
  const contactInfo = useMemo(() => getContactInfo(t), [t]);
  const socialLinks = useMemo(() => getSocialLinks(), []);

  const scrollToHash = (hash: string) => {
    const element = document.querySelector(hash);
    if (element) {
      const navbarHeight = 100;
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith("/#") && isHomePathname(pathname)) {
      e.preventDefault();
      scrollToHash(path.slice(1));
    }
  };

  const linkStyle = "inline-block text-base text-gray-400 transition-all duration-300 hover:translate-x-1 hover:text-purple-400 dark:text-gray-500 dark:hover:text-purple-400";

  return (
    <footer id="footer" className="relative overflow-hidden border-t border-gray-800 bg-gray-900 py-12 text-gray-300 dark:border-gray-900 dark:bg-[#0a0e1a]">
      {/* Background Decorative Blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 mb-12 md:grid-cols-4">
          
          {/* Column 1: Logo & Info */}
          <div className="md:col-span-1">
            <Logo variant="white" />
            <p className="max-w-xs pt-8 text-base leading-relaxed text-gray-400 dark:text-gray-500">
              {t("description")}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="mb-6 text-lg font-bold text-purple-400">{t("quickLinks")}</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.path}>
                  {link.external ? (
                    <a href={link.path} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                      {link.name}
                    </a>
                  ) : (
                    <Link href={link.path} prefetch={false} onClick={(e) => handleLinkClick(e, link.path)} className={linkStyle}>
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="mb-6 text-lg font-bold text-purple-400">{t("contactUs")}</h4>
            <ul className="space-y-4">
              {contactInfo.map((info, idx) => (
                <li key={idx} className="group flex items-start gap-3">
                  <info.icon className="mt-1 h-5 w-5 flex-shrink-0 text-purple-400 transition-transform group-hover:scale-110" />
                  {info.href ? (
                    <a href={info.href} className="text-gray-400 hover:text-purple-400 transition-colors dark:text-gray-500" dir={info.dir}>
                      {info.value}
                    </a>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">{info.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h4 className="mb-6 text-lg font-bold text-purple-400">{t("followUs")}</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on social media`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:border-purple-500/40 hover:bg-purple-500/20 group"
                >
                  <social.icon className="h-5 w-5 text-gray-400 transition-colors group-hover:scale-110 group-hover:text-purple-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 dark:border-gray-900">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="flex items-center gap-2 text-base font-medium text-gray-500 dark:text-gray-600">
              © {currentYear} 
              <a href="https://ens.eg/ar" target="_blank" className="text-purple-400 hover:underline">ENS</a>
              {t("copyright")}
            </p>
            
            <div className="flex gap-8">
              <Link href="/privacy-policy" prefetch={false} className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
                {t("privacy")}
              </Link>
              <Link href="/terms-and-conditions" prefetch={false} className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
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