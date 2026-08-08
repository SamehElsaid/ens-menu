import { FiArrowLeft } from "react-icons/fi";
import { Container, Eyebrow, Section, SiteButtonLink } from "@/components/site";
import {
  ENSMENU_SUPPORT_EMAIL,
  ENSMENU_WHATSAPP_DISPLAY,
  ENSMENU_WHATSAPP_URL,
} from "@/lib/contactConstants";

/**
 * Privacy policy and terms.
 *
 * A legal document is read, not browsed, so this is one measured column of
 * prose with a sticky index beside it — no cards, no icons per heading, no
 * gradient behind the paragraphs. The previous version wrapped each clause in
 * a bordered card, which chopped a continuous document into twenty fragments.
 *
 * It is also a server component. The old one shipped a scroll-progress hook,
 * an IntersectionObserver scroll-spy, a per-card reveal observer and two
 * passive scroll listeners to highlight a link; anchors and `scroll-margin`
 * do the same job with no JavaScript at all.
 */

export type LegalSection = { id: string; heading: string; body: string };

export type LegalDocument = {
  title: string;
  subtitle: string;
  badge: string;
  closingCard: string;
  sections: LegalSection[];
};

const linkClass =
  "font-semibold text-site-brand underline underline-offset-4 transition-colors hover:text-site-brand-hover";

/** Turns the contact clause's plain-text email and phone into real links. */
function ContactLine({ content }: { content: string }) {
  if (content.includes(ENSMENU_SUPPORT_EMAIL)) {
    const prefix = content
      .split(ENSMENU_SUPPORT_EMAIL)[0]
      .replace(/:\s*$/, "")
      .trim();
    return (
      <>
        {prefix}:{" "}
        <a href={`mailto:${ENSMENU_SUPPORT_EMAIL}`} className={linkClass}>
          {ENSMENU_SUPPORT_EMAIL}
        </a>
      </>
    );
  }

  const phone = content.match(/\+[\d\s]+/)?.[0]?.trim();
  if (phone || /whatsapp|واتساب/i.test(content)) {
    const number = phone ?? ENSMENU_WHATSAPP_DISPLAY;
    const prefix = content.split(number)[0].replace(/:\s*$/, "").trim();
    return (
      <>
        {prefix}:{" "}
        <a
          href={ENSMENU_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className={`${linkClass} inline-block`}
        >
          {number}
        </a>
      </>
    );
  }

  return <>{content}</>;
}

/**
 * Bodies arrive as newline-separated text where a leading bullet marks a list
 * item. Consecutive bullets are grouped into one `<ul>` so screen readers
 * announce a list of N items rather than N loose paragraphs.
 */
function SectionBody({
  body,
  isContact,
}: {
  body: string;
  isContact: boolean;
}) {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: { type: "p" | "ul"; items: string[] }[] = [];
  for (const line of lines) {
    const isBullet = line.startsWith("•");
    const text = isBullet ? line.slice(1).trim() : line;
    const last = blocks.at(-1);
    if (isBullet && last?.type === "ul") last.items.push(text);
    else blocks.push({ type: isBullet ? "ul" : "p", items: [text] });
  }

  const render = (text: string) =>
    isContact ? <ContactLine content={text} /> : text;

  return (
    <div className="mt-4 space-y-4 text-site-body text-site-fg">
      {blocks.map((block, index) =>
        block.type === "p" ? (
          <p key={index}>{render(block.items[0])}</p>
        ) : (
          <ul key={index} className="space-y-2">
            {block.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2.5 size-1.5 shrink-0 rounded-full bg-site-brand"
                />
                <span>{render(item)}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export default function LegalView({
  doc,
  backToHome,
  updatedLabel,
  tocLabel,
  contactCta,
}: {
  doc: LegalDocument;
  backToHome: string;
  updatedLabel: string;
  tocLabel: string;
  contactCta: string;
}) {
  return (
    <>
      <Section
        size="sm"
        className="isolate -mt-(--s-header-h) pt-[calc(var(--s-header-h)+3rem)] pb-0"
      >
        <div aria-hidden className="s-aurora" />
        <Container>
          <SiteButtonLink href="/" variant="ghost" size="sm">
            <FiArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {backToHome}
          </SiteButtonLink>

          <div className="mt-8 max-w-2xl">
            <Eyebrow>{doc.badge}</Eyebrow>
            <h1 className="mt-5 text-site-h1">{doc.title}</h1>
            <p className="mt-5 text-site-lead text-site-fg">{doc.subtitle}</p>
            <p className="mt-4 text-site-sm text-site-muted">{updatedLabel}</p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[16rem_minmax(0,42rem)] lg:justify-center lg:gap-16">
            {/* Plain anchors: the browser handles the jump, the hash, the back
                button and keyboard focus better than a scroll handler would. */}
            <nav
              aria-label={tocLabel}
              className="top-[calc(var(--s-header-h)+2rem)] hidden self-start lg:sticky lg:block"
            >
              <p className="text-site-xs font-semibold tracking-[0.08em] text-site-muted uppercase">
                {tocLabel}
              </p>
              <ol className="mt-4 space-y-0.5 border-s border-site-line">
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ms-px block border-s border-transparent py-1.5 ps-4 text-site-sm text-site-fg transition-colors duration-150 hover:border-site-brand hover:text-site-brand"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="min-w-0">
              {/* Mobile index: the same links, collapsed, so a phone reader can
                  still jump to a clause without scrolling the whole document. */}
              <details className="group mb-10 rounded-site-card border border-site-line bg-site-tint p-5 lg:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-site-sm font-semibold text-site-ink [&::-webkit-details-marker]:hidden">
                  {tocLabel}
                  <span
                    aria-hidden
                    className="text-site-muted transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <ol className="mt-4 space-y-2">
                  {doc.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="text-site-sm text-site-fg hover:text-site-brand"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>

              <div className="space-y-12">
                {doc.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-[calc(var(--s-header-h)+1.5rem)]"
                  >
                    <h2 className="text-site-h3">{section.heading}</h2>
                    <SectionBody
                      body={section.body}
                      isContact={section.id === "contact"}
                    />
                  </section>
                ))}
              </div>

              <div className="mt-16 rounded-site-card border border-site-line bg-site-tint p-7">
                <p className="text-site-body font-medium text-site-ink">
                  {doc.closingCard}
                </p>
                <SiteButtonLink
                  href="/contact"
                  variant="secondary"
                  className="mt-5"
                >
                  {contactCta}
                </SiteButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
