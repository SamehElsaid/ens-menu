import { Container } from "@/components/site/primitives";
import SiteLogo from "@/components/site/SiteLogo";
import { cn } from "@/lib/cn";

/**
 * The layout for pages that report a state rather than sell anything: 404,
 * unauthorized, payment result.
 *
 * These routes sit outside the `(main)` group, so they get neither the site
 * chrome nor the `.public-world` scope — this component carries both. It keeps
 * the wordmark (a visitor who lands on a 404 from search needs to know whose
 * site this is) and drops everything else, because the only useful thing on
 * the page is the way out.
 *
 * No illustration. The old 404 drew a torn page in SVG and the old 401 drew
 * three different padlocks; a large code and a sentence say the same thing and
 * translate to every locale for free.
 */

export type StatusTone = "brand" | "positive" | "warm" | "danger";

const CODE_TONE: Record<StatusTone, string> = {
  brand: "text-site-brand",
  positive: "text-site-positive",
  warm: "text-site-warm",
  danger: "text-site-danger",
};

export default function StatusScreen({
  code,
  label,
  title,
  body,
  tone = "brand",
  children,
  footNote,
}: {
  /** Large glyph — an HTTP code, or a mark for a result screen. */
  code: string;
  /** Small caps line beside the code. */
  label?: string;
  title: string;
  body?: React.ReactNode;
  tone?: StatusTone;
  /** Actions. */
  children?: React.ReactNode;
  footNote?: React.ReactNode;
}) {
  return (
    <div className="public-world relative isolate flex min-h-dvh flex-col bg-site-bg">
      <div aria-hidden className="s-aurora" />

      <header className="relative flex h-(--s-header-h) items-center">
        <Container>
          <SiteLogo />
        </Container>
      </header>

      <main className="relative flex flex-1 items-center py-16">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <p
              className={cn(
                "font-site-display text-[clamp(4rem,14vw,7rem)] leading-none font-extrabold tracking-tight tabular-nums",
                CODE_TONE[tone],
              )}
            >
              {code}
            </p>
            {label ? (
              <p className="mt-4 text-site-xs font-semibold tracking-[0.14em] text-site-muted uppercase">
                {label}
              </p>
            ) : null}

            <h1 className="mt-6 text-site-h2">{title}</h1>
            {body ? (
              <div className="mt-4 text-site-body text-site-fg">{body}</div>
            ) : null}

            {children ? (
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {children}
              </div>
            ) : null}

            {footNote ? (
              <p className="mt-8 text-site-xs text-site-muted">{footNote}</p>
            ) : null}
          </div>
        </Container>
      </main>
    </div>
  );
}
