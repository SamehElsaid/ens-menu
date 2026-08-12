import { FiArrowLeft } from "react-icons/fi";
import {
  Col,
  Container,
  Grid,
  PageHeader,
  Section,
  SiteButtonLink,
} from "@/components/site";
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
  "font-semibold text-site-brand underline underline-offset-4 transition-colors duration-(--dur-settle) ease-(--ease-settle) hover:text-site-brand-hover";

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
                  className="mt-2.5 size-1.5 shrink-0 bg-site-brand"
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
      <PageHeader
        ticket={doc.badge}
        title={doc.title}
        lead={doc.subtitle}
        measure="narrow"
        meta={[
          { label: tocLabel, value: String(doc.sections.length) },
          { label: doc.badge, value: updatedLabel.replace(/^[^:]*:\s*/, "") },
        ]}
        actions={
          <SiteButtonLink href="/" variant="ghost" size="sm">
            <FiArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {backToHome}
          </SiteButtonLink>
        }
      />

      <Section>
        <Container>
          <Grid className="gap-y-10">
            {/* Plain anchors: the browser handles the jump, the hash, the back
                button and keyboard focus better than a scroll handler would.
                The clause numbers are the point of the redesign here — a legal
                document is referred to by number, and neither the index nor the
                headings carried one. */}
            <Col
              span={3}
              className="top-[calc(var(--s-header-h)+2rem)] hidden self-start lg:sticky lg:block"
            >
              {/* The reading rule: how much is left is the one question a
                  reader of a legal document actually has, and a `scroll()`
                  timeline answers it off the main thread for nothing. This
                  replaces the `IntersectionObserver` scroll-spy that used to
                  live here — a spy on forty sections fires constantly and fights
                  the reader during an anchor jump, to tell them something the
                  rule already tells them. */}
              <div className="relative ps-5">
                <span
                  aria-hidden
                  className="absolute inset-y-0 start-0 w-0.5 rounded-full bg-site-line"
                />
                <span
                  aria-hidden
                  className="s-progress-rule-block absolute inset-y-0 start-0 w-0.5 rounded-full bg-site-brand"
                />
                <nav aria-label={tocLabel}>
                  <p className="s-ticket text-site-muted">{tocLabel}</p>
                  <ol className="mt-4 border-t border-site-line">
                    {doc.sections.map((section, index) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="group flex gap-3 border-b border-site-line py-2.5 text-site-sm text-site-fg transition-colors duration-(--dur-settle) ease-(--ease-settle) hover:text-site-ink"
                        >
                          <span className="s-ticket pt-0.5 text-site-muted group-hover:text-site-brand">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {section.heading}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </Col>

            <Col span={8} start={5} className="min-w-0">
              {/* Mobile index: the same links, collapsed, so a phone reader can
                  still jump to a clause without scrolling the whole document. */}
              {/* The same rule, rotated, for the viewport that has no sticky
                  index to put it beside. It sticks under the header so it stays
                  answerable while the prose scrolls past it. */}
              <div
                aria-hidden
                className="sticky top-(--s-header-h) z-10 -mt-1 mb-6 h-0.5 rounded-full bg-site-line lg:hidden"
              >
                <span className="s-progress-rule block h-full rounded-full bg-site-brand" />
              </div>

              <details className="s-accordion group mb-12 overflow-hidden rounded-site-card border border-site-line bg-site-bg shadow-site-sm lg:hidden">
                <summary className="s-ticket flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-site-ink [&::-webkit-details-marker]:hidden">
                  {tocLabel}
                  <span
                    aria-hidden
                    className="relative flex size-6 items-center justify-center rounded-full border border-site-line-strong text-site-fg group-open:border-transparent group-open:bg-site-brand group-open:text-white"
                  >
                    <span className="absolute h-px w-2.5 bg-current" />
                    <span className="absolute h-2.5 w-px bg-current transition-transform duration-(--dur-settle) ease-(--ease-lift) group-open:rotate-90" />
                  </span>
                </summary>
                <ol className="border-t border-site-line">
                  {doc.sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="flex gap-3 border-b border-site-line px-4 py-2.5 text-site-sm text-site-fg last:border-b-0"
                      >
                        <span className="s-ticket pt-0.5 text-site-brand">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>

              <div className="max-w-(--s-max-prose)">
                {doc.sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-[calc(var(--s-header-h)+1.5rem)] border-t border-site-line py-10 first:border-t-0 first:pt-0"
                  >
                    <h2 className="flex items-baseline gap-4 text-site-h3">
                      <span className="s-ticket text-site-brand">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.heading}
                    </h2>
                    <SectionBody
                      body={section.body}
                      isContact={section.id === "contact"}
                    />
                  </section>
                ))}
              </div>

              {/* The one revealing element on the page. The clauses themselves
                  never animate: a clause that fades in as you reach it is a
                  clause `Ctrl+F` cannot find, and a `#section-12` deep link has
                  to land on text that is already fully rendered. */}
              <div className="s-reveal mt-6 rounded-site-card border border-site-brand-line bg-site-brand-tint p-7">
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
            </Col>
          </Grid>
        </Container>
      </Section>
    </>
  );
}
