import { getTranslations } from "next-intl/server";
import { FiMail, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { getSocialLinks } from "@/modules/Footer/data";
import {
  ENSMENU_SUPPORT_EMAIL,
  ENSMENU_WHATSAPP_DISPLAY,
  ENSMENU_WHATSAPP_URL,
} from "@/lib/contactConstants";
import SiteLogo from "./SiteLogo";
import { SiteNavLink } from "./SiteNavLink";

/**
 * Public footer.
 *
 * A server component: it is pure content, so it costs the client nothing. The
 * dark band closes the page — every public route ends on the same anchored
 * surface — and the columns are grouped by what a visitor is trying to do
 * (evaluate the product, get help, check the company) rather than by which
 * team owns the page.
 */

const linkClass =
  "inline-block text-site-sm text-site-on-ink-body transition-colors duration-150 hover:text-white";

function Column({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-site-xs font-semibold tracking-[0.08em] text-white/50 uppercase">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <SiteNavLink href={link.href} prefetch={false} className={linkClass}>
              {link.label}
            </SiteNavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SiteFooter() {
  const t = await getTranslations("Landing.footer");
  const tHeader = await getTranslations("header");
  const socials = getSocialLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="s-on-ink relative isolate overflow-hidden bg-site-ink-bg text-site-on-ink-body">
      <div aria-hidden className="s-grid-lines opacity-60" />

      <div className="relative mx-auto w-full max-w-(--s-max) px-(--s-gutter) py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-sm">
            <SiteLogo onInk />
            <p className="mt-5 text-site-sm leading-relaxed text-site-on-ink-body">
              {t("description")}
            </p>

            <ul className="mt-6 space-y-3">
              <li>
                <a
                  href={`mailto:${ENSMENU_SUPPORT_EMAIL}`}
                  className="group inline-flex items-center gap-2.5 text-site-sm text-site-on-ink-body transition-colors hover:text-white"
                >
                  <FiMail
                    className="size-4 shrink-0 text-white/40"
                    aria-hidden
                  />
                  {ENSMENU_SUPPORT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={ENSMENU_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-site-sm text-site-on-ink-body transition-colors hover:text-white"
                >
                  <FaWhatsapp
                    className="size-4 shrink-0 text-white/40"
                    aria-hidden
                  />
                  <span dir="ltr">{ENSMENU_WHATSAPP_DISPLAY}</span>
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5 text-site-sm">
                <FiMapPin
                  className="size-4 shrink-0 text-white/40"
                  aria-hidden
                />
                {t("location")}
              </li>
            </ul>

            <ul className="mt-7 flex flex-wrap items-center gap-2">
              {socials.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="flex size-10 items-center justify-center rounded-site-control border border-site-on-ink-line bg-site-on-ink-raise text-white/70 transition-colors duration-150 hover:border-white/25 hover:bg-white/10 hover:text-white"
                  >
                    <social.icon className="size-[18px]" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Column
            title={tHeader("product")}
            links={[
              { label: tHeader("pricingPage"), href: "/pricing" },
              { label: tHeader("ownerApp"), href: "/ens_owner_app_owner" },
              { label: tHeader("androidApp"), href: "/mobile-app" },
            ]}
          />

          <Column
            title={tHeader("resources")}
            links={[
              { label: tHeader("knowledgeBase"), href: "/knowledge-base" },
              { label: tHeader("faq"), href: "/faq" },
              { label: t("linkContact"), href: "/contact" },
            ]}
          />

          <Column
            title={tHeader("company")}
            links={[
              { label: t("linkAbout"), href: "/about" },
              { label: t("privacy"), href: "/privacy-policy" },
              { label: t("terms"), href: "/terms-and-conditions" },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col-reverse items-start gap-4 border-t border-site-on-ink-line pt-7 text-site-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} ENSMENU. {t("copyright")}
          </p>
          <a
            href="https://ens.eg"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white/80"
          >
            {t("supportTagline")}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
