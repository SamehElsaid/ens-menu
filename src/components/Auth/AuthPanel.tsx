import type { ReactNode } from "react";
import Logo from "@/components/Global/Logo";
import { cn } from "@/lib/cn";

/**
 * Centred shell for the utility auth screens: reset password, staff sign-in
 * and email verification.
 *
 * These three pages previously each carried their own copy of a nested
 * wrapper plus a drifting-particle background, and used a second logo mark
 * that did not match the site header. One shell, one mark.
 */
export function AuthPanel({
  title,
  description,
  children,
  footer,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-var(--auth-chrome,10rem))] w-full items-center justify-center px-4 py-12 sm:px-6">
      {/* A single soft brand wash anchors the card without competing with it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_50%_-20%,var(--brand-soft),transparent_70%)]"
      />

      <div className={cn("relative w-full max-w-md", className)}>
        <div className="flex justify-center">
          <Logo size="compact" />
        </div>

        <div className="mt-7 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-7">
          {title ? (
            <div className="mb-6 text-center">
              <h1 className="text-lg font-semibold tracking-[-0.014em] text-fg">
                {title}
              </h1>
              {description ? (
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                  {description}
                </p>
              ) : null}
            </div>
          ) : null}

          {children}
        </div>

        {footer ? (
          <div className="mt-5 text-center text-[13px] text-fg-muted">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AuthPanel;
