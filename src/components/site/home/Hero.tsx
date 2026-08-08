import Image from "next/image";
import { useTranslations } from "next-intl";
import { FiArrowLeft, FiArrowRight, FiCheck, FiZap } from "react-icons/fi";
import { SiteButtonLink } from "../Button";
import PhoneMenu from "./PhoneMenu";

/**
 * First viewport.
 *
 * The composition is the argument: the paper menu the owner already has, and
 * the live phone menu it becomes, in one frame. Nothing here claims a result —
 * it shows the before and the after and puts the primary action directly under
 * the headline, where the reading order lands.
 */
export function Hero({ locale }: { locale: string }) {
  const t = useTranslations("site.hero");
  const isRtl = locale === "ar";
  const Arrow = isRtl ? FiArrowLeft : FiArrowRight;

  return (
    <section
      id="hero"
      className="relative isolate -mt-[var(--s-header-h)] overflow-hidden pt-[calc(var(--s-header-h)+3rem)] pb-16 sm:pb-20 lg:pt-[calc(var(--s-header-h)+5rem)] lg:pb-28"
    >
      <div aria-hidden className="s-aurora" />

      <div className="mx-auto grid w-full max-w-[var(--s-max)] items-center gap-14 px-[var(--s-gutter)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10">
        <div className="max-w-2xl text-center lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-site-brand-line bg-site-brand-tint px-3.5 py-1.5 text-site-xs font-semibold text-site-brand-deep">
            <FiZap className="size-3.5" aria-hidden />
            {t("eyebrow")}
          </span>

          <h1 className="mt-6 text-site-display">
            {t("titleLead")}{" "}
            <span className="relative whitespace-nowrap text-site-brand">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-site-lead text-site-fg lg:mx-0">
            {t("lead")}
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <SiteButtonLink href="/auth/register" size="lg">
              {t("primaryCta")}
              <Arrow className="size-4" aria-hidden />
            </SiteButtonLink>
            <SiteButtonLink
              href="/#how-it-works"
              variant="secondary"
              size="lg"
              prefetch={false}
            >
              {t("secondaryCta")}
            </SiteButtonLink>
          </div>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-site-xs text-site-muted lg:justify-start">
            {["freePlan", "noGuestApp", "bilingual"].map((key) => (
              <li key={key} className="inline-flex items-center gap-1.5">
                <FiCheck
                  className="size-3.5 shrink-0 text-site-positive"
                  aria-hidden
                />
                {t(`assurances.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Before and after in one frame: the paper the owner already has,
            beside the menu it becomes. The paper is dropped below `sm` — at
            that width it can only sit under the phone, where it reads as a
            rendering fault rather than an argument. */}
        {/* Fixed width from `sm` up, not `max-w`: the grid track is `auto`, so a
            percentage width would collapse to the phone and swallow the paper. */}
        <div className="relative mx-auto w-full max-w-[19rem] sm:w-[29.5rem] sm:max-w-none">
          <figure className="absolute start-0 top-1/2 z-0 hidden w-[12rem] -translate-y-1/2 -rotate-6 overflow-hidden rounded-site-card border border-site-line bg-white shadow-site sm:block">
            <Image
              src="/images/demo/paper-menu.jpg"
              alt={t("paperAlt")}
              width={520}
              height={720}
              sizes="12rem"
              className="h-auto w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-site-ink-bg/95 via-site-ink-bg/70 to-transparent px-2.5 pt-8 pb-2 text-[10px] font-semibold text-white">
              {t("beforeLabel")}
            </figcaption>
          </figure>

          <div className="relative z-10 flex justify-center sm:justify-end">
            <div className="relative">
              <PhoneMenu priority className="w-[17.5rem] sm:w-[19rem]" />
              <span className="absolute -top-3 start-1/2 z-20 -translate-x-1/2 rounded-full bg-site-positive px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-white shadow-site">
                {t("afterLabel")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
