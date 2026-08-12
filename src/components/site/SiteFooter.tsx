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
 * ink band closes the page — every public route ends on the same anchored
 * surface — and the columns are grouped by what a visitor is trying to do
 * (evaluate the product, get help, check the company) rather than by which
 * team owns the page.
 *
 * The band is the deep violet gradient rather than a flat ink fill, lit from
 * the top edge so the page ends on the same light source it opened with.
 * Column headings are labels in brand-bright, which is the one place the brand
 * appears down here — everything else is quiet type, because a footer that
 * competes for attention is a footer that costs conversions.
 */

const linkClass =
  "inline-block text-site-sm text-site-on-ink-body transition-colors duration-(--dur-settle) hover:text-site-on-ink";

function Column({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="s-ticket text-site-brand-bright">{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <SiteNavLink
              href={link.href}
              prefetch={false}
              className={linkClass}
            >
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
    <footer className="s-on-ink s-grad-deep relative isolate overflow-hidden text-site-on-ink-body">
      {/* A hairline of brand across the very top edge: the seam between the last
          section and the footer is the one place the band needs to announce
          itself, and a full border would just outline a dark rectangle. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-site-brand to-transparent opacity-70"
      />
      <div aria-hidden className="s-bloom opacity-55" />

      <div className="relative mx-auto w-full max-w-(--s-max) px-(--s-gutter) py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-10">
          <div className="max-w-sm sm:col-span-2 lg:col-span-1">
            <SiteLogo onInk />
            <p className="mt-5 text-site-sm leading-relaxed text-site-on-ink-body">
              {t("description")}
            </p>

            {/* Each contact route on its own line with the glyph lit: three
                ways to reach a person, scannable without reading. */}
            <ul className="mt-7 flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${ENSMENU_SUPPORT_EMAIL}`}
                  className="flex items-center gap-3 text-site-sm text-site-on-ink-body transition-colors hover:text-site-on-ink"
                >
                  <FiMail
                    className="size-4 shrink-0 text-site-brand-bright"
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
                  className="flex items-center gap-3 text-site-sm text-site-on-ink-body transition-colors hover:text-site-on-ink"
                >
                  <FaWhatsapp
                    className="size-4 shrink-0 text-site-brand-bright"
                    aria-hidden
                  />
                  <span dir="ltr">{ENSMENU_WHATSAPP_DISPLAY}</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-site-sm">
                <FiMapPin
                  className="size-4 shrink-0 text-site-brand-bright"
                  aria-hidden
                />
                {t("location")}
              </li>
            </ul>

            <ul className="mt-8 flex flex-wrap items-center gap-2">
              {socials.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="flex size-10 items-center justify-center rounded-full border border-site-on-ink-line bg-white/5 text-site-on-ink-body transition-colors duration-(--dur-settle) hover:border-transparent hover:bg-site-brand hover:text-white"
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

        <div className="s-ticket mt-16 flex flex-col-reverse items-start gap-4 border-t border-site-on-ink-line pt-7 text-site-on-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} ENSMENU. {t("copyright")}
          </p>
          <a
            href="https://ens.eg"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-site-on-ink"
          >
            {t("supportTagline")}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
