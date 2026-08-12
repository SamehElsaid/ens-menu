import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { FiCheck } from "react-icons/fi";
import SiteLogo from "./SiteLogo";
import { SiteLanguageToggle, SiteThemeToggle } from "./SiteToggles";
import { AuthPhone, type AuthPhoneVariant } from "./auth/AuthPhone";

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
 *
 * The form sits in a bounded panel — header band, body, footer band — on a
 * lightly lit ground, rather than as free-standing text and inputs. A bounded
 * panel tells the visitor how much form there is, which on a five-field sign-up
 * is the difference between filling it in and abandoning it.
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
    <div className="public-world min-h-dvh bg-site-ground lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]">
      <div className="relative isolate flex min-h-dvh flex-col px-(--s-gutter) py-6">
        <div aria-hidden className="s-aurora" />
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
            <div className="overflow-hidden rounded-site-lg border border-site-line bg-site-bg shadow-site-lg">
              {title ? (
                <div className="border-b border-site-line px-5 py-5 sm:px-7 sm:py-6">
                  <h1 className="text-site-h3">{title}</h1>
                  {description ? (
                    <p className="mt-2 text-site-sm text-site-fg">
                      {description}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {/* The one thing on this screen that differs between the five
                  routes, and so the one thing that resolves rather than being
                  simply present. See `.s-auth-body`. */}
              <div className="s-auth-body px-5 py-6 sm:px-7">{children}</div>

              {/* The way out lives in its own band. Inside the body it competed
                  with the submit button for the same glance. */}
              {footer ? (
                <div className="border-t border-site-line bg-site-tint px-5 py-4 text-site-sm text-site-muted sm:px-7">
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      {aside === undefined ? null : (
        /* Sticky + viewport height: the form column can scroll on its own;
           this panel stays put instead of riding down the page with it. */
        <aside className="s-on-ink s-grad-deep relative hidden h-dvh overflow-y-auto lg:sticky lg:top-0 lg:flex lg:flex-col">
          <div aria-hidden className="s-bloom" />
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
    /* Start-aligned, one point per line, each marked rather than ruled: on a
       deep panel a stack of hairlines reads as a table of contents, while a
       small lit medallion per point reads as a claim being confirmed. */
    <div className="relative flex flex-1 flex-col justify-center gap-10 px-10 py-12 xl:px-14">
      <div className="max-w-sm">
        <h2 className="text-site-h3">{title}</h2>
        <ul className="mt-7 flex flex-col gap-4">
          {points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-site-sm text-site-on-ink-body"
            >
              <span
                aria-hidden
                className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-white/12 text-site-brand-bright"
              >
                <FiCheck className="size-3" />
              </span>
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
