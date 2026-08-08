import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { FiCheck } from "react-icons/fi";
import SiteLogo from "./SiteLogo";
import { SiteLanguageToggle, SiteThemeToggle } from "./SiteToggles";
import {
  AuthPhone,
  type AuthPhoneVariant,
} from "./auth/AuthPhone";

/**
 * The chrome every public auth screen sits in.
 *
 * Sign-in is not a marketing page and does not get the marketing header and
 * footer: nav links and a four-column footer are exits, and this screen has
 * exactly one job. What is left is the mark (which is also the way home), the
 * two controls a visitor may genuinely need here — language and theme — and
 * the form.
 *
 * `aside` is the reassurance panel on the inline end. It only appears from
 * `lg` up, where there is width to spare; below that the form is the whole
 * screen.
 */
export async function AuthShell({
  title,
  description,
  children,
  footer,
  aside,
  width = "default",
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  aside?: ReactNode;
  /** `wide` for the register form, which carries five fields. */
  width?: "default" | "wide";
}) {
  const t = await getTranslations("site.auth");

  return (
    <div className="public-world min-h-dvh bg-site-bg lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]">
      <div className="relative flex min-h-dvh flex-col px-(--s-gutter) py-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_60%_100%_at_50%_-20%,var(--s-brand-tint),transparent_70%)]"
        />

        <header className="flex items-center justify-between gap-3">
          <SiteLogo label={t("backToHome")} />
          <div className="flex items-center gap-1">
            <SiteLanguageToggle />
            <SiteThemeToggle />
          </div>
        </header>

        <main
          id="main"
          className="flex flex-1 flex-col justify-center py-10 sm:py-14"
        >
          <div
            className={
              width === "wide"
                ? "mx-auto w-full max-w-[34rem]"
                : "mx-auto w-full max-w-[25rem]"
            }
          >
            {title ? (
              <div className="mb-8">
                <h1 className="text-site-h2">{title}</h1>
                {description ? (
                  <p className="mt-2.5 text-site-body text-site-fg">
                    {description}
                  </p>
                ) : null}
              </div>
            ) : null}

            {children}

            {footer ? (
              <div className="mt-8 text-site-sm text-site-muted">{footer}</div>
            ) : null}
          </div>
        </main>
      </div>

      {aside === undefined ? null : (
        /* Sticky + viewport height: the form column can scroll on its own;
           this panel stays put instead of riding down the page with it. */
        <aside className="s-on-ink relative hidden h-dvh overflow-y-auto bg-site-ink-bg lg:sticky lg:top-0 lg:flex lg:flex-col">
          <div aria-hidden className="s-grid-lines opacity-70" />
          {aside}
        </aside>
      )}
    </div>
  );
}

/**
 * Default reassurance panel: the product itself, plus the three things that
 * are true of every account. No testimonial, no logo wall, no number — none of
 * those are confirmed, and a sign-up page that invents them is worse than one
 * that shows the thing being signed up for.
 */
export async function AuthAside({
  title,
  points,
  visual,
}: {
  title: string;
  points: string[];
  /** Which phone mock this page shows — never the same picture twice. */
  visual: AuthPhoneVariant;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-12 py-10 text-center xl:px-16">
      <div className="flex max-w-sm flex-col items-center">
        <h2 className="text-site-h3">{title}</h2>
        {/* `inline-flex` + `items-start`: the list is only as wide as its
            longest line, then the parent centres that block as a unit. */}
        <ul className="mt-7 inline-flex flex-col items-start gap-3.5 text-start">
          {points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-site-sm text-site-on-ink-body"
            >
              <FiCheck
                className="mt-0.5 size-4 shrink-0 text-site-brand-bright"
                aria-hidden
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex w-full justify-center">
        <AuthPhone variant={visual} className="w-[15rem]" />
      </div>
    </div>
  );
}

export default AuthShell;
